import React, { useState, useEffect } from 'react';
import { fmtPrice, fmtDate, today, generateTimeSlots } from '../utils';
import { S } from '../styles';
import { Avatar, StatusBadge, Modal, FormField } from './Common';
import { useApp } from '../App';

export default function BarberDashboard() {
  const { user, barbers, appointments, updateAptStatus, services, updateService, showToast, reloadData, schedules, setScheduleStatus, addAppointment } = useApp();
  const barber = barbers.find(b => String(b.id) === String(user?.barber_id));
  const [activeTab, setActiveTab] = useState('agenda');
  const [editService, setEditService] = useState(null);
  const [myServices, setMyServices] = useState(services);
  const [selDate, setSelDate] = useState(today());
  const [showBookingModal, setShowBookingModal] = useState(null);
  const [newApt, setNewApt] = useState({ client_name: '', client_email: '', client_phone: '', service_id: '' });

  useEffect(() => { setMyServices(services); }, [services]);

  const myApts = appointments
    .filter(a => barber && String(a.barber_id) === String(barber.id) && a.date === selDate)
    .sort((a, b) => a.time.localeCompare(b.time));
  const todayApts = appointments.filter(a => barber && String(a.barber_id) === String(barber.id) && a.date === today());
  const revenue = todayApts.filter(a => a.status === 'confirmed' || a.status === 'done').reduce((s, a) => s + Number(a.service_price), 0);

  const slots = generateTimeSlots();
  const mySchedule = schedules.filter(s => s.date === selDate);

  const toggleBlock = async (time) => {
    const current = mySchedule.find(s => s.time === (time.length === 5 ? time + ':00' : time));
    const newStatus = current?.status === 'blocked' ? 'available' : 'blocked';
    await setScheduleStatus(barber.id, selDate, time.length === 5 ? time + ':00' : time, newStatus);
  };

  const handleCreateAppointment = async () => {
    if (!newApt.client_name || !newApt.service_id) {
      showToast('Preencha o nome do cliente e o serviço', 'error');
      return;
    }
    const service = services.find(s => s.id === Number(newApt.service_id));
    const apt = {
      barber_id: barber.id,
      barber_name: barber.name,
      service_id: service.id,
      service_name: service.name,
      service_price: service.price,
      date: selDate,
      time: showBookingModal.length === 5 ? showBookingModal + ':00' : showBookingModal,
      client_name: newApt.client_name,
      client_email: newApt.client_email,
      client_phone: newApt.client_phone,
      status: 'confirmed',
    };
    const { error } = await addAppointment(apt);
    if (!error) {
      setShowBookingModal(null);
      setNewApt({ client_name: '', client_email: '', client_phone: '', service_id: '' });
    }
  };

  if (!barber) return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>Perfil de barbeiro não encontrado. Contate o administrador.</p>
    </div>
  );

  const updateStatus = async (id, status) => {
    await updateAptStatus(id, status);
  };

  return (
    <div className="container" style={{ padding: '32px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <Avatar name={barber.name} size={56} />
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: 'var(--text)' }}>{barber.name}</h1>
          <p style={{ color: 'var(--gold)', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>{barber.role}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 32 }}>
        {[
          { label: 'Hoje', value: todayApts.length, unit: 'agend.' },
          { label: 'Faturamento', value: fmtPrice(revenue), unit: '' },
        ].map((m, i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid #2A2520', borderRadius: 'var(--radius-lg)', padding: '16px 14px' }}>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{m.label}</p>
            <p style={{ fontSize: 20, color: 'var(--gold)', fontFamily: "'Playfair Display', serif" }}>{m.value}</p>
            {m.unit && <p style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>{m.unit}</p>}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--dark)', borderRadius: 'var(--radius)', padding: 4, width: '100%' }}>
        {[{id:'agenda',label:'Agenda'},{id:'services',label:'Serviços'}].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, padding: '10px', borderRadius: 6, border: 'none', background: activeTab===t.id ? 'var(--surface)' : 'transparent', color: activeTab===t.id ? 'var(--gold)' : 'var(--text-muted)', fontSize: 14, fontWeight: activeTab===t.id ? 500 : 400 }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'agenda' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <label style={{ color: 'var(--text-muted)', fontSize: 13 }}>Data:</label>
            <input type="date" style={{ ...S.input, width: 'auto', padding: '8px 12px' }} value={selDate} onChange={e => setSelDate(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
            {slots.map(slot => {
              const apt = myApts.find(a => a.time.startsWith(slot));
              const schedule = mySchedule.find(s => s.time.startsWith(slot));
              const isBlocked = schedule?.status === 'blocked';

              if (apt) {
                return (
                  <div key={slot} style={{ ...S.card, padding: 12, background: 'var(--dark3)', borderLeft: '3px solid var(--gold)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 14, color: 'var(--gold)', fontWeight: 600 }}>{slot}</span>
                      <StatusBadge status={apt.status} />
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{apt.client_name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{apt.service_name}</p>
                    <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
                      {apt.status === 'confirmed' && (
                        <button onClick={() => updateStatus(apt.id, 'done')} style={{ ...S.goldBtn, flex: 1, fontSize: 10, padding: '4px' }}>Concluir</button>
                      )}
                    </div>
                  </div>
                );
              }

              if (isBlocked) {
                return (
                  <div key={slot} style={{ ...S.card, padding: 12, background: 'var(--dark2)', textAlign: 'center', opacity: 0.6 }} onClick={() => toggleBlock(slot)}>
                    <span style={{ fontSize: 14, color: 'var(--text-dim)' }}>{slot}</span>
                    <p style={{ fontSize: 10, color: 'var(--danger)', marginTop: 4 }}>Bloqueado</p>
                  </div>
                );
              }

              return (
                <div key={slot} style={{ ...S.card, padding: 12, textAlign: 'center', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{slot}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => setShowBookingModal(slot)} style={{ ...S.goldBtn, fontSize: 10, padding: '4px 8px' }}>+</button>
                    <button onClick={() => toggleBlock(slot)} style={{ ...S.ghostBtn, fontSize: 10, padding: '4px 8px' }}>🚫</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showBookingModal && (
        <Modal title={`Agendar Horário - ${showBookingModal}`} onClose={() => setShowBookingModal(null)}>
          <FormField label="Nome do Cliente">
            <input style={S.input} value={newApt.client_name} onChange={e => setNewApt(p => ({ ...p, client_name: e.target.value }))} />
          </FormField>
          <FormField label="Serviço">
            <select style={S.input} value={newApt.service_id} onChange={e => setNewApt(p => ({ ...p, service_id: e.target.value }))}>
              <option value="">Selecione um serviço</option>
              {myServices.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </FormField>
          <FormField label="E-mail do Cliente (Opcional)">
            <input style={S.input} value={newApt.client_email} onChange={e => setNewApt(p => ({ ...p, client_email: e.target.value }))} />
          </FormField>
          <FormField label="Telefone do Cliente (Opcional)">
            <input style={S.input} value={newApt.client_phone} onChange={e => setNewApt(p => ({ ...p, client_phone: e.target.value }))} />
          </FormField>
          <button onClick={handleCreateAppointment} style={{ ...S.goldBtn, width: '100%', padding: 14 }}>Confirmar Agendamento</button>
        </Modal>
      )}

      {activeTab === 'services' && (
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>Edite os serviços e valores que você oferece</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {myServices.map((s, i) => (
              <div key={s.id} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 16, color: 'var(--text)' }}>{s.name}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>⏱ {s.duration} min</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20, color: 'var(--gold)', fontWeight: 600 }}>{fmtPrice(s.price)}</span>
                  <button onClick={() => setEditService({ ...s, idx: i })} style={{ ...S.outlineBtn, padding: '7px 14px', fontSize: 12 }}>Editar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editService && (
        <Modal title="Editar Serviço" onClose={() => setEditService(null)}>
          <FormField label="Nome"><input style={S.input} value={editService.name} onChange={e=>setEditService(p=>({...p,name:e.target.value}))} /></FormField>
          <FormField label="Preço (R$)"><input style={S.input} type="number" step="0.01" value={editService.price} onChange={e=>setEditService(p=>({...p,price:e.target.value}))} /></FormField>
          <FormField label="Duração (min)"><input style={S.input} type="number" value={editService.duration} onChange={e=>setEditService(p=>({...p,duration:e.target.value}))} /></FormField>
          <FormField label="Descrição"><textarea style={{ ...S.input, minHeight: 70 }} value={editService.description || ''} onChange={e=>setEditService(p=>({...p,description:e.target.value}))} /></FormField>
          <button onClick={async () => {
            const { idx, ...svcData } = editService;
            const { error } = await updateService(svcData.id, { name: svcData.name, price: Number(svcData.price), duration: Number(svcData.duration), description: svcData.description });
            if (!error) { const upd=[...myServices]; upd[idx]=svcData; setMyServices(upd); setEditService(null); showToast('Serviço atualizado!','success'); }
            else showToast('Erro ao salvar','error');
          }} style={{ ...S.goldBtn, width: '100%', padding: 14 }}>Salvar Alterações</button>
        </Modal>
      )}
    </div>
  );
}
