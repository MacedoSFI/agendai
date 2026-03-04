import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const NICHOS = [
  { slug: 'barbearia', label: 'Barbearias', icon: '✂️' },
  { slug: 'clinica', label: 'Clínicas Estéticas', icon: '💆' },
  { slug: 'psicologo', label: 'Psicólogos', icon: '🧠' },
  { slug: 'nutricionista', label: 'Nutricionistas', icon: '🥗' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: '🚀', title: 'Crie sua conta', desc: 'Cadastre-se, defina seus horários de atendimento e adicione seus serviços. Leva menos de 2 minutos.' },
  { step: '02', icon: '🔗', title: 'Compartilhe seu link', desc: 'Você recebe um link personalizado. Cole no Instagram, WhatsApp, cartão de visita — onde quiser.' },
  { step: '03', icon: '📅', title: 'Clientes agendam sozinhos', desc: 'O cliente abre o link, escolhe o serviço, data e horário, e confirma. Sem ligações, sem trocas de mensagem.' },
  { step: '04', icon: '✅', title: 'Você gerencia tudo', desc: 'Novos agendamentos aparecem no seu painel em tempo real. Confirme, cancele ou conclua com um clique.' },
];

const FEATURES = [
  { icon: '🔗', title: 'Link de agendamento', desc: 'Um link único e personalizado para seus clientes agendarem sozinhos, sem precisar de app ou cadastro.' },
  { icon: '📅', title: 'Agenda inteligente', desc: 'Visualize sua semana completa. O sistema bloqueia horários já ocupados automaticamente.' },
  { icon: '🔔', title: 'Notificações em tempo real', desc: 'Receba alertas instantâneos no painel quando um novo agendamento chegar.' },
  { icon: '👥', title: 'Gestão de clientes', desc: 'Histórico completo de cada cliente, serviços realizados e observações sempre à mão.' },
  { icon: '📊', title: 'Relatórios mensais', desc: 'Faturamento, serviços mais populares e tendências do seu negócio em gráficos claros.' },
  { icon: '🔒', title: 'Dados seguros', desc: 'Cada profissional acessa apenas seus próprios dados. Privacidade e segurança totais.' },
];

const PLANS = [
  {
    name: 'Gratuito', price: 'R$ 0', period: '/sempre', desc: 'Para começar e experimentar', color: '#4fd1c5', cta: 'Começar grátis', highlight: false,
    features: [
      { ok: true, label: 'Até 30 agendamentos no mês' },
      { ok: true, label: 'Gestão de clientes' },
      { ok: true, label: 'Agenda semanal' },
      { ok: true, label: 'Relatórios mensais' },
      { ok: false, label: 'Suporte prioritário' },
    ],
  },
  {
    name: 'Pro', price: 'R$ 49', period: '/mês', desc: 'Para profissionais sérios', color: '#7c6af7', cta: 'Assinar Pro', highlight: true,
    features: [
      { ok: true, label: 'Tudo do plano gratuito' },
      { ok: true, label: 'Múltiplos profissionais' },
      { ok: true, label: 'Suporte prioritário' },
      { ok: true, label: 'Atualizações antecipadas' },
      { ok: true, label: 'Sem limite de serviços' },
    ],
  },
];

const FAQS = [
  { q: 'Preciso instalar alguma coisa?', a: 'Não. O AgendAI funciona 100% no navegador, em qualquer dispositivo — celular, tablet ou computador.' },
  { q: 'Como meu cliente agenda?', a: 'Você compartilha seu link personalizado. O cliente abre no navegador, escolhe o serviço, data e horário disponível, informa o nome e telefone, e o agendamento é confirmado na hora.' },
  { q: 'Posso usar o link no Instagram?', a: 'Sim! Cole o link na bio do Instagram, nos Stories, no WhatsApp pessoal ou em qualquer lugar que quiser. É um link comum que abre no navegador.' },
  { q: 'Como sei quando chega um novo agendamento?', a: 'O painel atualiza automaticamente a cada 30 segundos e exibe um badge vermelho no menu com a quantidade de novos agendamentos.' },
  { q: 'Meus dados estão seguros?', a: 'Sim. Cada profissional tem acesso exclusivo aos seus próprios dados. Utilizamos criptografia e armazenamento seguro na nuvem.' },
  { q: 'Funciona para qualquer profissional?', a: 'Sim! Barbearias, clínicas estéticas, psicólogos, nutricionistas, personal trainers e qualquer profissional autônomo que trabalha com agendamentos.' },
];

function useInView(threshold = 0.1) {
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
  const [heroRef, heroIn] = useInView(0.05);
  const [howRef, howIn] = useInView(0.1);
  const [featRef, featIn] = useInView(0.1);
  const [pricRef, pricIn] = useInView(0.1);
  const [faqRef, faqIn] = useInView(0.1);

  return (
    <div style={{ background: '#080810', color: '#e8e8f0', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden' }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(8,8,16,.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(124,106,247,.12)', padding: '0 5%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg, #7c6af7, #4fd1c5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AgendAI</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <a href="#como-funciona" style={navLink}>Como funciona</a>
            <a href="#precos" style={navLink}>Preços</a>
            <Link to="/login" style={{ ...navLink, color: '#c8c8d8' }}>Entrar</Link>
            <Link to="/register" style={btnPrimary}>Começar grátis</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 5% 80px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '25%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(124,106,247,.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '55%', left: '15%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(79,209,197,.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 820, position: 'relative', opacity: heroIn ? 1 : 0, transform: heroIn ? 'translateY(0)' : 'translateY(48px)', transition: 'all .9s cubic-bezier(.16,1,.3,1)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,106,247,.1)', border: '1px solid rgba(124,106,247,.25)', borderRadius: 20, padding: '6px 18px', fontSize: 13, color: '#a89cf7', marginBottom: 32 }}>
            🔗 Seu link de agendamento pronto em 2 minutos
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(38px, 6vw, 74px)', fontWeight: 800, lineHeight: 1.08, marginBottom: 28, letterSpacing: '-1px' }}>
            Seus clientes agendam{' '}
            <span style={{ background: 'linear-gradient(135deg, #7c6af7, #4fd1c5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>sozinhos</span>
            <br />pelo seu link
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#8b8ba0', lineHeight: 1.75, marginBottom: 48, maxWidth: 580, margin: '0 auto 48px' }}>
            Compartilhe seu link no Instagram, WhatsApp ou onde quiser. O cliente escolhe o horário, você gerencia tudo no painel.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
            <Link to="/register" style={{ ...btnPrimary, fontSize: 16, padding: '15px 36px', borderRadius: 12 }}>Criar meu link grátis →</Link>
            <a href="#como-funciona" style={{ ...btnOutline, fontSize: 16, padding: '15px 36px', borderRadius: 12 }}>Ver como funciona</a>
          </div>
          <p style={{ fontSize: 13, color: '#333350' }}>Sem cartão de crédito · Grátis para sempre · 2 minutos para configurar</p>
          <div style={{ marginTop: 56, display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, padding: '12px 20px' }}>
            <span style={{ fontSize: 13, color: '#555570' }}>agendai.com/agendar/</span>
            <span style={{ fontSize: 13, color: '#a89cf7', fontWeight: 600 }}>barbearia-silva</span>
            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,.1)' }} />
            <span style={{ fontSize: 12, color: '#4fd1c5' }}>✓ Pronto para compartilhar</span>
          </div>
        </div>
      </section>

      {/* NICHOS */}
      <section style={{ padding: '0 5% 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#444460', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>Feito para seu nicho</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {NICHOS.map(n => (
              <Link key={n.slug} to={`/para/${n.slug}`}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 30, fontSize: 14, color: '#8b8ba0', textDecoration: 'none', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,106,247,.35)'; e.currentTarget.style.color = '#e8e8f0'; e.currentTarget.style.background = 'rgba(124,106,247,.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.07)'; e.currentTarget.style.color = '#8b8ba0'; e.currentTarget.style.background = 'rgba(255,255,255,.03)'; }}>
                {n.icon} {n.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" ref={howRef} style={{ padding: '80px 5%', background: 'rgba(255,255,255,.015)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 13, color: '#7c6af7', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14 }}>Como funciona</p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, lineHeight: 1.2 }}>Configure uma vez,<br />funciona para sempre</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {HOW_IT_WORKS.map((h, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 18, padding: '28px 24px', opacity: howIn ? 1 : 0, transform: howIn ? 'translateY(0)' : 'translateY(32px)', transition: `all .65s cubic-bezier(.16,1,.3,1) ${i * .12}s` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, rgba(124,106,247,.2), rgba(79,209,197,.1))', border: '1px solid rgba(124,106,247,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{h.icon}</div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#333360', letterSpacing: 1 }}>{h.step}</span>
                </div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{h.title}</h3>
                <p style={{ fontSize: 14, color: '#6b6b80', lineHeight: 1.7 }}>{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section ref={featRef} style={{ padding: '80px 5%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 13, color: '#7c6af7', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14 }}>Tudo incluso</p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800 }}>Tudo que você precisa,<br />nada do que não precisa</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: '26px', opacity: featIn ? 1 : 0, transform: featIn ? 'translateY(0)' : 'translateY(28px)', transition: `all .6s ease ${i * .08}s` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,106,247,.28)'; e.currentTarget.style.background = 'rgba(124,106,247,.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.07)'; e.currentTarget.style.background = 'rgba(255,255,255,.025)'; }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(124,106,247,.1)', border: '1px solid rgba(124,106,247,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 18 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#6b6b80', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREÇOS */}
      <section id="precos" ref={pricRef} style={{ padding: '80px 5%', background: 'rgba(255,255,255,.015)' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 13, color: '#7c6af7', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14 }}>Preços</p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800 }}>Simples e transparente</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {PLANS.map((plan, i) => (
              <div key={i} style={{ background: plan.highlight ? 'linear-gradient(135deg, rgba(124,106,247,.12), rgba(79,209,197,.06))' : 'rgba(255,255,255,.03)', border: `1px solid ${plan.highlight ? 'rgba(124,106,247,.35)' : 'rgba(255,255,255,.07)'}`, borderRadius: 20, padding: '32px', position: 'relative', opacity: pricIn ? 1 : 0, transform: pricIn ? 'translateY(0)' : 'translateY(30px)', transition: `all .6s ease ${i * .15}s` }}>
                {plan.highlight && <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #7c6af7, #4fd1c5)', borderRadius: 20, padding: '4px 18px', fontSize: 11, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>MAIS POPULAR</div>}
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{plan.name}</h3>
                <p style={{ fontSize: 13, color: '#444460', marginBottom: 18 }}>{plan.desc}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 28 }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 44, fontWeight: 800, color: plan.color, lineHeight: 1 }}>{plan.price}</span>
                  <span style={{ color: '#444460', fontSize: 14 }}>{plan.period}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 28 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                      <span style={{ color: f.ok ? '#4fd1c5' : '#333350', fontSize: 15, flexShrink: 0 }}>{f.ok ? '✓' : '✕'}</span>
                      <span style={{ color: f.ok ? '#c8c8d8' : '#444460' }}>{f.label}</span>
                    </div>
                  ))}
                </div>
                <Link to="/register" style={{ display: 'block', textAlign: 'center', padding: '13px', borderRadius: 11, fontWeight: 600, fontSize: 14, textDecoration: 'none', background: plan.highlight ? 'linear-gradient(135deg, #7c6af7, #4fd1c5)' : 'transparent', border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,.12)', color: '#fff' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section ref={faqRef} style={{ padding: '80px 5%' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontSize: 13, color: '#7c6af7', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14 }}>FAQ</p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 800 }}>Perguntas frequentes</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: faqIn ? 1 : 0, transition: 'opacity .7s' }}>
            {FAQS.map((f, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,.03)', border: `1px solid ${faqOpen === i ? 'rgba(124,106,247,.3)' : 'rgba(255,255,255,.07)'}`, borderRadius: 13, overflow: 'hidden', transition: 'border-color .2s' }}>
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  style={{ width: '100%', padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', color: '#e8e8f0', cursor: 'pointer', fontSize: 15, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', textAlign: 'left', gap: 12 }}>
                  {f.q}
                  <span style={{ color: '#7c6af7', fontSize: 22, flexShrink: 0 }}>{faqOpen === i ? '−' : '+'}</span>
                </button>
                {faqOpen === i && <div style={{ padding: '0 22px 18px', fontSize: 14, color: '#6b6b80', lineHeight: 1.75 }}>{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: '100px 5%', textAlign: 'center', position: 'relative', background: 'rgba(255,255,255,.015)' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 350, background: 'radial-gradient(ellipse, rgba(124,106,247,.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 4vw, 50px)', fontWeight: 800, marginBottom: 20, lineHeight: 1.15 }}>Crie seu link de<br />agendamento agora</h2>
          <p style={{ color: '#6b6b80', fontSize: 17, marginBottom: 40 }}>Comece grátis. Seus clientes agradecem.</p>
          <Link to="/register" style={{ ...btnPrimary, fontSize: 17, padding: '16px 44px', borderRadius: 12, display: 'inline-block' }}>Criar conta grátis →</Link>
          <p style={{ marginTop: 20, fontSize: 13, color: '#2a2a40' }}>Sem cartão de crédito</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '32px 5%', borderTop: '1px solid rgba(255,255,255,.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 800, background: 'linear-gradient(135deg, #7c6af7, #4fd1c5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AgendAI</div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {NICHOS.map(n => (
            <Link key={n.slug} to={`/para/${n.slug}`} style={{ fontSize: 13, color: '#333350', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#8b8ba0'}
              onMouseLeave={e => e.currentTarget.style.color = '#333350'}>
              {n.label}
            </Link>
          ))}
        </div>
        <p style={{ fontSize: 12, color: '#222238' }}>© 2026 AgendAI · Todos os direitos reservados</p>
      </footer>
    </div>
  );
}

const navLink = { fontSize: 14, color: '#6b6b80', textDecoration: 'none', transition: 'color .2s' };
const btnPrimary = { background: 'linear-gradient(135deg, #7c6af7, #4fd1c5)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', fontFamily: 'DM Sans, sans-serif', display: 'inline-block' };
const btnOutline = { background: 'transparent', color: '#e8e8f0', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', fontFamily: 'DM Sans, sans-serif', display: 'inline-block' };
