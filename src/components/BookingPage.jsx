import React, { useState, useEffect } from 'react';
import { fmtPrice, fmtDate, today, addDays, generateTimeSlots } from '../utils';
import { S } from '../styles';
import { Avatar, FormField } from './Common';
import { BarberListSkeleton, ServiceListSkeleton } from './Skeleton';
import { useApp } from '../App';

export default function BookingPage() {
  const { user, setPage, barbers, services, appointments, addAppointment, showToast, schedules } = useApp();
  const [step, setStep] = useState(1);
  const [sel, setSel] = useState({ barber: null, service: null, date: today(), time: null });
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '', notes: '' });
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sel.barber && sel.date) {
      const taken = appointments
        .filter(a => String(a.barber_id) === String(sel.barber.id) && a.date === sel.date && a.status !== 'cancelled')
        .map(a => typeof a.time === 'string' ? a.time.substring(0, 5) : a.time);
      const blocked = schedules
        .filter(s => String(s.barber_id) === String(sel.barber.id) && s.date === sel.date && s.status === 'blocked')
        .map(s => typeof s.time === 'string' ? s.time.substring(0, 5) : s.time);
      setBookedSlots([...taken, ...blocked]);
    }
  }, [sel.barber, sel.date, appointments, schedules]);

  const slots = generateTimeSlots();
  const canNext = () => {
    if (step === 1) return !!sel.barber;
    if (step === 2) return !!sel.service;
    if (step === 3) return !!sel.date && !!sel.time;
    return false;
  };

  const handleConfirm = async () => {
    if (!user && (!form.name || !form.email)) { showToast('Preencha seu nome e e-mail', 'error'); return; }
    setLoading(true);
    const apt = {
      barber_id: sel.barber.id,
      barber_name: sel.barber.name,
      service_id: sel.service.id,
      service_name: sel.service.name,
      service_price: sel.service.price,
      date: sel.date,
      time: sel.time + ':00',
      client_name: user?.name || form.name,
      client_email: user?.email || form.email,
      client_phone: user?.phone || form.phone,
      notes: form.notes,
      status: 'confirmed',
    };
    const { data, error } = await addAppointment(apt);
    if (error) {
      showToast(error.message || 'Erro ao agendar. Tente novamente.', 'error');
    } else {
      showToast('Agendamento confirmado! ✓', 'success');
      setStep(5);
    }
    setLoading(false);
  };

  const steps = ['Barbeiro', 'Serviço', 'Data & Hora', 'Confirmar'];

  return (
    <div className="container" style={{ padding: '24px 16px' }}>
      <button onClick={() => setPage('home')} style={{ ...S.ghostBtn, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px' }}>← Voltar</button>

      {step < 5 && <>
        <h1 style={{ ...S.sectionTitle, fontSize: 'clamp(24px,6vw,28px)' }}>Agendar Horário</h1>
        <p style={{ ...S.sectionSub, marginBottom: 24 }}>Siga os passos para seu atendimento</p>
        <div style={{ display: 'flex', marginBottom: 32, gap: 4 }}>
          {steps.map((s, i) => {
            const num = i + 1; const active = step === num; const delay = step > num;
            return (
              <React.Fragment key={i}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, background: (delay || active) ? 'var(--gold)' : 'var(--dark3)', color: (delay || active) ? '#000' : 'var(--text-dim)' }}>
                    {delay ? '✓' : num}
                  </div>
                  <div className="mobile-hide" style={{ fontSize: 10, color: active ? 'var(--gold)' : 'var(--text-dim)', fontWeight: active ? 600 : 400, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s}</div>
                </div>
                {i < steps.length - 1 && <div style={{ flex: 0.5, height: 1, background: step > i + 1 ? 'var(--gold)' : 'var(--dark4)', alignSelf: 'center', marginBottom: active || delay ? 0 : 0 }} />}
              </React.Fragment>
            );
          })}
        </div>
      </>}

      {step === 1 && (
        barbers.length === 0 ? <BarberListSkeleton /> : (
        <div style={{ display: 'grid', gap: 12 }}>
          {barbers.map(b => (
            <div key={b.id} onClick={() => setSel(p => ({ ...p, barber: b }))}
              style={{ ...S.card, padding: 16, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', borderColor: sel.barber?.id === b.id ? 'var(--gold)' : '#2A2520' }}>
              <Avatar name={b.name} size={50} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 16, color: 'var(--text)', marginBottom: 2 }}>{b.name}</h3>
                <p style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 1, textTransform: 'uppercase' }}>{b.role}</p>
              </div>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${sel.barber?.id === b.id ? 'var(--gold)' : 'var(--dark4)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {sel.barber?.id === b.id && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--gold)' }} />}
              </div>
            </div>
          ))}
        </div>
        )
      )}

      {step === 2 && (
        services.length === 0 ? <ServiceListSkeleton /> : (
        <div style={{ display: 'grid', gap: 12 }}>
          {services.map(s => (
            <div key={s.id} onClick={() => setSel(p => ({ ...p, service: s }))}
              style={{ ...S.card, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderColor: sel.service?.id === s.id ? 'var(--gold)' : '#2A2520' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 16, color: 'var(--text)', marginBottom: 2 }}>{s.name}</h3>
                <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>⏱ {s.duration} min</p>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 18, color: 'var(--gold)', fontWeight: 600 }}>{fmtPrice(s.price)}</div>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${sel.service?.id === s.id ? 'var(--gold)' : 'var(--dark4)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {sel.service?.id === s.id && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--gold)' }} />}
                </div>
              </div>
            </div>
          ))}
        </div>
        )
      )}

      {step === 3 && (
        <div>
          <FormField label="Data">
            <input type="date" style={S.input} min={today()} max={addDays(today(), 30)} value={sel.date}
              onChange={e => setSel(p => ({ ...p, date: e.target.value, time: null }))} />
          </FormField>
          <div style={{ marginTop: 24 }}>
            <label style={S.label}>Horários</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(70px,1fr))', gap: 8 }}>
              {slots.map(slot => {
                const available = !bookedSlots.includes(slot);
                const selected = sel.time === slot;
                return (
                  <button key={slot} disabled={!available} onClick={() => setSel(p => ({ ...p, time: slot }))}
                    style={{ padding: '12px 4px', borderRadius: 'var(--radius)', border: `1px solid ${selected ? 'var(--gold)' : available ? 'var(--dark4)' : 'var(--dark3)'}`, background: selected ? 'var(--gold)' : available ? 'var(--dark2)' : 'var(--dark)', color: selected ? '#000' : available ? 'var(--text)' : 'var(--text-dim)', fontSize: 13, fontWeight: selected ? 600 : 400, cursor: available ? 'pointer' : 'not-allowed' }}>
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <div style={{ ...S.card, padding: 20, marginBottom: 20, borderColor: 'var(--gold-dim)' }}>
            <h3 style={{ color: 'var(--gold)', fontFamily: "'Playfair Display', serif", marginBottom: 16, fontSize: 18 }}>Resumo</h3>
            {[
              { label: 'Barbeiro', value: sel.barber?.name },
              { label: 'Serviço', value: sel.service?.name },
              { label: 'Valor', value: fmtPrice(sel.service?.price) },
              { label: 'Data', value: fmtDate(sel.date) },
              { label: 'Horário', value: sel.time },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 4 ? '1px solid #2A2520' : 'none' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{r.label}</span>
                <span style={{ color: r.label === 'Valor' ? 'var(--gold)' : 'var(--text)', fontWeight: r.label === 'Valor' ? 600 : 400, fontSize: 13 }}>{r.value}</span>
              </div>
            ))}
          </div>
          {!user && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Seus dados para contato</p>
              <FormField label="Nome *"><input style={S.input} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></FormField>
              <FormField label="E-mail *"><input style={S.input} type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></FormField>
              <FormField label="WhatsApp"><input style={S.input} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></FormField>
            </div>
          )}
          <button onClick={handleConfirm} disabled={loading}
            style={{ ...S.goldBtn, width: '100%', padding: 16, fontSize: 16, marginTop: 16, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Confirmando...' : 'Confirmar →'}
          </button>
        </div>
      )}

      {step === 5 && (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--dark3)', border: '2px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28, color: 'var(--gold)' }}>✓</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: 'var(--gold)', marginBottom: 8 }}>Agendado!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 4 }}>Horário com <strong>{sel.barber?.name}</strong>.</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>📅 {fmtDate(sel.date)} às {sel.time}</p>
          <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
            <button onClick={() => setPage('home')} style={{ ...S.goldBtn, width: '100%' }}>Voltar ao início</button>
            {user && <button onClick={() => setPage('my-appointments')} style={{ ...S.outlineBtn, width: '100%' }}>Ver meus agendamentos</button>}
          </div>
        </div>
      )}

      {step < 4 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
          <button onClick={() => setStep(s => s - 1)} disabled={step === 1} style={{ ...S.ghostBtn, opacity: step === 1 ? 0.4 : 1 }}>← Anterior</button>
          <button onClick={() => setStep(s => s + 1)} disabled={!canNext()} style={{ ...S.goldBtn, opacity: canNext() ? 1 : 0.4 }}>
            {step === 3 ? 'Revisar →' : 'Próximo →'}
          </button>
        </div>
      )}
    </div>
  );
}
