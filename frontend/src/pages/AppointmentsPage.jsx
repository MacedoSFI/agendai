import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const STATUS_LABELS = { pending: 'Pendente', confirmed: 'Confirmado', completed: 'Concluído', cancelled: 'Cancelado' };
const STATUS_COLORS = { pending: { bg: 'rgba(246,173,85,.15)', color: '#f6ad55' }, confirmed: { bg: 'rgba(79,209,197,.15)', color: '#4fd1c5' }, completed: { bg: 'rgba(104,211,145,.15)', color: '#68d391' }, cancelled: { bg: 'rgba(252,129,129,.15)', color: '#fc8181' } };

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ client_id: '', service_id: '', start_time: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const load = () => {
    const params = filterStatus ? `?status=${filterStatus}` : '';
    api.get(`/appointments${params}`).then(r => setAppointments(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterStatus]);
  useEffect(() => {
    api.get('/clients').then(r => setClients(r.data));
    api.get('/services').then(r => setServices(r.data));
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/appointments', form);
      setShowModal(false);
      setForm({ client_id: '', service_id: '', start_time: '', notes: '' });
      load();
      showToast('✅ Agendamento criado! WhatsApp enviado.');
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.error || 'Erro ao criar agendamento'));
    } finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      load();
      showToast('✅ Status atualizado!');
    } catch { showToast('❌ Erro ao atualizar status'); }
  };

  const formatDate = (dt) => new Date(dt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 12, padding: '14px 20px', fontSize: 13, zIndex: 999 }}>{toast}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700 }}>Agendamentos</h1>
        <button onClick={() => setShowModal(true)} style={btnPrimary}>＋ Novo Agendamento</button>
      </div>

      <div style={card}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #2a2a3a', display: 'flex', gap: 8 }}>
          {['', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', border: '1px solid #2a2a3a', background: filterStatus === s ? '#7c6af7' : 'transparent', color: filterStatus === s ? '#fff' : '#6b6b80', fontFamily: 'DM Sans, sans-serif' }}>
              {s ? STATUS_LABELS[s] : 'Todos'}
            </button>
          ))}
        </div>

        {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#6b6b80' }}>Carregando...</div> :
          appointments.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: '#6b6b80' }}>Nenhum agendamento encontrado</div> :
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Data/Hora', 'Cliente', 'Serviço', 'Valor', 'Status', 'Ações'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a.id}>
                  <td style={td}><strong>{formatDate(a.start_time)}</strong></td>
                  <td style={td}>{a.client_name}</td>
                  <td style={td}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: a.service_color || '#7c6af7', display: 'inline-block', marginRight: 6 }}></span>
                    {a.service_name}
                  </td>
                  <td style={{ ...td, color: '#68d391' }}>R$ {parseFloat(a.price_charged || 0).toFixed(2)}</td>
                  <td style={td}>
                    <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: STATUS_COLORS[a.status]?.bg, color: STATUS_COLORS[a.status]?.color }}>
                      {STATUS_LABELS[a.status]}
                    </span>
                  </td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {a.status === 'pending' && <button onClick={() => updateStatus(a.id, 'confirmed')} style={{ ...btnSm, background: 'rgba(104,211,145,.15)', color: '#68d391', border: '1px solid rgba(104,211,145,.3)' }}>✓ Confirmar</button>}
                      {a.status === 'confirmed' && <button onClick={() => updateStatus(a.id, 'completed')} style={{ ...btnSm, background: 'rgba(79,209,197,.15)', color: '#4fd1c5', border: '1px solid rgba(79,209,197,.3)' }}>✓ Concluir</button>}
                      {!['cancelled', 'completed'].includes(a.status) && <button onClick={() => updateStatus(a.id, 'cancelled')} style={{ ...btnSm, background: 'rgba(252,129,129,.15)', color: '#fc8181', border: '1px solid rgba(252,129,129,.3)' }}>✕</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 20, padding: 28, width: 480, maxWidth: '95vw' }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>📋 Novo Agendamento</h2>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Cliente</label>
                  <select required style={inputStyle} value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}>
                    <option value="">Selecione...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Serviço</label>
                  <select required style={inputStyle} value={form.service_id} onChange={e => setForm({ ...form, service_id: e.target.value })}>
                    <option value="">Selecione...</option>
                    {services.filter(s => s.active).map(s => <option key={s.id} value={s.id}>{s.name} – R$ {parseFloat(s.price).toFixed(2)}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Data e Horário</label>
                <input required type="datetime-local" style={inputStyle} value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Observações</label>
                <input style={inputStyle} placeholder="Ex: Prefere tesoura..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8, padding: '10px 14px', background: 'rgba(79,209,197,.08)', border: '1px solid rgba(79,209,197,.2)', borderRadius: 8, fontSize: 12, color: '#4fd1c5', marginBottom: 16 }}>
                📱 Mensagem de confirmação será enviada automaticamente via WhatsApp
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ ...btnSm, border: '1px solid #2a2a3a', color: '#e8e8f0', background: 'transparent', padding: '8px 16px' }}>Cancelar</button>
                <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>{saving ? 'Salvando...' : 'Confirmar Agendamento'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const card = { background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 16, overflow: 'hidden' };
const th = { padding: '12px 24px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.5px', color: '#6b6b80', borderBottom: '1px solid #2a2a3a' };
const td = { padding: '14px 24px', fontSize: 13, borderBottom: '1px solid rgba(42,42,58,.5)' };
const btnPrimary = { padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', background: '#7c6af7', color: '#fff', fontFamily: 'DM Sans, sans-serif' };
const btnSm = { padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' };
const labelStyle = { fontSize: 12, color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '.5px', display: 'block', marginBottom: 6 };
const inputStyle = { width: '100%', padding: '10px 14px', background: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: 8, color: '#e8e8f0', fontSize: 14, fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box' };
