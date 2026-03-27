'use client';
import React, { useState, useEffect, createContext, useContext, Suspense } from 'react';
import { DB, sb } from '@/src/supabase';
import { Toast } from '@/src/components/Common';
import { useDatabase } from '@/src/hooks/useDatabase';

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

export default function AppProviders({ children }) {
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const db = useDatabase(user, showToast);

  // Inicialização: restaura sessão em background
  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const sessionUser = await DB.getSession().catch(() => null);
        if (isMounted && sessionUser) {
          setUser(sessionUser);
        }
      } catch (e) {
        console.error('❌ Erro init providers:', e);
      }
    }
    init();
    return () => { isMounted = false; };
  }, []);

  // Listener de auth state
  useEffect(() => {
    const { data: { subscription } } = sb.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        window.location.href = '/';
      }
      if (event === 'SIGNED_IN' && session) {
        const sessionUser = await DB.getSession();
        if (sessionUser) setUser(sessionUser);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await DB.signOut();
    setUser(null);
    window.location.href = '/';
  };

  const ctx = {
    user, setUser, logout: handleLogout,
    ...db,
    showToast,
  };

  return (
    <AppCtx.Provider value={ctx}>
      {children}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </AppCtx.Provider>
  );
}
