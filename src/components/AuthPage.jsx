'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CONFIG } from '../config';
import { S } from '../styles';
import { FormField } from './Common';
import { DB } from '../supabase';
import { useApp } from '@/app/providers';

export default function AuthPage() {
  const { setUser, showToast } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) { showToast('Preencha e-mail e senha', 'error'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { showToast('E-mail inválido', 'error'); return; }
    setLoading(true);
    const { user, error } = await DB.signIn(form.email, form.password);
    if (error) {
      const msg = error.message.includes('Invalid') ? 'E-mail ou senha incorretos' : error.message;
      showToast(msg, 'error');
    } else {
      setUser(user);
      showToast(`Bem-vindo, ${user.name || user.email}!`, 'success');
      if (user.role === 'admin' || user.role === 'barber') {
        router.push('/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) { showToast('Preencha todos os campos', 'error'); return; }
    if (form.name.trim().length < 2) { showToast('Nome muito curto', 'error'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { showToast('E-mail inválido', 'error'); return; }
    if (form.password.length < 6) { showToast('Senha precisa ter ao menos 6 caracteres', 'error'); return; }
    setLoading(true);
    const { user, error } = await DB.signUp(form.email, form.password, form.name, form.phone);
    if (error) {
      const msg = error.message.includes('already registered') ? 'E-mail já cadastrado' : error.message;
      showToast(msg, 'error');
    } else {
      showToast('Conta criada! Verifique seu e-mail para confirmar o cadastro.', 'success');
      setTab('login');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: 'var(--gold)', marginBottom: 8 }}>{CONFIG.shopName}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{tab === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}</p>
        </div>
        <div style={{ ...S.card }}>
          <div style={{ display: 'flex', marginBottom: 28, background: 'var(--dark)', borderRadius: 'var(--radius)', padding: 4 }}>
            {['login','register'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: 10, borderRadius: 6, border: 'none', background: tab===t ? 'var(--surface)' : 'transparent', color: tab===t ? 'var(--gold)' : 'var(--text-muted)', fontSize: 14, fontWeight: tab===t ? 500 : 400 }}>
                {t === 'login' ? 'Entrar' : 'Cadastrar'}
              </button>
            ))}
          </div>
          {tab === 'register' && (
            <FormField label="Nome Completo *">
              <input style={S.input} value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} placeholder="Seu nome completo" />
            </FormField>
          )}
          <FormField label="E-mail *">
            <input style={S.input} type="email" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} placeholder="seu@email.com" />
          </FormField>
          <FormField label="Senha *">
            <input style={S.input} type="password" value={form.password} onChange={e => setForm(p=>({...p,password:e.target.value}))} placeholder="Mín. 6 caracteres" onKeyDown={e => e.key==='Enter' && tab==='login' && handleLogin()} />
          </FormField>
          {tab === 'register' && (
            <FormField label="WhatsApp (opcional)">
              <input style={S.input} value={form.phone} onChange={e => setForm(p=>({...p,phone:e.target.value}))} placeholder="(44) 99999-0000" />
            </FormField>
          )}
          <button onClick={tab==='login' ? handleLogin : handleRegister} disabled={loading}
            style={{ ...S.goldBtn, width: '100%', padding: 14, fontSize: 15, marginTop: 4, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Aguarde...' : tab==='login' ? 'Entrar' : 'Criar Conta'}
          </button>
          <div style={S.divider} />
        </div>
      </div>
    </div>
  );
}
