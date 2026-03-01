import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const NICHOS = [
  { slug: 'barbearia', label: 'Barbearias', icon: '✂️' },
  { slug: 'clinica', label: 'Clínicas Estéticas', icon: '💆' },
  { slug: 'psicologo', label: 'Psicólogos', icon: '🧠' },
  { slug: 'nutricionista', label: 'Nutricionistas', icon: '🥗' },
];

const FEATURES = [
  { icon: '📅', title: 'Agenda Inteligente', desc: 'Visualize sua semana completa, detecta conflitos automaticamente e organiza seus horários sem esforço.' },
  { icon: '📱', title: 'WhatsApp Automático', desc: 'Confirmações e lembretes enviados automaticamente para seus clientes. Zero trabalho manual.' },
  { icon: '👥', title: 'Gestão de Clientes', desc: 'Histórico completo de cada cliente, preferências e observações sempre à mão.' },
  { icon: '📊', title: 'Relatórios Mensais', desc: 'Faturamento, serviços mais populares e tendências do seu negócio em gráficos claros.' },
  { icon: '🔒', title: 'Dados Seguros', desc: 'Cada profissional tem acesso apenas aos seus próprios dados. Privacidade total.' },
  { icon: '⚡', title: 'Sempre Disponível', desc: 'Sistema na nuvem, 24h por dia. Acesse de qualquer dispositivo, em qualquer lugar.' },
];

const PLANS = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    period: '/sempre',
    desc: 'Para começar e experimentar',
    color: '#4fd1c5',
    features: [
      '✅ Agendamentos ilimitados',
      '✅ Gestão de clientes',
      '✅ Agenda semanal',
      '✅ Relatórios mensais',
      '❌ WhatsApp automático',
      '❌ Suporte prioritário',
    ],
    cta: 'Começar grátis',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 'R$ 49',
    period: '/mês',
    desc: 'Para profissionais sérios',
    color: '#7c6af7',
    features: [
      '✅ Tudo do plano gratuito',
      '✅ WhatsApp automático',
      '✅ Lembretes automáticos 24h antes',
      '✅ Suporte prioritário',
      '✅ Atualizações antecipadas',
      '✅ Sem limite de clientes',
    ],
    cta: 'Assinar Pro',
    highlight: true,
  },
];

const FAQS = [
  { q: 'Preciso instalar alguma coisa?', a: 'Não. O AgendAI funciona 100% no navegador, em qualquer dispositivo — celular, tablet ou computador.' },
  { q: 'Como funciona o WhatsApp automático?', a: 'Ao criar um agendamento, o sistema envia automaticamente uma mensagem de confirmação para o cliente via WhatsApp. 24h antes, envia um lembrete. Tudo sem você precisar fazer nada.' },
  { q: 'Posso migrar do plano gratuito para o Pro?', a: 'Sim, a qualquer momento. Todos os seus dados são preservados na migração.' },
  { q: 'Meus dados estão seguros?', a: 'Sim. Cada profissional tem acesso exclusivo aos seus próprios dados. Utilizamos criptografia e armazenamento seguro na nuvem.' },
  { q: 'Funciona para qualquer tipo de profissional?', a: 'Sim! Barbearias, clínicas estéticas, psicólogos, nutricionistas, personal trainers e qualquer profissional autônomo que trabalha com agendamentos.' },
];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

export default function LandingPage() {
  const [faqOpen, setFaqOpen] = useState(null);
  const [heroRef, heroIn] = useInView(0.1);
  const [featRef, featIn] = useInView(0.1);
  const [pricRef, pricIn] = useInView(0.1);
  const [faqRef, faqIn] = useInView(0.1);

  return (
    <div style={{ background: '#080810', color: '#e8e8f0', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(8,8,16,.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(124,106,247,.15)', padding: '0 5%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg, #7c6af7, #4fd1c5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AgendAI
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <a href="#recursos" style={navLink}>Recursos</a>
            <a href="#precos" style={navLink}>Preços</a>
            <a href="#nichos" style={navLink}>Nichos</a>
            <Link to="/login" style={{ ...navLink, color: '#e8e8f0' }}>Entrar</Link>
            <Link to="/register" style={btnPrimary}>Começar grátis</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 5% 80px', position: 'relative' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(124,106,247,.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', left: '20%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(79,209,197,.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 800, position: 'relative', opacity: heroIn ? 1 : 0, transform: heroIn ? 'translateY(0)' : 'translateY(40px)', transition: 'all .8s ease' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,106,247,.12)', border: '1px solid rgba(124,106,247,.3)', borderRadius: 20, padding: '6px 16px', fontSize: 13, color: '#a89cf7', marginBottom: 28 }}>
            ✨ Sistema de agendamento para profissionais autônomos
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24 }}>
            Chega de agenda no{' '}
            <span style={{ background: 'linear-gradient(135deg, #7c6af7, #4fd1c5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              papel e no WhatsApp
            </span>
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#8b8ba0', lineHeight: 1.7, marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}>
            O AgendAI organiza seus agendamentos, confirma com clientes pelo WhatsApp automaticamente e mostra seu faturamento — tudo em um só lugar.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ ...btnPrimary, fontSize: 16, padding: '14px 32px' }}>
              Começar grátis agora →
            </Link>
            <a href="#recursos" style={{ ...btnOutline, fontSize: 16, padding: '14px 32px' }}>
              Ver como funciona
            </a>
          </div>
          <p style={{ marginTop: 20, fontSize: 13, color: '#555570' }}>
            Grátis para sempre · Sem cartão de crédito · Pronto em 2 minutos
          </p>
        </div>
      </section>

      {/* ── NICHOS ── */}
      <section id="nichos" style={{ padding: '40px 5% 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#555570', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20 }}>Feito para seu nicho</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {NICHOS.map(n => (
              <Link key={n.slug} to={`/para/${n.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 30, fontSize: 14, color: '#8b8ba0', textDecoration: 'none', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,106,247,.4)'; e.currentTarget.style.color = '#e8e8f0'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'; e.currentTarget.style.color = '#8b8ba0'; }}>
                {n.icon} {n.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECURSOS ── */}
      <section id="recursos" ref={featRef} style={{ padding: '80px 5%', background: 'rgba(255,255,255,.02)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 13, color: '#7c6af7', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Recursos</p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800 }}>Tudo que você precisa,<br/>nada do que não precisa</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: '28px', opacity: featIn ? 1 : 0, transform: featIn ? 'translateY(0)' : 'translateY(30px)', transition: `all .6s ease ${i * .1}s` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,106,247,.3)'; e.currentTarget.style.background = 'rgba(124,106,247,.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.07)'; e.currentTarget.style.background = 'rgba(255,255,255,.03)'; }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#8b8ba0', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PREÇOS ── */}
      <section id="precos" ref={pricRef} style={{ padding: '80px 5%' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 13, color: '#7c6af7', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Preços</p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800 }}>Simples e transparente</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {PLANS.map((plan, i) => (
              <div key={i} style={{ background: plan.highlight ? 'linear-gradient(135deg, rgba(124,106,247,.15), rgba(79,209,197,.08))' : 'rgba(255,255,255,.03)', border: `1px solid ${plan.highlight ? 'rgba(124,106,247,.4)' : 'rgba(255,255,255,.07)'}`, borderRadius: 20, padding: '32px', position: 'relative', opacity: pricIn ? 1 : 0, transform: pricIn ? 'translateY(0)' : 'translateY(30px)', transition: `all .6s ease ${i * .15}s` }}>
                {plan.highlight && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #7c6af7, #4fd1c5)', borderRadius: 20, padding: '4px 16px', fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>MAIS POPULAR</div>}
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{plan.name}</h3>
                  <p style={{ fontSize: 13, color: '#555570', marginBottom: 16 }}>{plan.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 42, fontWeight: 800, color: plan.color }}>{plan.price}</span>
                    <span style={{ color: '#555570', fontSize: 14 }}>{plan.period}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ fontSize: 14, color: f.startsWith('❌') ? '#555570' : '#c8c8d8' }}>{f}</div>
                  ))}
                </div>
                <Link to="/register" style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: 'none', background: plan.highlight ? 'linear-gradient(135deg, #7c6af7, #4fd1c5)' : 'transparent', border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,.15)', color: '#fff', transition: 'opacity .2s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section ref={faqRef} style={{ padding: '80px 5%', background: 'rgba(255,255,255,.02)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <p style={{ fontSize: 13, color: '#7c6af7', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>FAQ</p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800 }}>Perguntas frequentes</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: faqIn ? 1 : 0, transition: 'opacity .6s' }}>
            {FAQS.map((f, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,.03)', border: `1px solid ${faqOpen === i ? 'rgba(124,106,247,.3)' : 'rgba(255,255,255,.07)'}`, borderRadius: 12, overflow: 'hidden', transition: 'border-color .2s' }}>
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} style={{ width: '100%', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', color: '#e8e8f0', cursor: 'pointer', fontSize: 15, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', textAlign: 'left' }}>
                  {f.q}
                  <span style={{ color: '#7c6af7', fontSize: 20, flexShrink: 0, marginLeft: 12 }}>{faqOpen === i ? '−' : '+'}</span>
                </button>
                {faqOpen === i && <div style={{ padding: '0 20px 18px', fontSize: 14, color: '#8b8ba0', lineHeight: 1.7 }}>{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: '100px 5%', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 300, background: 'radial-gradient(ellipse, rgba(124,106,247,.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, marginBottom: 20 }}>
            Pronto para organizar<br/>seus agendamentos?
          </h2>
          <p style={{ color: '#8b8ba0', fontSize: 16, marginBottom: 36 }}>
            Comece grátis agora. Configure em menos de 2 minutos.
          </p>
          <Link to="/register" style={{ ...btnPrimary, fontSize: 17, padding: '16px 40px', display: 'inline-block' }}>
            Criar conta grátis →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '32px 5%', borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, background: 'linear-gradient(135deg, #7c6af7, #4fd1c5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AgendAI</div>
        <div style={{ display: 'flex', gap: 24 }}>
          {NICHOS.map(n => <Link key={n.slug} to={`/para/${n.slug}`} style={{ fontSize: 13, color: '#555570', textDecoration: 'none' }}>{n.label}</Link>)}
        </div>
        <p style={{ fontSize: 12, color: '#333350' }}>© 2026 AgendAI · Todos os direitos reservados</p>
      </footer>
    </div>
  );
}

const navLink = { fontSize: 14, color: '#8b8ba0', textDecoration: 'none', transition: 'color .2s' };
const btnPrimary = { background: 'linear-gradient(135deg, #7c6af7, #4fd1c5)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', fontFamily: 'DM Sans, sans-serif', display: 'inline-block', transition: 'opacity .2s' };
const btnOutline = { background: 'transparent', color: '#e8e8f0', border: '1px solid rgba(255,255,255,.15)', borderRadius: 10, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', fontFamily: 'DM Sans, sans-serif', display: 'inline-block' };
