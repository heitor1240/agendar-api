import React, { useState, useEffect } from 'react';
import { CONFIG } from '../config';
import { S } from '../styles';
import { Avatar } from './Common';
import { useApp } from '../App';

export default function Header() {
  const { page, setPage, user, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    if (menuOpen) document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuOpen]);

  return (
    <header style={S.header}>
      <button onClick={() => setPage('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <span style={S.logo}>{CONFIG.shopName}</span>
      </button>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div className="mobile-hide" style={{ display: 'flex', gap: 24 }}>
          {[{id:'home',label:'Início'},{id:'booking',label:'Agendar'}].map(l => (
            <button key={l.id} onClick={() => setPage(l.id)} style={{ background: 'none', border: 'none', color: page===l.id ? 'var(--gold)' : 'var(--text-muted)', fontSize: 14, cursor: 'pointer', fontWeight: page===l.id ? 500 : 400, padding: '4px 0', borderBottom: page===l.id ? '1px solid var(--gold)' : '1px solid transparent' }}>
              {l.label}
            </button>
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
                <div className="mobile-only" style={{ padding: '8px 14px', marginBottom: 8, display: 'none' }}>
                   <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Olá, {user.name || user.email}</p>
                </div>
                <button onClick={() => { setPage('home'); setMenuOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 14px', background: 'none', border: 'none', color: 'var(--text)', fontSize: 14, cursor: 'pointer', borderRadius: 'var(--radius)' }}>Início</button>
                <button onClick={() => { setPage('booking'); setMenuOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 14px', background: 'none', border: 'none', color: 'var(--text)', fontSize: 14, cursor: 'pointer', borderRadius: 'var(--radius)' }}>Novo Agendamento</button>
                <div style={{ ...S.divider, margin: '8px 0' }} />
                {user.role === 'client' && <button onClick={() => { setPage('my-appointments'); setMenuOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 14px', background: 'none', border: 'none', color: 'var(--text)', fontSize: 14, cursor: 'pointer', borderRadius: 'var(--radius)' }}>Meus Agendamentos</button>}
                {user.role === 'barber' && <button onClick={() => { setPage('barber-dashboard'); setMenuOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 14px', background: 'none', border: 'none', color: 'var(--text)', fontSize: 14, cursor: 'pointer', borderRadius: 'var(--radius)' }}>Meu Painel</button>}
                {user.role === 'admin' && <button onClick={() => { setPage('admin'); setMenuOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 14px', background: 'none', border: 'none', color: 'var(--gold)', fontSize: 14, cursor: 'pointer', borderRadius: 'var(--radius)' }}>Painel Admin</button>}
                <div style={{ ...S.divider, margin: '8px 0' }} />
                <button onClick={() => { logout(); setMenuOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 14px', background: 'none', border: 'none', color: 'var(--danger)', fontSize: 14, cursor: 'pointer', borderRadius: 'var(--radius)' }}>Sair da Conta</button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => setPage('auth')} style={{ ...S.goldBtn, padding: '8px 18px' }}>Entrar</button>
        )}
      </nav>
    </header>
  );
}
