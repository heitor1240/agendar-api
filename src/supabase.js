'use client';
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from './config';

if (!CONFIG.supabaseUrl || !CONFIG.supabaseKey) {
  throw new Error('Variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não configuradas.');
}

export const sb = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, {
  auth: {
    persistSession: typeof window !== 'undefined',
    autoRefreshToken: typeof window !== 'undefined',
    detectSessionInUrl: typeof window !== 'undefined',
  },
});

function logError(context, error) {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, error);
  }
}

export const DB = {
  async signUp(email, password, name, phone = '') {
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone },
        emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : '',
      },
    });
    if (error) return { user: null, error };
    if (data.user) {
      await sb.from('profiles').upsert({ id: data.user.id, name, phone, role: 'client' });
    }
    return { user: data.user, error: null };
  },

  async signIn(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      logError('signIn', error);
      return { user: null, error };
    }
    if (!data.user) return { user: null, error: { message: 'Erro desconhecido ao autenticar.' } };

    const [profileRes, barberRes] = await Promise.all([
      sb.from('profiles').select('*').eq('id', data.user.id).maybeSingle(),
      sb.from('barbers').select('id').eq('email', data.user.email).maybeSingle(),
    ]).catch(() => [{ data: null }, { data: null }]);

    let profile = profileRes?.data;
    const barberRec = barberRes?.data;

    if (barberRec && (!profile || profile.role !== 'barber')) {
      const upd = { id: data.user.id, role: 'barber', barber_id: barberRec.id };
      await sb.from('profiles').upsert(upd).catch(() => {});
      profile = { ...profile, ...upd };
    }

    return {
      user: { id: data.user.id, email: data.user.email, role: 'client', ...(profile || {}) },
      error: null,
    };
  },

  async signOut() {
    await sb.auth.signOut();
  },

  async getSession() {
    if (typeof window === 'undefined') return null;
    try {
      const { data: { session }, error } = await sb.auth.getSession();
      if (error || !session) return null;

      const [profileRes, barberRes] = await Promise.all([
        sb.from('profiles').select('*').eq('id', session.user.id).maybeSingle(),
        sb.from('barbers').select('id').eq('email', session.user.email).maybeSingle(),
      ]).catch(() => [{ data: null }, { data: null }]);

      let profile = profileRes?.data;
      const barberRec = barberRes?.data;

      if (barberRec && (!profile || profile.role !== 'barber')) {
        const upd = { id: session.user.id, role: 'barber', barber_id: barberRec.id };
        await sb.from('profiles').upsert(upd).catch(() => {});
        profile = { ...profile, ...upd };
      }

      return { id: session.user.id, email: session.user.email, role: 'client', ...(profile || {}) };
    } catch (e) {
      logError('getSession', e);
      return null;
    }
  },

  async getBarbers() {
    const { data, error } = await sb.from('barbers').select('*').eq('active', true).order('id');
    if (error) { logError('getBarbers', error); throw error; }
    return data || [];
  },

  async getServices() {
    const { data, error } = await sb.from('services').select('*').eq('active', true).order('id');
    if (error) { logError('getServices', error); throw error; }
    return data || [];
  },

  async getSchedules(barber_id, date) {
    const { data, error } = await sb.from('schedules').select('*').eq('barber_id', barber_id).eq('date', date);
    if (error) { logError('getSchedules', error); throw error; }
    return data || [];
  },

  async setScheduleStatus(barber_id, date, time, status) {
    const { data, error } = await sb
      .from('schedules')
      .upsert({ barber_id, date, time, status }, { onConflict: 'barber_id,date,time' })
      .select();
    if (error) logError('setScheduleStatus', error);
    return { data, error };
  },

  async getAppointments(filters = {}) {
    let q = sb.from('appointments').select('*').order('date', { ascending: false }).order('time');
    if (filters.barber_id) q = q.eq('barber_id', filters.barber_id);
    if (filters.client_email) q = q.eq('client_email', filters.client_email);
    if (filters.date_from) q = q.gte('date', filters.date_from);
    if (filters.date_to) q = q.lte('date', filters.date_to);
    if (filters.limit) q = q.limit(filters.limit);
    const { data, error } = await q;
    if (error) { logError('getAppointments', error); throw error; }
    return data || [];
  },

  async addAppointment(apt) {
    const result = await sb.rpc('book_appointment_safe', {
      p_barber_id: apt.barber_id,
      p_service_id: apt.service_id,
      p_date: apt.date,
      p_time: apt.time,
      p_client_name: apt.client_name,
      p_client_email: apt.client_email,
      p_client_phone: apt.client_phone || '',
      p_service_price: apt.service_price,
      p_service_name: apt.service_name,
      p_barber_name: apt.barber_name,
      p_notes: apt.notes || '',
      p_user_id: apt.user_id || null,
    });

    if (result.error) {
      logError('addAppointment:rpc', result.error);
      return { data: null, error: result.error };
    }

    const payload = result.data;
    if (payload?.error) {
      return { data: null, error: { message: payload.error } };
    }

    return { data: payload?.data || null, error: null };
  },

  async updateAppointmentStatus(id, status) {
    const { error } = await sb.from('appointments').update({ status }).eq('id', id);
    if (error) logError('updateAppointmentStatus', error);
    return { error };
  },

  async addBarber(b) {
    const { data, error } = await sb.from('barbers').insert([{
      name: b.name,
      role: b.role || 'Barber',
      bio: b.bio || '',
      email: b.email || '',
      active: true,
    }]).select();
    if (error) { logError('addBarber', error); return { data: null, error }; }
    return { data: data[0], error: null };
  },

  async updateBarber(id, ch) {
    const { data, error } = await sb.from('barbers').update(ch).eq('id', id).select();
    if (error) logError('updateBarber', error);
    return { data: data ? data[0] : null, error };
  },

  async deleteBarber(id) {
    const { error } = await sb.from('barbers').update({ active: false }).eq('id', id);
    if (error) logError('deleteBarber', error);
    return { error };
  },

  async addService(s) {
    const { data, error } = await sb.from('services').insert([{
      name: s.name,
      description: s.description || '',
      price: s.price,
      duration: s.duration || 30,
      active: true,
    }]).select();
    if (error) { logError('addService', error); return { data: null, error }; }
    return { data: data[0], error: null };
  },

  async updateService(id, ch) {
    const { data, error } = await sb.from('services').update(ch).eq('id', id).select();
    if (error) logError('updateService', error);
    return { data: data ? data[0] : null, error };
  },

  async deleteService(id) {
    const { error } = await sb.from('services').update({ active: false }).eq('id', id);
    if (error) logError('deleteService', error);
    return { error };
  },
};
