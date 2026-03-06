import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const DAYS_PT = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function nextDays(n = 14) {
  const days = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

export default function BookingPage() {
  const { slug } = useParams();
  const [step, setStep] = useState(1); // 1=serviço 2=data 3=horário 4=dados 5=confirmação
  const [professional, setProfessional] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    fetch(`${API}/booking/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); }
        else { setProfessional(data.professional); setServices(data.services); }
        setLoading(false);
      })
      .catch(() => { setError('Erro ao carregar. Tente novamente.'); setLoading(false); });
  }, [slug]);

  useEffect(() => {
    if (!selectedDate || !selectedService) return;
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot(null);
    const dateStr = selectedDate.toISOString().split('T')[0];
    fetch(`${API}/booking/${slug}/slots?date=${dateStr}&service_id=${selectedService.id}`)
      .then(r => r.json())
      .then(data => { setSlots(data.slots || []); setLoadingSlots(false); })
      .catch(() => setLoadingSlots(false));
  }, [selectedDate, selectedService, slug]);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Preencha seu nome e telefone.');
      return;
    }
    setSubmitting(true); setError('');
    const dateStr = selectedDate.toISOString().split('T')[0];
    try {
      const r = await fetch(`${API}/booking/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: selectedService.id,
          start_time: `${dateStr}T${selectedSlot}:00`,
          client_name: form.name,
          client_phone: form.phone,
        }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error || 'Erro ao agendar.'); setSubmitting(false); return; }
      setConfirmation(data.appointment);
      setStep(5);
    } catch { setError('Erro de conexão. Tente novamente.'); }
    setSubmitting(false);
  };

  if (loading) return (
    <div style={wrap}>
      <div style={{ textAlign: 'center', padding: 60, color: '#8b8ba0' }}>Carregando...</div>
    </div>
  );

  if (error && !professional) return (
    <div style={wrap}>
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
        <p style={{ color: '#8b8ba0' }}>{error}</p>
      </div>
    </div>
  );

  return (
    <div style={wrap}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px' }}>

        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #7c6af7, #4fd1c5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 auto 14px', fontFamily: 'Syne, sans-serif' }}>
            {professional?.business_name?.[0] || professional?.name?.[0]}
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: '#e8e8f0', margin: '0 0 4px' }}>
            {professional?.business_name || professional?.name}
          </h1>
          <p style={{ color: '#8b8ba0', fontSize: 14 }}>{professional?.profession}</p>
        </div>

        {/* PROGRESS */}
        {step < 5 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
            {[1,2,3,4].map(s => (
              <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: step >= s ? 'linear-gradient(90deg,#7c6af7,#4fd1c5)' : 'rgba(255,255,255,.08)', transition: 'all .3s' }} />
            ))}
          </div>
        )}

        {error && step < 5 && (
          <div style={{ background: 'rgba(248,81,73,.1)', border: '1px solid rgba(248,81,73,.25)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f85149', marginBottom: 16 }}>{error}</div>
        )}

        {/* STEP 1 — Serviço */}
        {step === 1 && (
          <div>
            <h2 style={stepTitle}>Escolha o serviço</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {services.map(s => (
                <div key={s.id} onClick={() => { setSelectedService(s); setStep(2); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, cursor: 'pointer', transition: 'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,106,247,.4)'; e.currentTarget.style.background = 'rgba(124,106,247,.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'; e.currentTarget.style.background = 'rgba(255,255,255,.03)'; }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#e8e8f0' }}>{s.name}</div>
                    <div style={{ fontSize: 13, color: '#8b8ba0', marginTop: 2 }}>{s.duration_minutes} min</div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#4fd1c5' }}>R$ {parseFloat(s.price).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 — Data */}
        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} style={backBtn}>← Voltar</button>
            <h2 style={stepTitle}>Escolha a data</h2>
            <p style={{ color: '#8b8ba0', fontSize: 13, marginBottom: 16 }}>Serviço: <strong style={{ color: '#e8e8f0' }}>{selectedService?.name}</strong></p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {nextDays(21).map((d, i) => {
                const isSelected = selectedDate?.toDateString() === d.toDateString();
                return (
                  <div key={i} onClick={() => { setSelectedDate(d); setStep(3); }}
                    style={{ padding: '12px 8px', textAlign: 'center', background: isSelected ? 'linear-gradient(135deg, #7c6af7, #4fd1c5)' : 'rgba(255,255,255,.03)', border: `1px solid ${isSelected ? 'transparent' : 'rgba(255,255,255,.08)'}`, borderRadius: 12, cursor: 'pointer', transition: 'all .15s' }}
                    onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'rgba(124,106,247,.4)'; } }}
                    onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'; } }}>
                    <div style={{ fontSize: 10, color: isSelected ? 'rgba(255,255,255,.8)' : '#8b8ba0', textTransform: 'uppercase', letterSpacing: .5 }}>{DAYS_PT[d.getDay()].slice(0,3)}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: isSelected ? '#fff' : '#e8e8f0', margin: '4px 0' }}>{d.getDate()}</div>
                    <div style={{ fontSize: 10, color: isSelected ? 'rgba(255,255,255,.8)' : '#8b8ba0' }}>{MONTHS_PT[d.getMonth()].slice(0,3)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3 — Horário */}
        {step === 3 && (
          <div>
            <button onClick={() => setStep(2)} style={backBtn}>← Voltar</button>
            <h2 style={stepTitle}>Escolha o horário</h2>
            <p style={{ color: '#8b8ba0', fontSize: 13, marginBottom: 16 }}>
              {DAYS_PT[selectedDate?.getDay()]}, {selectedDate?.getDate()} de {MONTHS_PT[selectedDate?.getMonth()]}
            </p>
            {loadingSlots ? (
              <p style={{ color: '#8b8ba0', textAlign: 'center', padding: 24 }}>Buscando horários...</p>
            ) : slots.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>😔</div>
                <p style={{ color: '#8b8ba0' }}>Nenhum horário disponível neste dia.</p>
                <button onClick={() => setStep(2)} style={{ ...backBtn, marginTop: 16 }}>Escolher outra data</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {slots.map(slot => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <div key={slot} onClick={() => { setSelectedSlot(slot); setStep(4); }}
                      style={{ padding: '14px 8px', textAlign: 'center', background: isSelected ? 'linear-gradient(135deg, #7c6af7, #4fd1c5)' : 'rgba(255,255,255,.03)', border: `1px solid ${isSelected ? 'transparent' : 'rgba(255,255,255,.08)'}`, borderRadius: 12, cursor: 'pointer', fontSize: 15, fontWeight: 600, color: isSelected ? '#fff' : '#e8e8f0', transition: 'all .15s' }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(124,106,247,.4)'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'; }}>
                      {slot}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STEP 4 — Dados */}
        {step === 4 && (
          <div>
            <button onClick={() => setStep(3)} style={backBtn}>← Voltar</button>
            <h2 style={stepTitle}>Seus dados</h2>
            <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: 16, marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: '#8b8ba0', marginBottom: 4 }}>Resumo do agendamento</div>
              <div style={{ fontSize: 14, color: '#e8e8f0', fontWeight: 600 }}>{selectedService?.name}</div>
              <div style={{ fontSize: 13, color: '#8b8ba0', marginTop: 4 }}>
                {DAYS_PT[selectedDate?.getDay()]}, {selectedDate?.getDate()} de {MONTHS_PT[selectedDate?.getMonth()]} às {selectedSlot}
              </div>
              <div style={{ fontSize: 15, color: '#4fd1c5', fontWeight: 700, marginTop: 8 }}>R$ {parseFloat(selectedService?.price).toFixed(2)}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Seu nome</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Nome completo" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Seu WhatsApp</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="(48) 99999-9999" style={inputStyle} type="tel" />
              </div>
            </div>
            <button onClick={handleSubmit} disabled={submitting}
              style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #7c6af7, #4fd1c5)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 16, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? .7 : 1, fontFamily: 'DM Sans, sans-serif' }}>
              {submitting ? 'Agendando...' : 'Confirmar agendamento →'}
            </button>
          </div>
        )}

        {/* STEP 5 — Confirmação */}
        {step === 5 && confirmation && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: '#e8e8f0', marginBottom: 8 }}>Agendamento confirmado!</h2>
            <p style={{ color: '#8b8ba0', marginBottom: 28 }}>Até lá! Anote os detalhes abaixo.</p>
            <div style={{ background: 'rgba(63,185,80,.06)', border: '1px solid rgba(63,185,80,.2)', borderRadius: 16, padding: 24, textAlign: 'left' }}>
              <div style={confirmRow}><span style={confirmLabel}>Profissional</span><span style={confirmValue}>{confirmation.professional_name}</span></div>
              <div style={confirmRow}><span style={confirmLabel}>Serviço</span><span style={confirmValue}>{confirmation.service_name}</span></div>
              <div style={confirmRow}><span style={confirmLabel}>Data e hora</span><span style={confirmValue}>
                {new Date(confirmation.start_time).toLocaleString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}
              </span></div>
              <div style={{ ...confirmRow, borderBottom: 'none' }}><span style={confirmLabel}>Valor</span><span style={{ ...confirmValue, color: '#4fd1c5', fontWeight: 700 }}>R$ {parseFloat(confirmation.price).toFixed(2)}</span></div>
            </div>
            {confirmation.payment_message && (
              <div style={{ marginTop: 20, padding: '16px', background: 'rgba(246,173,85,.08)', border: '1px solid rgba(246,173,85,.25)', borderRadius: 12, textAlign: 'left' }}>
                <div style={{ fontSize: 12, color: '#f6ad55', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: .5 }}>💰 Informação de pagamento</div>
                <p style={{ fontSize: 13, color: '#c8c8d8', lineHeight: 1.7, margin: 0 }}>{confirmation.payment_message}</p>
              </div>
            )}
            <p style={{ color: '#555570', fontSize: 12, marginTop: 24 }}>Agendado via AgendAI ✨</p>
          </div>
        )}
      </div>
    </div>
  );
}

const wrap = { minHeight: '100vh', background: '#080810', color: '#e8e8f0', fontFamily: "'DM Sans', sans-serif" };
const stepTitle = { fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, marginBottom: 20, color: '#e8e8f0' };
const backBtn = { background: 'none', border: 'none', color: '#8b8ba0', cursor: 'pointer', fontSize: 13, padding: '0 0 16px', display: 'block', fontFamily: 'DM Sans, sans-serif' };
const labelStyle = { fontSize: 12, color: '#8b8ba0', textTransform: 'uppercase', letterSpacing: .5, display: 'block', marginBottom: 6 };
const inputStyle = { width: '100%', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: '12px 14px', color: '#e8e8f0', fontSize: 15, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' };
const confirmRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.06)', gap: 12 };
const confirmLabel = { fontSize: 12, color: '#8b8ba0', flexShrink: 0 };
const confirmValue = { fontSize: 14, color: '#e8e8f0', fontWeight: 500, textAlign: 'right' };
