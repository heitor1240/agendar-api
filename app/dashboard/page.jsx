'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/providers';
import AdminDashboard from '@/src/components/AdminDashboard';
import BarberDashboard from '@/src/components/BarberDashboard';
import MyAppointmentsPage from '@/src/components/MyAppointmentsPage';

export default function DashboardPage() {
  const { user, loading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: 'var(--gold)' }}>
      Carregando...
    </div>
  );

  if (!user) return null;

  if (user.role === 'admin') return <AdminDashboard />;
  if (user.role === 'barber') return <BarberDashboard />;
  
  // Default for clients
  return <MyAppointmentsPage />;
}
