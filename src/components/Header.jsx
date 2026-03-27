'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CONFIG } from '../config';
import { S } from '../styles';
import { Avatar } from './Common';
import { useApp } from '@/app/providers';

export default function Header() {
  const { user, logout } = useApp();
  const router = useRouter();
  
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    if (menuOpen) document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuOpen]);

  return (
    <header style={S.header}>
      <Link href="/" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'none' }}>
        <span style={S.logo}>{CONFIG.shopName}</span>
      </Link>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div className="mobile-hide" style={{ display: 'flex', gap: 24 }}>
          {[{id:'/',label:'Início'},{id:'/booking',label:'Agendar'}].map(l => (
            <Link key={l.id} href={l.id} style={{ textDecoration: 'none', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', padding: '4px 0' }}>
              {l.label}
            </Link>
          ))}
        </div>
        {user ? (
          <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--dark2)', border: '1px solid var(--dark4)', borderRadius: 50, padding: '4px 12px 4px 4px', cursor: 'pointer' }}>
              <Avatar name={user.name || user.email} size={32} />
              <span className="mobile-hide" style={{ color: 'var(--text)', fontSize: 13, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(user.name || user.email).split(' ')[0]}</span>
            </button>
            {menuOpen && (
              <div style={{ position: 'absolute', right: 0, top: '120%', background: 'var(--surface)', border: '1px solid var(--dark4)', borderRadius: 'var(--radius-lg)', minWidth: 200, padding: 8, zIndex: 200, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                <Link href="/" onClick={() => setMenuOpen(false)} style={{ display: 'block', textDecoration: 'none', width: '100%', textAlign: 'left', padding: '12px 14px', background: 'none', border: 'none', color: 'var(--text)', fontSize: 14, cursor: 'pointer', borderRadius: 'var(--radius)' }}>Início</Link>
                <Link href="/booking" onClick={() => setMenuOpen(false)} style={{ display: 'block', textDecoration: 'none', width: '100%', textAlign: 'left', padding: '12px 14px', background: 'none', border: 'none', color: 'var(--text)', fontSize: 14, cursor: 'pointer', borderRadius: 'var(--radius)' }}>Novo Agendamento</Link>
                <div style={{ ...S.divider, margin: '8px 0' }} />
                {user.role === 'client' && <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{ display: 'block', textDecoration: 'none', width: '100%', textAlign: 'left', padding: '12px 14px', background: 'none', border: 'none', color: 'var(--text)', fontSize: 14, cursor: 'pointer', borderRadius: 'var(--radius)' }}>Meus Agendamentos</Link>}
                {user.role === 'barber' && <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{ display: 'block', textDecoration: 'none', width: '100%', textAlign: 'left', padding: '12px 14px', background: 'none', border: 'none', color: 'var(--text)', fontSize: 14, cursor: 'pointer', borderRadius: 'var(--radius)' }}>Meu Painel</Link>}
                {user.role === 'admin' && <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{ display: 'block', textDecoration: 'none', width: '100%', textAlign: 'left', padding: '12px 14px', background: 'none', border: 'none', color: 'var(--gold)', fontSize: 14, cursor: 'pointer', borderRadius: 'var(--radius)' }}>Painel Admin</Link>}
                <div style={{ ...S.divider, margin: '8px 0' }} />
                <button onClick={() => { logout(); setMenuOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 14px', background: 'none', border: 'none', color: 'var(--danger)', fontSize: 14, cursor: 'pointer', borderRadius: 'var(--radius)' }}>Sair da Conta</button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/auth" style={{ ...S.goldBtn, textDecoration: 'none', padding: '8px 18px' }}>Entrar</Link>
        )}
      </nav>
    </header>
  );
}
