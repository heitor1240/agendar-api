import { useState, useEffect, useCallback } from 'react';
import { DB, sb } from '../supabase';
import { today } from '../utils';

export function useDatabase(user, showToast) {
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [dbWakingUp, setDbWakingUp] = useState(false);

  const reloadData = useCallback(async () => {
    try {
      console.log('🔄 Sincronizando dados...');
      
      const fetchWithTimeout = (promise, name, timeout = 10000) => {
        return Promise.race([
          promise,
          new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout em ${name}`)), timeout))
        ]);
      };

      const wakingTimeout = setTimeout(() => {
        if (barbers.length === 0) setDbWakingUp(true);
      }, 5000);

      const [bs, svs, apts] = await Promise.all([
        fetchWithTimeout(DB.getBarbers(), 'Barbeiros', 30000).catch(e => { console.warn(e.message); return null; }), 
        fetchWithTimeout(DB.getServices(), 'Serviços', 30000).catch(e => { console.warn(e.message); return null; }), 
        fetchWithTimeout(DB.getAppointments(), 'Agendamentos', 30000).catch(e => { console.warn(e.message); return null; })
      ]);

      clearTimeout(wakingTimeout);
      setDbWakingUp(false);

      if (bs) setBarbers(bs);
      if (svs) setServices(svs);
      if (apts) setAppointments(apts);

      if (user?.role === 'barber' && user?.barber_id) {
        const sch = await fetchWithTimeout(DB.getSchedules(user.barber_id, today()), 'Agenda', 20000).catch(e => { console.warn(e.message); return []; });
        setSchedules(sch || []);
      }

      console.log('✅ Dados atualizados');
    } catch (err) {
      console.error('❌ Erro na sincronização:', err);
      setDbWakingUp(false);
    }
  }, [user, barbers.length]);

  useEffect(() => {
    reloadData();
  }, [user, reloadData]);

  // Funções de Escrita
  const handleAddAppointment = async (apt) => {
    const { data, error } = await DB.addAppointment(apt);
    if (!error && data) {
      setAppointments(prev => [data, ...prev]);
      showToast('Agendamento realizado!', 'success');
    } else {
      showToast('Erro ao agendar. Tente novamente.', 'error');
    }
    return { data, error };
  };

  const handleUpdateAptStatus = async (id, status) => {
    const { error } = await DB.updateAppointmentStatus(id, status);
    if (!error) {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      showToast('Status atualizado!', 'success');
    } else {
      showToast('Erro ao atualizar status.', 'error');
    }
  };

  const handleAddBarber = async (b) => {
    const { data, error } = await DB.addBarber(b);
    if (!error && data) {
      setBarbers(prev => [...prev, data]);
      showToast('Barbeiro adicionado!', 'success');
    } else {
      showToast('Erro ao adicionar barbeiro.', 'error');
    }
    return { data, error };
  };

  const handleUpdateBarber = async (id, ch) => {
    const { data, error } = await DB.updateBarber(id, ch);
    if (!error && data) {
      setBarbers(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
      showToast('Dados atualizados!', 'success');
    } else {
      showToast('Erro ao atualizar.', 'error');
    }
    return { error };
  };

  const handleDeleteBarber = async (id) => {
    const { error } = await DB.deleteBarber(id);
    if (!error) {
      setBarbers(prev => prev.filter(b => b.id !== id));
      showToast('Barbeiro removido.', 'info');
    } else {
      showToast('Erro ao remover.', 'error');
    }
    return { error };
  };

  const handleAddService = async (s) => {
    const { data, error } = await DB.addService(s);
    if (!error && data) {
      setServices(prev => [...prev, data]);
      showToast('Serviço adicionado!', 'success');
    } else {
      showToast('Erro ao adicionar serviço.', 'error');
    }
    return { data, error };
  };

  const handleUpdateService = async (id, ch) => {
    const { data, error } = await DB.updateService(id, ch);
    if (!error && data) {
      setServices(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
      showToast('Serviço atualizado!', 'success');
    } else {
      showToast('Erro ao atualizar.', 'error');
    }
    return { error };
  };

  const handleDeleteService = async (id) => {
    const { error } = await DB.deleteService(id);
    if (!error) {
      setServices(prev => prev.filter(s => s.id !== id));
      showToast('Serviço removido.', 'info');
    } else {
      showToast('Erro ao remover.', 'error');
    }
    return { error };
  };

  const handleSetScheduleStatus = async (barber_id, date, time, status) => {
    const { data, error } = await DB.setScheduleStatus(barber_id, date, time, status);
    if (!error && data) {
      setSchedules(prev => {
        const index = prev.findIndex(s => s.barber_id === barber_id && s.date === date && s.time === time);
        if (index !== -1) {
          const newSchedules = [...prev];
          newSchedules[index] = data[0];
          return newSchedules;
        }
        return [...prev, data[0]];
      });
      showToast(status === 'blocked' ? 'Horário bloqueado' : 'Horário liberado', 'info');
    } else {
      showToast('Erro ao alterar horário.', 'error');
    }
    return { data, error };
  };

  return {
    barbers, services, appointments, schedules, dbWakingUp,
    reloadData,
    addAppointment: handleAddAppointment,
    updateAptStatus: handleUpdateAptStatus,
    addBarber: handleAddBarber, updateBarber: handleUpdateBarber, deleteBarber: handleDeleteBarber,
    addService: handleAddService, updateService: handleUpdateService, deleteService: handleDeleteService,
    setScheduleStatus: handleSetScheduleStatus
  };
}
