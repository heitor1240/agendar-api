'use client';
import React, { useState } from 'react';
import { fmtPrice, fmtDate, today } from '../utils';
import { S } from '../styles';
import { StatusBadge, Modal } from './Common';
import { useApp } from '@/app/providers';

export default function MyAppointmentsPage() {
  const { user, appointments, updateAptStatus, showToast } = useApp();
  const [cancelTarget, setCancelTarget] = useState(null);
  const myApts = appointments
    .filter(a => a.client_email === user?.email)
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    await updateAptStatus(cancelTarget, 'cancelled');
    setCancelTarget(null);
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={S.sectionTitle}>Meus Agendamentos</h1>
      <p style={S.sectionSub}>Histórico dos seus atendimentos</p>
      {myApts.length === 0 ? (
        <div style={{ ...S.card, textAlign: 'center', padding: 48 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>Você ainda não tem agendamentos.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {myApts.map(a => (
            <div key={a.id} style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 17, color: 'var(--text)' }}>{a.service_name}</h3>
                    <StatusBadge status={a.status} />
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>✂️ {a.barber_name}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>📅 {fmtDate(a.date)} às {typeof a.time === 'string' ? a.time.substring(0,5) : a.time}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>{fmtPrice(a.service_price)}</div>
                  {a.status === 'confirmed' && a.date >= today() && (
                    <button onClick={() => setCancelTarget(a.id)} style={{ ...S.ghostBtn, fontSize: 12, padding: '6px 12px', color: 'var(--danger)', borderColor: 'var(--danger)' }}>Cancelar</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {cancelTarget && (
        <Modal title="Cancelar agendamento" onClose={() => setCancelTarget(null)} width={380}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
            Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setCancelTarget(null)} style={{ ...S.ghostBtn, flex: 1 }}>Voltar</button>
            <button onClick={confirmCancel} style={{ ...S.ghostBtn, flex: 1, color: 'var(--danger)', borderColor: 'var(--danger)' }}>Confirmar cancelamento</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
