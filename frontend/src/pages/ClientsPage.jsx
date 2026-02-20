import React, { useEffect, useState } from 'react';
import api from '../utils/api';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');

  const load = () => api.get('/clients').then(r => setClients(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openCreate = () => { setEditing(null); setForm({ name: '', phone: '', email: '', notes: '' }); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, phone: c.phone || '', email: c.email || '', notes: c.notes || '' }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await api.put(`/clients/${editing.id}`, form);
      else await api.post('/clients', form);
      setShowModal(false);
      load();
      showToast(editing ? '✅ Cliente atualizado!' : '✅ Cliente cadastrado!');
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.error || 'Erro ao salvar'));
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remover este cliente?')) return;
    try { await api.delete(`/clients/${id}`); load(); showToast('✅ Cliente removido'); }
    catch { showToast('❌ Erro ao remover cliente'); }
  };

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search));
  const initials = (name) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 12, padding: '14px 20px', fontSize: 13, zIndex: 999 }}>{toast}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700 }}>Clientes</h1>
        <button onClick={openCreate} style={btnPrimary}>＋ Novo Cliente</button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input style={{ ...inputStyle, maxWidth: 320 }} placeholder="🔍 Buscar por nome ou telefone..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={card}>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#6b6b80' }}>Carregando...</div> :
          filtered.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: '#6b6b80' }}>Nenhum cliente encontrado</div> :
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Cliente', 'Telefone', 'Email', 'Observações', 'Ações'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #7c6af7, #4fd1c5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials(c.name)}</div>
                      <strong>{c.name}</strong>
                    </div>
                  </td>
                  <td style={{ ...td, color: '#6b6b80' }}>{c.phone || '–'}</td>
                  <td style={{ ...td, color: '#6b6b80' }}>{c.email || '–'}</td>
                  <td style={{ ...td, color: '#6b6b80', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.notes || '–'}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(c)} style={{ ...btnSm, border: '1px solid #2a2a3a', color: '#e8e8f0', background: 'transparent' }}>✏️ Editar</button>
                      <button onClick={() => handleDelete(c.id)} style={{ ...btnSm, background: 'rgba(252,129,129,.15)', color: '#fc8181', border: '1px solid rgba(252,129,129,.3)' }}>🗑</button>
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
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{editing ? '✏️ Editar Cliente' : '👤 Novo Cliente'}</h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: 16 }}><label style={labelStyle}>Nome *</label><input required style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ marginBottom: 16 }}><label style={labelStyle}>Telefone</label><input style={inputStyle} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-9999" /></div>
                <div style={{ marginBottom: 16 }}><label style={labelStyle}>Email</label><input type="email" style={inputStyle} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" /></div>
              </div>
              <div style={{ marginBottom: 16 }}><label style={labelStyle}>Observações</label><textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Preferências, alergias, etc..." /></div>
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
