import { createClient } from '@supabase/supabase-js';
import { CONFIG, ADMIN_USER } from './config';

// Inicialização direta e única
export const sb = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export const DB = {
  async signUp(email, password, name, phone = '') {
    const { data, error } = await sb.auth.signUp({
      email, password,
      options: {
        data: { name, phone },
        emailRedirectTo: window.location.origin
      }
    });
    if (error) return { user: null, error };
    if (data.user) {
      await sb.from('profiles').upsert({
        id: data.user.id, name, phone, role: 'client'
      });
    }
    return { user: data.user, error: null };
  },

  async signIn(email, password) {
    try {
      console.log('🔑 Tentando login...');

      // Tenta autenticar com timeout de 8s
      const loginPromise = sb.auth.signInWithPassword({ email, password });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 8000));

      let result;
      try {
        result = await Promise.race([loginPromise, timeoutPromise]);
      } catch (e) {
        console.error('❌ Login demorou demais ou falhou:', e.message);
        // Fallback para Admin local imediato se o timeout ocorrer ou falhar
        if (email === CONFIG.adminEmail && password === CONFIG.adminPassword) {
          localStorage.setItem('barberpro_local_user', JSON.stringify(ADMIN_USER));
          return { user: ADMIN_USER, error: null };
        }
        return { user: null, error: { message: 'Servidor demorou a responder. Tente novamente.' } };
      }

      const { data, error } = result;

      if (error) {
        console.error('❌ Erro no Supabase Auth:', error.message);
        // Fallback para Admin local se o banco falhar
        if (email === CONFIG.adminEmail && password === CONFIG.adminPassword) {
          localStorage.setItem('barberpro_local_user', JSON.stringify(ADMIN_USER));
          return { user: ADMIN_USER, error: null };
        }
        return { user: null, error };
      }

      if (data.user) {
        localStorage.removeItem('barberpro_local_user');

        // Busca perfil e barber_id com timeout também
        const queriesPromise = Promise.all([
          sb.from('profiles').select('*').eq('id', data.user.id).maybeSingle(),
          sb.from('barbers').select('id').eq('email', data.user.email).maybeSingle()
        ]);

        const [profileRes, barberRes] = await Promise.race([
          queriesPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT_DATA')), 6000))
        ]).catch(() => [{ data: null }, { data: null }]); // Fallback se os dados secundários demorarem

        let profile = profileRes.data;
        const barberRec = barberRes.data;

        if (barberRec && (!profile || profile.role !== 'barber')) {
          const upd = { id: data.user.id, role: 'barber', barber_id: barberRec.id, email: data.user.email };
          // Upsert sem esperar (fire and forget) para não atrasar o login
          sb.from('profiles').upsert(upd).then(() => { });
          profile = { ...profile, ...upd };
        }

        return { user: { id: data.user.id, email: data.user.email, ...(profile || { role: 'client' }) }, error: null };
      }
    } catch (e) {
      console.error('❌ Erro de conexão:', e);
      return { user: null, error: { message: 'Erro de conexão com o banco de dados' } };
    }
    return { user: null, error: { message: 'Erro desconhecido' } };
  },

  async signOut() {
    localStorage.removeItem('barberpro_local_user');
    await sb.auth.signOut();
  },

  async getSession() {
    const local = localStorage.getItem('barberpro_local_user');
    if (local) return JSON.parse(local);

    try {
      // Timeout de 5s para não travar a inicialização
      const sessionPromise = sb.auth.getSession();
      const { data: { session } } = await Promise.race([
        sessionPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('SESSION_TIMEOUT')), 5000))
      ]);
      if (!session) return null;

      const [profileRes, barberRes] = await Promise.race([
        Promise.all([
          sb.from('profiles').select('*').eq('id', session.user.id).maybeSingle(),
          sb.from('barbers').select('id').eq('email', session.user.email).maybeSingle()
        ]),
        new Promise((_, reject) => setTimeout(() => reject(new Error('PROFILE_TIMEOUT')), 5000))
      ]).catch(() => [{ data: null }, { data: null }]);

      let profile = profileRes.data;
      const barberRec = barberRes.data;

      if (barberRec && (!profile || profile.role !== 'barber')) {
        const upd = { id: session.user.id, role: 'barber', barber_id: barberRec.id, email: session.user.email };
        sb.from('profiles').upsert(upd).then(() => { });
        profile = { ...profile, ...upd };
      }

      return { id: session.user.id, email: session.user.email, role: 'client', ...profile };
    } catch (e) {
      console.warn('⚠️ Sessão timeout ou offline:', e.message);
      return null;
    }
  },

  async getBarbers() {
    const { data, error } = await sb.from('barbers').select('*').eq('active', true).order('id');
    if (error) throw error;
    return data || [];
  },

  async getServices() {
    const { data, error } = await sb.from('services').select('*').eq('active', true).order('id');
    if (error) throw error;
    return data || [];
  },

  async getSchedules(barber_id, date) {
    const { data, error } = await sb.from('schedules').select('*').eq('barber_id', barber_id).eq('date', date);
    if (error) throw error;
    return data || [];
  },

  async setScheduleStatus(barber_id, date, time, status) {
    const { data, error } = await sb.from('schedules').upsert({ barber_id, date, time, status }, { onConflict: 'barber_id,date,time' }).select();
    return { data, error };
  },

  async getAppointments(filters = {}) {
    let q = sb.from('appointments').select('*').order('date', { ascending: false }).order('time');
    if (filters.barber_id) q = q.eq('barber_id', filters.barber_id);
    if (filters.client_email) q = q.eq('client_email', filters.client_email);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },

  async addAppointment(apt) {
    const { id: _ignore, ...aptData } = apt;
    const { data, error } = await sb.from('appointments').insert(aptData).select().single();
    return { data, error };
  },

  async updateAppointmentStatus(id, status) {
    const { error } = await sb.from('appointments').update({ status }).eq('id', id);
    return { error };
  },

  async addBarber(b) {
    console.log('📝 Inserindo barbeiro:', b);
    const { data, error } = await sb.from('barbers').insert([{
      name: b.name,
      role: b.role || 'Barber',
      bio: b.bio || '',
      email: b.email || '',
      active: true
    }]).select();

    if (error) {
      console.error('❌ Erro ao adicionar barbeiro:', error);
      return { data: null, error };
    }

    console.log('✅ Barbeiro adicionado:', data);
    return { data: data[0], error: null };
  },

  async updateBarber(id, ch) {
    console.log('📝 Atualizando barbeiro:', id, ch);
    const { data, error } = await sb.from('barbers').update(ch).eq('id', id).select();
    if (error) console.error('❌ Erro ao atualizar barbeiro:', error);
    return { data: data ? data[0] : null, error };
  },

  async deleteBarber(id) {
    console.log('🗑️ Desativando barbeiro:', id);
    const { error } = await sb.from('barbers').update({ active: false }).eq('id', id);
    if (error) console.error('❌ Erro ao remover barbeiro:', error);
    return { error };
  },

  async addService(s) {
    console.log('📝 Inserindo serviço:', s);
    const { data, error } = await sb.from('services').insert([{
      name: s.name,
      description: s.description || '',
      price: s.price,
      duration: s.duration || 30,
      active: true
    }]).select();

    if (error) {
      console.error('❌ Erro ao adicionar serviço:', error);
      return { data: null, error };
    }

    console.log('✅ Serviço adicionado:', data);
    return { data: data[0], error: null };
  },

  async updateService(id, ch) {
    console.log('📝 Atualizando serviço:', id, ch);
    const { data, error } = await sb.from('services').update(ch).eq('id', id).select();
    if (error) console.error('❌ Erro ao atualizar serviço:', error);
    return { data: data ? data[0] : null, error };
  },

  async deleteService(id) {
    console.log('🗑️ Desativando serviço:', id);
    const { error } = await sb.from('services').update({ active: false }).eq('id', id);
    if (error) console.error('❌ Erro ao remover serviço:', error);
    return { error };
  },
};
