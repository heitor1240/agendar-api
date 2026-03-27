import { getServerData } from '@/lib/supabase-server';
import { CONFIG } from '@/src/config';
import { fmtPrice } from '@/src/utils';
import { S } from '@/src/styles';
import { GoldLine, Avatar } from '@/src/components/Common';
import Link from 'next/link';

export default async function HomePage() {
  // SSR: Dados buscados diretamente no servidor
  const [barbers, services] = await Promise.all([
    getServerData.getBarbers(),
    getServerData.getServices()
  ]);

  return (
    <div>
      {/* Hero */}
      <div style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 40%, #1A1400 0%, #0A0A0A 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 60px,#1A1600 61px),repeating-linear-gradient(90deg,transparent,transparent 60px,#1A1600 61px)', opacity: 0.15 }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '0 20px' }}>
          <p style={{ color: 'var(--gold)', fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16 }}>Est. 2020</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(42px,12vw,96px)', lineHeight: 1, color: 'var(--text)', marginBottom: 12 }}>{CONFIG.shopName}</h1>
          <div style={{ width: 60, height: 2, background: 'var(--gold)', margin: '0 auto 20px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(15px,4vw,18px)', maxWidth: 460, margin: '0 auto 40px', lineHeight: 1.6 }}>{CONFIG.shopSlogan}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/booking" style={{ ...S.goldBtn, textDecoration: 'none', padding: '14px 32px', fontSize: 15, borderRadius: 50 }}>Agendar Horário</Link>
            <a href="#svc" style={{ ...S.outlineBtn, textDecoration: 'none', padding: '14px 32px', fontSize: 15, borderRadius: 50 }}>Ver Serviços</a>
          </div>
        </div>
        <div className="mobile-hide" style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', color: 'var(--text-dim)', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase' }}>↓ explorar</div>
      </div>

      {/* Info bar */}
      <div style={{ background: 'var(--gold)', padding: '12px 20px', display: 'flex', gap: '16px 32px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[{ icon: '📍', text: CONFIG.shopAddress }, { icon: '📞', text: CONFIG.shopPhone }, { icon: '🕐', text: CONFIG.shopHours }].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#000', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>
            <span>{item.icon}</span>{item.text}
          </div>
        ))}
      </div>

      {/* Serviços Section - SSR Real HTML */}
      <div id="svc" className="container" style={{ padding: '60px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ color: 'var(--gold)', fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 12 }}>O que fazemos</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px,8vw,42px)', color: 'var(--text)', marginBottom: 12 }}>Nossos Serviços</h2>
          <GoldLine />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
          {services.map(s => (
            <div key={s.id} style={{ ...S.card, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 17, color: 'var(--text)', marginBottom: 6, fontWeight: 500 }}>{s.name}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.description}</p>
                </div>
                <div style={{ fontSize: 20, color: 'var(--gold)', fontWeight: 600, fontFamily: "'Playfair Display', serif", whiteSpace: 'nowrap' }}>{fmtPrice(s.price)}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #2A2520', paddingTop: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>⏱ {s.duration} min</span>
                <Link href="/booking" style={{ ...S.outlineBtn, textDecoration: 'none', padding: '6px 14px', fontSize: 12 }}>Agendar</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Equipe Section - SSR Real HTML */}
      <div style={{ background: 'var(--surface)', padding: '60px 20px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ color: 'var(--gold)', fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 12 }}>Conheça</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px,8vw,42px)', color: 'var(--text)', marginBottom: 12 }}>Nossa Equipe</h2>
            <GoldLine />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20 }}>
            {barbers.map(b => (
              <div key={b.id} style={{ ...S.card, padding: 20, textAlign: 'center' }}>
                <Avatar name={b.name} size={64} style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: 18, fontFamily: "'Playfair Display', serif", color: 'var(--text)', marginBottom: 4 }}>{b.name}</h3>
                <p style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>{b.role}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, minHeight: 60 }}>{b.bio}</p>
                <Link href="/booking" style={{ ...S.goldBtn, textDecoration: 'none', marginTop: 20, display: 'block', width: '100%', padding: '12px', fontWeight: 600, fontSize: 14 }}>Agendar com {b.name.split(' ')[0]}</Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--dark)' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(30px,7vw,40px)', color: 'var(--text)', marginBottom: 16 }}>Pronto para o seu melhor corte?</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 15 }}>Agende agora mesmo, de onde estiver.</p>
        <Link href="/booking" style={{ ...S.goldBtn, textDecoration: 'none', padding: '16px 40px', fontSize: 16, borderRadius: 50, fontWeight: 600 }}>Agendar Agora →</Link>
      </div>

      <div style={{ background: 'var(--black)', borderTop: '1px solid #1A1A1A', padding: 24, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>{CONFIG.shopName} © {new Date().getFullYear()} · Todos os direitos reservados</p>
      </div>
    </div>
  );
}
