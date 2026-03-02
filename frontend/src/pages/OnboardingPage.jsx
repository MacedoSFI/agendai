import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const COLORS = ['#7c6af7', '#4fd1c5', '#f6ad55', '#f687b3', '#68d391', '#76e4f7', '#fc8181'];

const defaultHours = DAYS.map((_, i) => ({
  day_of_week: i,
  is_open: i >= 1 && i <= 5, // seg-sex aberto por padrão
  start_time: '09:00',
  end_time: '18:00',
  lunch_start: '12:00',
  lunch_end: '13:00',
}));

const defaultService = { name: '', duration_minutes: 60, price: '', color: '#7c6af7' };

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [hours, setHours] = useState(defaultHours);
  const [services, setServices] = useState([{ ...defaultService }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const updateHour = (idx, field, value) => {
    setHours(prev => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h));
  };

  const updateService = (idx, field, value) => {
    setServices(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const addService = () => setServices(prev => [...prev, { ...defaultService }]);
  const removeService = (idx) => setServices(prev => prev.filter((_, i) => i !== idx));

  const handleSaveHours = async () => {
    setLoading(true); setError('');
    try {
      await api.post('/working-hours', { hours });
      setStep(3);
    } catch (err) {
      setError('Erro ao salvar horários. Tente novamente.');
    } finally { setLoading(false); }
  };

  const handleFinish = async () => {
    if (!services[0].name || !services[0].price) {
      setError('Adicione pelo menos um serviço com nome e preço.');
      return;
    }
    setLoading(true); setError('');
    try {
      for (const s of services) {
        if (s.name && s.price) {
          await api.post('/services', {
            name: s.name,
            duration_minutes: parseInt(s.duration_minutes),
            price: parseFloat(s.price),
            color: s.color,
          });
        }
      }
      const { data } = await api.post('/working-hours/complete-onboarding', {});
      updateUser({ onboarding_completed: true, booking_slug: data.slug });
      navigate('/app/dashboard');
    } catch (err) {
      setError('Erro ao salvar serviços. Tente novamente.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#e8e8f0', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 600 }}>

        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, background: 'linear-gradient(135deg, #7c6af7, #4fd1c5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>
            AgendAI
          </div>
          <p style={{ color: '#8b8ba0', fontSize: 15 }}>
            Olá, {user?.name?.split(' ')[0]}! Vamos configurar seu negócio em 2 minutos.
          </p>
        </div>

        {/* PROGRESS */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36 }}>
          {[1, 2, 3].map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, background: step >= s ? 'linear-gradient(135deg, #7c6af7, #4fd1c5)' : 'rgba(255,255,255,.06)', color: step >= s ? '#fff' : '#555570', border: step === s ? '2px solid #7c6af7' : '2px solid transparent', transition: 'all .3s' }}>
                  {step > s ? '✓' : s}
                </div>
                <div style={{ fontSize: 11, color: step >= s ? '#a89cf7' : '#555570', whiteSpace: 'nowrap' }}>
                  {s === 1 ? 'Boas-vindas' : s === 2 ? 'Horários' : 'Serviços'}
                </div>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 2, background: step > s ? 'linear-gradient(90deg, #7c6af7, #4fd1c5)' : 'rgba(255,255,255,.06)', margin: '0 8px 20px', transition: 'all .3s' }} />}
            </React.Fragment>
          ))}
        </div>

        {/* CARD */}
        <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 20, padding: 32 }}>

          {error && <div style={{ background: 'rgba(248,81,73,.1)', border: '1px solid rgba(248,81,73,.25)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f85149', marginBottom: 20 }}>{error}</div>}

          {/* ── PASSO 1: Boas-vindas ── */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Tudo pronto para começar!</h2>
              <p style={{ color: '#8b8ba0', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
                Vamos configurar 2 coisas rápidas para que seus clientes possam agendar com você:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                {[
                  { icon: '🕐', title: 'Seus horários de funcionamento', desc: 'Quais dias e horários você atende' },
                  { icon: '✂️', title: 'Seus serviços', desc: 'O que você oferece, duração e preço' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, padding: 16, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12 }}>
                    <div style={{ fontSize: 28 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{item.title}</div>
                      <div style={{ fontSize: 13, color: '#8b8ba0' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(2)} style={btnPrimary}>
                Vamos lá! →
              </button>
            </div>
          )}

          {/* ── PASSO 2: Horários ── */}
          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Horários de funcionamento</h2>
              <p style={{ color: '#8b8ba0', fontSize: 13, marginBottom: 24 }}>Defina quando você atende. Você pode ajustar depois.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
                {hours.map((h, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,.03)', border: `1px solid ${h.is_open ? 'rgba(124,106,247,.25)' : 'rgba(255,255,255,.06)'}`, borderRadius: 12, padding: '12px 16px', transition: 'border-color .2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: h.is_open ? 12 : 0 }}>
                      {/* Toggle */}
                      <div onClick={() => updateHour(i, 'is_open', !h.is_open)} style={{ width: 40, height: 22, borderRadius: 11, background: h.is_open ? '#7c6af7' : 'rgba(255,255,255,.1)', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
                        <div style={{ position: 'absolute', top: 3, left: h.is_open ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, flex: 1, color: h.is_open ? '#e8e8f0' : '#555570' }}>{DAYS[i]}</span>
                      {!h.is_open && <span style={{ fontSize: 12, color: '#555570' }}>Fechado</span>}
                    </div>
                    {h.is_open && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                        {[
                          { label: 'Início', field: 'start_time', value: h.start_time },
                          { label: 'Fim', field: 'end_time', value: h.end_time },
                          { label: 'Almoço início', field: 'lunch_start', value: h.lunch_start },
                          { label: 'Almoço fim', field: 'lunch_end', value: h.lunch_end },
                        ].map(({ label, field, value }) => (
                          <div key={field}>
                            <div style={{ fontSize: 10, color: '#555570', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .5 }}>{label}</div>
                            <input type="time" value={value || ''} onChange={e => updateHour(i, field, e.target.value)}
                              style={{ width: '100%', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '6px 8px', color: '#e8e8f0', fontSize: 13, outline: 'none' }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(1)} style={btnOutline}>← Voltar</button>
                <button onClick={handleSaveHours} disabled={loading} style={{ ...btnPrimary, flex: 1 }}>
                  {loading ? 'Salvando...' : 'Salvar e continuar →'}
                </button>
              </div>
            </div>
          )}

          {/* ── PASSO 3: Serviços ── */}
          {step === 3 && (
            <div>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Seus serviços</h2>
              <p style={{ color: '#8b8ba0', fontSize: 13, marginBottom: 24 }}>Adicione o que você oferece. Pode adicionar mais depois.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                {services.map((s, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#8b8ba0' }}>Serviço {i + 1}</span>
                      {services.length > 1 && <button onClick={() => removeService(i)} style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer', fontSize: 13 }}>Remover</button>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Nome do serviço</label>
                        <input value={s.name} onChange={e => updateService(i, 'name', e.target.value)}
                          placeholder="Ex: Corte masculino, Consulta, Sessão..."
                          style={inputStyle} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <label style={labelStyle}>Duração (minutos)</label>
                          <select value={s.duration_minutes} onChange={e => updateService(i, 'duration_minutes', e.target.value)} style={inputStyle}>
                            {[15, 30, 45, 60, 90, 120].map(m => <option key={m} value={m}>{m} min</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>Preço (R$)</label>
                          <input type="number" value={s.price} onChange={e => updateService(i, 'price', e.target.value)}
                            placeholder="0,00" style={inputStyle} />
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>Cor na agenda</label>
                        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                          {COLORS.map(c => (
                            <div key={c} onClick={() => updateService(i, 'color', c)}
                              style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', border: s.color === c ? '3px solid #fff' : '3px solid transparent', transition: 'border .15s' }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={addService} style={{ ...btnOutline, width: '100%', marginBottom: 20, fontSize: 13 }}>
                + Adicionar outro serviço
              </button>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(2)} style={btnOutline}>← Voltar</button>
                <button onClick={handleFinish} disabled={loading} style={{ ...btnPrimary, flex: 1 }}>
                  {loading ? 'Finalizando...' : '🎉 Concluir configuração'}
                </button>
              </div>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#333350' }}>
          Você pode alterar tudo isso depois em Configurações
        </p>
      </div>
    </div>
  );
}

const btnPrimary = { background: 'linear-gradient(135deg, #7c6af7, #4fd1c5)', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer', width: '100%', fontFamily: 'DM Sans, sans-serif', transition: 'opacity .2s' };
const btnOutline = { background: 'transparent', color: '#e8e8f0', border: '1px solid rgba(255,255,255,.15)', borderRadius: 10, padding: '13px 20px', fontSize: 15, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' };
const labelStyle = { fontSize: 12, color: '#8b8ba0', textTransform: 'uppercase', letterSpacing: .5, display: 'block', marginBottom: 6 };
const inputStyle = { width: '100%', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '10px 12px', color: '#e8e8f0', fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' };
