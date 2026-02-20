import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', profession: '', business_name: '', whatsapp_token: '', whatsapp_phone_id: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: '' });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        profession: user.profession || '',
        business_name: user.business_name || '',
        whatsapp_token: user.whatsapp_token || '',
        whatsapp_phone_id: user.whatsapp_phone_id || '',
      });
    }
  }, [user]);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast({ msg: '', type: '' }), 3000); };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data);
      showToast('✅ Perfil atualizado com sucesso!');
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.error || 'Erro ao salvar'), 'error');
    } finally { setSaving(false); }
  };

  const professions = ['Barbearia', 'Clínica de Estética', 'Personal Trainer', 'Psicólogo', 'Manicure / Pedicure', 'Médico', 'Dentista', 'Nutricionista', 'Outros'];

  return (
    <>
      {toast.msg && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#13131a', border: `1px solid ${toast.type === 'error' ? 'rgba(252,129,129,.3)' : '#2a2a3a'}`, borderRadius: 12, padding: '14px 20px', fontSize: 13, zIndex: 999 }}>{toast.msg}</div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700 }}>Configurações</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* PERFIL */}
        <div style={card}>
          <div style={cardHeader}><h2 style={cardTitle}>👤 Perfil Profissional</h2></div>
          <form onSubmit={handleSaveProfile} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label style={labelStyle}>Nome Completo *</label><input required style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><label style={labelStyle}>Nome do Negócio</label><input style={inputStyle} value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} placeholder="Barbearia Silva, Clínica X..." /></div>
            <div><label style={labelStyle}>Profissão / Nicho</label>
              <select style={inputStyle} value={form.profession} onChange={e => setForm({ ...form, profession: e.target.value })}>
                <option value="">Selecione...</option>
                {professions.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Telefone</label><input style={inputStyle} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-9999" /></div>
            <div style={{ paddingTop: 4 }}>
              <label style={labelStyle}>Email</label>
              <input style={{ ...inputStyle, opacity: 0.5 }} value={user?.email || ''} disabled title="Email não pode ser alterado" />
            </div>
            <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>{saving ? 'Salvando...' : 'Salvar Alterações'}</button>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* WHATSAPP */}
          <div style={card}>
            <div style={cardHeader}><h2 style={cardTitle}>📱 Integração WhatsApp</h2></div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '12px 14px', background: 'rgba(79,209,197,.08)', border: '1px solid rgba(79,209,197,.2)', borderRadius: 8, fontSize: 12, color: '#4fd1c5', lineHeight: 1.6 }}>
                ℹ️ Configure sua conta Meta Business para envio automático de mensagens.<br/>
                <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" style={{ color: '#4fd1c5' }}>developers.facebook.com →</a>
              </div>
              <div><label style={labelStyle}>WhatsApp Token</label><input type="password" style={inputStyle} value={form.whatsapp_token} onChange={e => setForm({ ...form, whatsapp_token: e.target.value })} placeholder="EAAxxxxxxxxxx..." /></div>
              <div><label style={labelStyle}>Phone Number ID</label><input style={inputStyle} value={form.whatsapp_phone_id} onChange={e => setForm({ ...form, whatsapp_phone_id: e.target.value })} placeholder="123456789012345" /></div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={handleSaveProfile} style={{ ...btnPrimary, flex: 1 }}>Salvar Configuração</button>
              </div>
            </div>
          </div>

          {/* SENHA */}
          <div style={card}>
            <div style={cardHeader}><h2 style={cardTitle}>🔐 Segurança</h2></div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={labelStyle}>Senha Atual</label><input type="password" style={inputStyle} value={passwordForm.current} onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })} placeholder="••••••••" /></div>
              <div><label style={labelStyle}>Nova Senha</label><input type="password" style={inputStyle} value={passwordForm.newPass} onChange={e => setPasswordForm({ ...passwordForm, newPass: e.target.value })} placeholder="Mínimo 8 caracteres" /></div>
              <div><label style={labelStyle}>Confirmar Nova Senha</label><input type="password" style={inputStyle} value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} placeholder="••••••••" /></div>
              <button type="button" style={{ ...btnPrimary, background: 'transparent', border: '1px solid #2a2a3a', color: '#e8e8f0' }}
                onClick={() => showToast('⚠️ Funcionalidade em implementação — altere a senha direto no banco por ora')}>
                Alterar Senha
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const card = { background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 16, overflow: 'hidden' };
const cardHeader = { padding: '16px 20px', borderBottom: '1px solid #2a2a3a' };
const cardTitle = { fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700 };
const btnPrimary = { padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', background: '#7c6af7', color: '#fff', fontFamily: 'DM Sans, sans-serif' };
const labelStyle = { fontSize: 12, color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '.5px', display: 'block', marginBottom: 6 };
const inputStyle = { width: '100%', padding: '10px 14px', background: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: 8, color: '#e8e8f0', fontSize: 14, fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box' };
