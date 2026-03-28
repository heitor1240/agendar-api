'use client';
import React, { useState, useEffect, createContext, useContext } from 'react';
import { DB, sb } from '@/src/supabase';
import { Toast } from '@/src/components/Common';
import { useDatabase } from '@/src/hooks/useDatabase';

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

export default function AppProviders({ children }) {
  const [user, setUser] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const db = useDatabase(user, showToast);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const sessionUser = await DB.getSession().catch(() => null);
        if (isMounted) {
          if (sessionUser) setUser(sessionUser);
          setSessionLoading(false);
        }
      } catch (e) {
        if (isMounted) setSessionLoading(false);
      }
    }
    init();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const { data: { subscription } } = sb.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSessionLoading(false);
        window.location.href = '/';
      }
      if (event === 'SIGNED_IN' && session) {
        const sessionUser = await DB.getSession();
        if (sessionUser) setUser(sessionUser);
        setSessionLoading(false);
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
    sessionLoading,
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
