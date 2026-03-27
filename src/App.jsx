import React, { useState, useEffect, createContext, useContext, Suspense } from 'react';
import { DB, sb } from './supabase';
import { S } from './styles';
import { Toast } from './components/Common';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import { PageSkeleton } from './components/Skeleton';

// Code splitting: heavy pages loaded on demand
const BookingPage = React.lazy(() => import('./components/BookingPage'));
const AuthPage = React.lazy(() => import('./components/AuthPage'));
const MyAppointmentsPage = React.lazy(() => import('./components/MyAppointmentsPage'));
const BarberDashboard = React.lazy(() => import('./components/BarberDashboard'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));

import { useDatabase } from './hooks/useDatabase';

export const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const {
    barbers, services, appointments, schedules, dbWakingUp,
    reloadData,
    addAppointment, updateAptStatus,
    addBarber, updateBarber, deleteBarber,
    addService, updateService, deleteService,
    setScheduleStatus
  } = useDatabase(user, showToast);

  // Inicialização: restaura sessão em background (não bloqueia a UI)
  useEffect(() => {
    let isMounted = true;
    async function init() {
      console.log('🚀 Iniciando App...');
      try {
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
            <span>Conectando ao banco de dados...</span>
          </div>
        )}
        <main>
          <Suspense fallback={<PageSkeleton />}>
            <PageComponent />
          </Suspense>
        </main>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </AppCtx.Provider>
  );
}

export default App;
