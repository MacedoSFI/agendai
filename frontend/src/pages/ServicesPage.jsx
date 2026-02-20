import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const COLORS = ['#7c6af7','#4fd1c5','#f6ad55','#68d391','#fc8181','#63b3ed','#f687b3','#76e4f7'];

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', duration_minutes: 60, price: '', color: '#7c6af7', active: true });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const load = () => api.get('/services').then(r => setServices(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '', duration_minutes: 60, price: '', color: '#7c6af7', active: true }); setShowModal(true); };
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, description: s.description || '', duration_minutes: s.duration_minutes, price: s.price, color: s.color || '#7c6af7', active: s.active }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await api.put(`/services/${editing.id}`, form);
      else await api.post('/services', form);
      setShowModal(false);
      load();
      showToast(editing ? '✅ Serviço atualizado!' : '✅ Serviço cadastrado!');
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.error || 'Erro ao salvar'));
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remover este serviço?')) return;
    try { await api.delete(`/services/${id}`); load(); showToast('✅ Serviço removido'); }
    catch { showToast('❌ Não é possível remover: serviço em uso'); }
  };

  return (
    <>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 12, padding: '14px 20px', fontSize: 13, zIndex: 999 }}>{toast}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700 }}>Serviços</h1>
        <button onClick={openCreate} style={btnPrimary}>＋ Novo Serviço</button>
      </div>

      <div style={card}>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#6b6b80' }}>Carregando...</div> :
          services.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: '#6b6b80' }}>Nenhum serviço cadastrado</div> :
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Serviço', 'Duração', 'Preço', 'Status', 'Ações'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id}>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: s.color || '#7c6af7', flexShrink: 0 }}></div>
                      <div>
                        <strong>{s.name}</strong>
                        {s.description && <div style={{ fontSize: 11, color: '#6b6b80', marginTop: 2 }}>{s.description}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ ...td, color: '#6b6b80' }}>⏱ {s.duration_minutes} min</td>
                  <td style={{ ...td, color: '#68d391' }}><strong>R$ {parseFloat(s.price).toFixed(2)}</strong></td>
                  <td style={td}>
                    <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: s.active ? 'rgba(79,209,197,.15)' : 'rgba(252,129,129,.15)', color: s.active ? '#4fd1c5' : '#fc8181' }}>
                      {s.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(s)} style={{ ...btnSm, border: '1px solid #2a2a3a', color: '#e8e8f0', background: 'transparent' }}>✏️ Editar</button>
                      <button onClick={() => handleDelete(s.id)} style={{ ...btnSm, background: 'rgba(252,129,129,.15)', color: '#fc8181', border: '1px solid rgba(252,129,129,.3)' }}>🗑</button>
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
          <div style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 20, padding: 28, width: 460, maxWidth: '95vw' }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{editing ? '✏️ Editar Serviço' : '✂️ Novo Serviço'}</h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: 16 }}><label style={labelStyle}>Nome *</label><input required style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Corte Masculino" /></div>
              <div style={{ marginBottom: 16 }}><label style={labelStyle}>Descrição</label><input style={inputStyle} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descrição opcional..." /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ marginBottom: 16 }}><label style={labelStyle}>Duração (minutos) *</label><input required type="number" min="5" style={inputStyle} value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: parseInt(e.target.value) })} /></div>
                <div style={{ marginBottom: 16 }}><label style={labelStyle}>Preço (R$) *</label><input required type="number" min="0" step="0.01" style={inputStyle} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" /></div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Cor identificadora</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {COLORS.map(c => (
                    <div key={c} onClick={() => setForm({ ...form, color: c })} style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '3px solid #fff' : '3px solid transparent', boxSizing: 'border-box' }} />
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="active" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                <label htmlFor="active" style={{ fontSize: 13, cursor: 'pointer' }}>Serviço ativo</label>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ ...btnSm, border: '1px solid #2a2a3a', color: '#e8e8f0', background: 'transparent', padding: '8px 16px' }}>Cancelar</button>
                <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>{saving ? 'Salvando...' : 'Salvar'}</button>
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
