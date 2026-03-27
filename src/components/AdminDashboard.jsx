'use client';
import React, { useState } from 'react';
import { CONFIG } from '../config';
import { fmtPrice, fmtDate, today } from '../utils';
import { S } from '../styles';
import { Avatar, StatusBadge, Modal, FormField } from './Common';
import { useApp } from '@/app/providers';

export default function AdminDashboard() {
  const { appointments, barbers, services, addBarber, updateBarber, deleteBarber, addService, updateService, deleteService, showToast, reloadData } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddBarber, setShowAddBarber] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [editBarber, setEditBarber] = useState(null);
  const [editService, setEditService] = useState(null);
  const [newBarber, setNewBarber] = useState({ name: '', role: 'Barber', bio: '', email: '' });
  const [newService, setNewService] = useState({ name: '', price: '', duration: 30, description: '' });

  const totalRevenue = appointments.filter(a => a.status !== 'cancelled').reduce((s, a) => s + Number(a.service_price), 0);
  const todayApts = appointments.filter(a => a.date === today());

  // Agrupamento de faturamento diário
  const dailyGroups = appointments.filter(a => a.status !== 'cancelled').reduce((acc, a) => {
    acc[a.date] = (acc[a.date] || 0) + Number(a.service_price);
    return acc;
  }, {});
  const dailyRevenueList = Object.entries(dailyGroups).sort((a,b) => b[0].localeCompare(a[0]));

  const doAddBarber = async () => {
    if (!newBarber.name) { showToast('Nome obrigatório', 'error'); return; }
    const { error } = await addBarber(newBarber);
    if (!error) {
      setNewBarber({ name: '', role: 'Barber', bio: '', email: '' });
      setShowAddBarber(false);
    }
  };

  const doAddService = async () => {
    if (!newService.name || !newService.price) { showToast('Preencha nome e preço', 'error'); return; }
    const { error } = await addService({ ...newService, price: Number(newService.price), duration: Number(newService.duration) });
    if (!error) {
      setNewService({ name: '', price: '', duration: 30, description: '' });
      setShowAddService(false);
    }
  };

  return (
    <div className="container" style={{ padding: '32px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ ...S.sectionTitle, fontSize: 'clamp(24px,6vw,28px)' }}>Painel Administrativo</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{CONFIG.shopName} · Gestão completa</p>
        </div>
        <button onClick={reloadData} style={{ ...S.ghostBtn, fontSize: 12, padding: '8px 16px' }}>↺ Atualizar</button>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'var(--dark)', borderRadius: 'var(--radius)', padding: 4, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {[{id:'overview',label:'Visão Geral'},{id:'barbers',label:'Equipe'},{id:'services',label:'Serviços'},{id:'appointments',label:'Agenda'}].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, padding: '10px 14px', borderRadius: 6, border: 'none', background: activeTab===t.id ? 'var(--surface)' : 'transparent', color: activeTab===t.id ? 'var(--gold)' : 'var(--text-muted)', fontSize: 13, fontWeight: activeTab===t.id ? 500 : 400, whiteSpace: 'nowrap' }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 32 }}>
            {[
              { label: 'Total', value: appointments.length },
              { label: 'Hoje', value: todayApts.length },
              { label: 'Faturamento', value: fmtPrice(totalRevenue) },
              { label: 'Confirmados', value: appointments.filter(a=>a.status==='confirmed').length },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--surface)', border: '1px solid #2A2520', borderRadius: 'var(--radius-lg)', padding: '16px 14px', gridColumn: i === 2 ? 'span 2' : 'span 1' }}>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{m.label}</p>
                <p style={{ fontSize: i === 2 ? 24 : 20, color: 'var(--gold)', fontFamily: "'Playfair Display', serif" }}>{m.value}</p>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 32 }}>
            <h3 style={{ color: 'var(--text)', fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 16 }}>Faturamento por Dia</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {dailyRevenueList.length === 0 ? (
                <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>Nenhum dado financeiro disponível.</p>
              ) : dailyRevenueList.map(([date, total]) => (
                <div key={date} style={{ ...S.card, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{fmtDate(date)}</span>
                  <span style={{ color: 'var(--gold)', fontWeight: 600, fontSize: 15 }}>{fmtPrice(total)}</span>
                </div>
              ))}
            </div>
          </div>

          <h3 style={{ color: 'var(--text)', fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 16 }}>Últimos Agendamentos</h3>
          {appointments.length === 0 ? (
            <div style={{ ...S.card, textAlign: 'center', padding: 32 }}><p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Nenhum agendamento ainda</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[...appointments].slice(0,8).map(a => (
                <div key={a.id} style={{ ...S.card, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ color: 'var(--text)', fontSize: 15, fontWeight: 500 }}>{a.client_name}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{a.service_name} com {a.barber_name}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #2A2520', paddingTop: 10 }}>
                    <p style={{ color: 'var(--text-dim)', fontSize: 12 }}>📅 {fmtDate(a.date)} às {a.time.substring(0,5)}</p>
                    <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{fmtPrice(a.service_price)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'barbers' && (
        <div>
          <button onClick={() => setShowAddBarber(true)} style={{ ...S.goldBtn, width: '100%', marginBottom: 20 }}>+ Adicionar Colaborador</button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {barbers.length === 0 ? (
              <div style={{ ...S.card, textAlign: 'center', padding: 32, borderStyle: 'dashed' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Nenhum colaborador.</p>
              </div>
            ) : barbers.map(b => (
              <div key={b.id} style={{ ...S.card, padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Avatar name={b.name} size={48} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 16, color: 'var(--text)' }}>{b.name}</h3>
                    <p style={{ fontSize: 11, color: 'var(--gold)', textTransform: 'uppercase' }}>{b.role}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setEditBarber({...b})} style={{ ...S.outlineBtn, flex: 1, padding: '8px', fontSize: 12 }}>Editar</button>
                  <button onClick={async () => { 
                    if(confirm('Remover colaborador?')) {
                      const { error } = await deleteBarber(b.id); 
                      if (!error) showToast('Removido','info');
                    }
                  }} style={{ ...S.ghostBtn, flex: 1, padding: '8px', fontSize: 12, color: 'var(--danger)', borderColor: 'var(--danger)' }}>Remover</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'services' && (
        <div>
          <button onClick={() => setShowAddService(true)} style={{ ...S.goldBtn, width: '100%', marginBottom: 20 }}>+ Adicionar Serviço</button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {services.map(s => (
              <div key={s.id} style={{ ...S.card, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 16, color: 'var(--text)', marginBottom: 2 }}>{s.name}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>⏱ {s.duration} min · {fmtPrice(s.price)}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setEditService({...s})} style={{ ...S.outlineBtn, padding: '8px 12px', fontSize: 12 }}>Editar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {appointments.map(a => (
            <div key={a.id} style={{ ...S.card, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text)', fontSize: 15, fontWeight: 500 }}>{a.client_name}</span>
                <StatusBadge status={a.status} />
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{a.service_name} · ✂️ {a.barber_name}</p>
              <p style={{ color: 'var(--text-dim)', fontSize: 12 }}>📅 {fmtDate(a.date)} às {a.time.substring(0,5)}</p>
            </div>
          ))}
        </div>
      )}

      {showAddBarber && (
        <Modal title="Adicionar Colaborador" onClose={() => setShowAddBarber(false)}>
          <FormField label="Nome *"><input style={S.input} value={newBarber.name} onChange={e=>setNewBarber(p=>({...p,name:e.target.value}))} placeholder="Nome completo" /></FormField>
          <FormField label="Cargo">
            <select style={S.input} value={newBarber.role} onChange={e=>setNewBarber(p=>({...p,role:e.target.value}))}>
              <option>Barber</option><option>Senior Barber</option><option>Master Barber</option><option>Proprietário</option>
            </select>
          </FormField>
          <FormField label="E-mail"><input style={S.input} type="email" value={newBarber.email} onChange={e=>setNewBarber(p=>({...p,email:e.target.value}))} placeholder="email@barbearia.com" /></FormField>
          <FormField label="Bio"><textarea style={{ ...S.input, minHeight: 80 }} value={newBarber.bio} onChange={e=>setNewBarber(p=>({...p,bio:e.target.value}))} placeholder="Experiência e especialidades" /></FormField>
          <button onClick={doAddBarber} style={{ ...S.goldBtn, width: '100%', padding: 14 }}>Adicionar</button>
        </Modal>
      )}

      {showAddService && (
        <Modal title="Adicionar Serviço" onClose={() => setShowAddService(false)}>
          <FormField label="Nome *"><input style={S.input} value={newService.name} onChange={e=>setNewService(p=>({...p,name:e.target.value}))} placeholder="Ex: Corte Clássico" /></FormField>
          <FormField label="Preço (R$) *"><input style={S.input} type="number" step="0.01" value={newService.price} onChange={e=>setNewService(p=>({...p,price:e.target.value}))} /></FormField>
          <FormField label="Duração (min)"><input style={S.input} type="number" value={newService.duration} onChange={e=>setNewService(p=>({...p,duration:e.target.value}))} /></FormField>
          <FormField label="Descrição"><textarea style={{ ...S.input, minHeight: 70 }} value={newService.description} onChange={e=>setNewService(p=>({...p,description:e.target.value}))} /></FormField>
          <button onClick={doAddService} style={{ ...S.goldBtn, width: '100%', padding: 14 }}>Adicionar</button>
        </Modal>
      )}

      {editBarber && (
        <Modal title="Editar Colaborador" onClose={() => setEditBarber(null)}>
          <FormField label="Nome"><input style={S.input} value={editBarber.name} onChange={e=>setEditBarber(p=>({...p,name:e.target.value}))} /></FormField>
          <FormField label="Cargo">
            <select style={S.input} value={editBarber.role} onChange={e=>setEditBarber(p=>({...p,role:e.target.value}))}>
              <option>Barber</option><option>Senior Barber</option><option>Master Barber</option><option>Proprietário</option>
            </select>
          </FormField>
          <FormField label="E-mail"><input style={S.input} type="email" value={editBarber.email||''} onChange={e=>setEditBarber(p=>({...p,email:e.target.value}))} /></FormField>
          <FormField label="Bio"><textarea style={{ ...S.input, minHeight: 80 }} value={editBarber.bio||''} onChange={e=>setEditBarber(p=>({...p,bio:e.target.value}))} /></FormField>
          <button onClick={async () => {
            const { id, ...ch } = editBarber;
            const { error } = await updateBarber(id, ch);
            if (!error) { setEditBarber(null); showToast('Salvo!','success'); } else showToast('Erro','error');
          }} style={{ ...S.goldBtn, width: '100%', padding: 14 }}>Salvar</button>
        </Modal>
      )}

      {editService && (
        <Modal title="Editar Serviço" onClose={() => setEditService(null)}>
          <FormField label="Nome"><input style={S.input} value={editService.name} onChange={e=>setEditService(p=>({...p,name:e.target.value}))} /></FormField>
          <FormField label="Preço (R$)"><input style={S.input} type="number" step="0.01" value={editService.price} onChange={e=>setEditService(p=>({...p,price:e.target.value}))} /></FormField>
          <FormField label="Duração (min)"><input style={S.input} type="number" value={editService.duration} onChange={e=>setEditService(p=>({...p,duration:e.target.value}))} /></FormField>
          <FormField label="Descrição"><textarea style={{ ...S.input, minHeight: 70 }} value={editService.description||''} onChange={e=>setEditService(p=>({...p,description:e.target.value}))} /></FormField>
          <button onClick={async () => {
            const { id, ...ch } = editService;
            const { error } = await updateService(id, { ...ch, price: Number(ch.price), duration: Number(ch.duration) });
            if (!error) { setEditService(null); showToast('Salvo!','success'); } else showToast('Erro','error');
          }} style={{ ...S.goldBtn, width: '100%', padding: 14 }}>Salvar</button>
        </Modal>
      )}
    </div>
  );
}
