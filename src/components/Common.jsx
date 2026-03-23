import React from 'react';
import { S } from '../styles';

export function GoldLine() {
  return <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,var(--gold),transparent)', maxWidth: 80, margin: '0 auto 32px' }} />;
}

export function Avatar({ name = '', size = 44, style: st = {} }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--dark3)', border: '2px solid var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, color: 'var(--gold)', fontWeight: 600, flexShrink: 0, ...st }}>{initials}</div>;
}

export function Modal({ title, onClose, children, width = 480 }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid #2A2520', borderRadius: 16, width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #2A2520', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: 'var(--gold)' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

export function Toast({ msg, type = 'success', onClose }) {
  React.useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const colors = { success: 'var(--success)', error: 'var(--danger)', info: 'var(--gold-dim)' };
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--surface)', border: `1px solid ${colors[type]}`, borderRadius: 10, padding: '12px 20px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: 10, minWidth: 280, maxWidth: 400 }}>
      <span style={{ color: colors[type], fontSize: 16, flexShrink: 0 }}>{type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span style={{ color: 'var(--text)', fontSize: 14, flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>×</button>
    </div>
  );
}

export function FormField({ label, children, style: st = {} }) {
  return <div style={{ marginBottom: 18, ...st }}><label style={S.label}>{label}</label>{children}</div>;
}

export function StatusBadge({ status }) {
  const map = {
    confirmed: { label: 'Confirmado', bg: '#0D2B1A', color: '#3DCF8E' },
    pending:   { label: 'Pendente',   bg: '#2B2100', color: '#F0A500' },
    cancelled: { label: 'Cancelado',  bg: '#2B0D0D', color: '#E05555' },
    done:      { label: 'Concluído',  bg: '#1A1A2B', color: '#7B8FE8' },
  };
  const s = map[status] || map.pending;
  return <span style={{ ...S.badge, background: s.bg, color: s.color }}>{s.label}</span>;
}
