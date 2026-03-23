import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CONFIG } from './config';
import { today } from './utils';
import { DB, sb } from './supabase';
import { S } from './styles';
import { Toast } from './components/Common';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import BookingPage from './components/BookingPage';
import AuthPage from './components/AuthPage';
import MyAppointmentsPage from './components/MyAppointmentsPage';
import BarberDashboard from './components/BarberDashboard';
import AdminDashboard from './components/AdminDashboard';

import { useDatabase } from './hooks/useDatabase';

export const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [loadingApp, setLoadingApp] = useState(true);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const {
    barbers, services, appointments, schedules, dbWakingUp,
    reloadData,
    addAppointment, updateAptStatus,
    addBarber, updateBarber, deleteBarber,
    addService, updateService, deleteService,
    setScheduleStatus
  } = useDatabase(user, showToast);

  // Inicialização: restaura sessão
  useEffect(() => {
    let isMounted = true;
    async function init() {
      console.log('🚀 Iniciando App...');

      const loadingTimeout = setTimeout(() => {
        if (isMounted) {
          setLoadingApp(false);
          console.log('⏱️ Interface liberada');
        }
      }, 3000);

      try {
        DB.warmup();
        const sessionUser = await DB.getSession().catch(e => {
          console.warn('⚠️ Sessão offline:', e.message);
          return null;
        });

        if (isMounted && sessionUser) {
          console.log('👤 Usuário logado:', sessionUser.email);
          setUser(sessionUser);
        }
      } catch (e) {
        console.error('❌ Erro crítico init:', e);
      }
    }
    init();
    return () => { isMounted = false; };
  }, []);

  // Listener de auth state
  useEffect(() => {
    const { data: { subscription } } = sb.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') { setUser(null); setPage('home'); }
      if (event === 'SIGNED_IN' && session) {
        const sessionUser = await DB.getSession();
        if (sessionUser) setUser(sessionUser);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => { await DB.signOut(); setUser(null); setPage('home'); };

  if (loadingApp) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, color: 'var(--gold)', letterSpacing: 3 }}>{CONFIG.shopName}</span>
      <div style={{ width: 36, height: 36, border: '2px solid #2A2520', borderTop: '2px solid var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  );

  const ctx = {
    page, setPage, user, setUser, logout: handleLogout,
    barbers, services, appointments, schedules,
    reloadData,
    addAppointment, updateAptStatus,
    addBarber, updateBarber, deleteBarber,
    addService, updateService, deleteService,
    setScheduleStatus,
    showToast,
  };

  const pages = { home: LandingPage, booking: BookingPage, auth: AuthPage, 'my-appointments': MyAppointmentsPage, 'barber-dashboard': BarberDashboard, admin: AdminDashboard };
  const PageComponent = pages[page] || LandingPage;

  return (
    <AppCtx.Provider value={ctx}>
      <div style={S.page}>
        <Header />
        {dbWakingUp && (
          <div style={{ background: 'var(--surface)', color: 'var(--gold)', padding: '12px 20px', textAlign: 'center', fontSize: 13, borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid transparent', borderTop: '2px solid var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginRight: 10, verticalAlign: 'middle' }} />
            <span>Conectando ao banco de dados... (isso pode levar 30s no primeiro acesso)</span>
          </div>
        )}
        <main><PageComponent /></main>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </AppCtx.Provider>
  );
}

export default App;
