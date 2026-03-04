import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function NichePage({ nicho }) {
  const { icon, name, headline, subheadline, painPoints, benefits, testimonial, color, services, cta } = nicho;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  return (
    <div style={{ background: '#080810', color: '#e8e8f0', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden' }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(8,8,16,.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,.06)', padding: '0 5%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link to="/" style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg, #7c6af7, #4fd1c5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none' }}>
            AgendAI
          </Link>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/login" style={{ padding: '8px 14px', borderRadius: 8, fontSize: 14, color: '#8b8ba0', textDecoration: 'none' }}>Entrar</Link>
            <Link to="/register" style={{ padding: '8px 16px', borderRadius: 8, fontSize: 14, background: 'linear-gradient(135deg, #7c6af7, #4fd1c5)', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
              {isMobile ? 'Grátis' : 'Começar grátis'}
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', padding: isMobile ? '100px 5% 60px' : '120px 5% 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', right: '10%', width: 400, height: 400, background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`, pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 40 : 60, alignItems: 'center' }}>

          {/* Texto */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 20, padding: '6px 16px', fontSize: 13, color, marginBottom: 24 }}>
              {icon} Para {name}
            </div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: isMobile ? 32 : 'clamp(32px, 4vw, 54px)', fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
              {headline}
            </h1>
            <p style={{ fontSize: isMobile ? 16 : 18, color: '#8b8ba0', lineHeight: 1.7, marginBottom: 32 }}>{subheadline}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/register" style={{ padding: isMobile ? '13px 22px' : '14px 28px', background: 'linear-gradient(135deg, #7c6af7, #4fd1c5)', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
                {cta} →
              </Link>
              <Link to="/#precos" style={{ padding: isMobile ? '13px 22px' : '14px 28px', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, color: '#e8e8f0', fontSize: 15, textDecoration: 'none' }}>
                Ver preços
              </Link>
            </div>
            <p style={{ marginTop: 14, fontSize: 13, color: '#444460' }}>30 dias grátis · Sem cartão de crédito</p>
          </div>

          {/* Preview card */}
          <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 20, padding: isMobile ? 16 : 24 }}>
            <div style={{ fontSize: 13, color: '#555570', marginBottom: 16, fontWeight: 600 }}>📅 Próximos agendamentos</div>
            {services.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'rgba(255,255,255,.03)', borderRadius: 10, marginBottom: 8, border: '1px solid rgba(255,255,255,.05)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.client}</div>
                  <div style={{ fontSize: 11, color: '#555570' }}>{s.service}</div>
                </div>
                <div style={{ fontSize: 12, color: '#555570', flexShrink: 0 }}>{s.time}</div>
                <div style={{ fontSize: 11, background: 'rgba(63,185,80,.15)', color: '#3fb950', border: '1px solid rgba(63,185,80,.25)', borderRadius: 10, padding: '2px 8px', flexShrink: 0 }}>✓</div>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: '12px', background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 10, fontSize: 12, color }}>
              🔔 Notificação enviada automaticamente para todos os clientes ✅
            </div>
          </div>
        </div>
      </section>

      {/* DOR → SOLUÇÃO */}
      <section style={{ padding: isMobile ? '60px 5%' : '80px 5%', background: 'rgba(255,255,255,.02)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Mobile: título + dores + título + benefícios em coluna */}
          {/* Desktop: duas colunas lado a lado */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 40 : 60, alignItems: 'start' }}>

            <div>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: isMobile ? 24 : 'clamp(24px, 3vw, 36px)', fontWeight: 800, marginBottom: 24 }}>
                Reconhece alguma dessas situações?
              </h2>
              {painPoints.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, padding: '14px', background: 'rgba(248,81,73,.05)', border: '1px solid rgba(248,81,73,.15)', borderRadius: 10 }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>😩</span>
                  <p style={{ fontSize: 14, color: '#c8c8d8', lineHeight: 1.6, margin: 0 }}>{p}</p>
                </div>
              ))}
            </div>

            <div>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: isMobile ? 24 : 'clamp(24px, 3vw, 36px)', fontWeight: 800, marginBottom: 24 }}>
                Com o AgendAI é diferente
              </h2>
              {benefits.map((b, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, padding: '14px', background: 'rgba(63,185,80,.05)', border: '1px solid rgba(63,185,80,.15)', borderRadius: 10 }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>✅</span>
                  <p style={{ fontSize: 14, color: '#c8c8d8', lineHeight: 1.6, margin: 0 }}>{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DEPOIMENTO */}
      <section style={{ padding: isMobile ? '60px 5%' : '80px 5%' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 20, padding: isMobile ? '28px 20px' : '40px' }}>
            <div style={{ fontSize: 36, marginBottom: 16, color }}>❝</div>
            <p style={{ fontSize: isMobile ? 16 : 18, lineHeight: 1.7, color: '#c8c8d8', marginBottom: 24, fontStyle: 'italic' }}>{testimonial.text}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg, ${color}, #7c6af7)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                {testimonial.name[0]}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{testimonial.name}</div>
                <div style={{ fontSize: 12, color: '#555570' }}>{testimonial.role}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: isMobile ? '60px 5%' : '80px 5%', textAlign: 'center', background: 'rgba(255,255,255,.02)' }}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: isMobile ? 28 : 'clamp(24px, 4vw, 40px)', fontWeight: 800, marginBottom: 14 }}>
            Comece agora, é grátis
          </h2>
          <p style={{ color: '#8b8ba0', marginBottom: 28, fontSize: isMobile ? 15 : 16 }}>
            30 dias grátis. Configure em menos de 2 minutos.
          </p>
          <Link to="/register" style={{ display: 'inline-block', padding: isMobile ? '14px 32px' : '16px 40px', background: 'linear-gradient(135deg, #7c6af7, #4fd1c5)', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: isMobile ? 15 : 16, textDecoration: 'none' }}>
            {cta} →
          </Link>
          <p style={{ marginTop: 14, fontSize: 13, color: '#444460' }}>Sem cartão de crédito</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '24px 5%', borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <Link to="/" style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, background: 'linear-gradient(135deg, #7c6af7, #4fd1c5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none' }}>AgendAI</Link>
        <p style={{ fontSize: 12, color: '#333350' }}>© 2026 AgendAI · Todos os direitos reservados</p>
      </footer>
    </div>
  );
}
