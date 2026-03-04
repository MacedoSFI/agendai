import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [form, setForm]           = useState({ name:'', phone:'', profession:'', business_name:'', whatsapp_token:'', whatsapp_phone_id:'' });
  const [passwordForm, setPasswordForm] = useState({ current:'', newPass:'', confirm:'' });
  const [planInfo, setPlanInfo]   = useState(null);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState({ msg:'', type:'' });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '', phone: user.phone || '',
        profession: user.profession || '', business_name: user.business_name || '',
        whatsapp_token: user.whatsapp_token || '', whatsapp_phone_id: user.whatsapp_phone_id || '',
      });
    }
    api.get('/auth/plan').then(r => setPlanInfo(r.data)).catch(console.error);
  }, [user]);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast({ msg:'', type:'' }), 3500); };

  const handleSaveProfile = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data);
      showToast('✅ Perfil atualizado com sucesso!');
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.error || 'Erro ao salvar'), 'error');
    } finally { setSaving(false); }
  };

  const professions = ['Barbearia','Clínica de Estética','Personal Trainer','Psicólogo','Manicure / Pedicure','Médico','Dentista','Nutricionista','Outros'];

  const planLabel = planInfo?.plan === 'pro' ? '⭐ Pro' : planInfo?.plan === 'trial' ? '🆓 Trial' : '🔒 Expirado';
  const planColor = planInfo?.plan === 'pro' ? '#7c6af7' : planInfo?.plan === 'trial' ? '#f6ad55' : '#fc8181';
  const planExpiry = planInfo?.plan === 'pro'
    ? `Ativo até ${new Date(planInfo.plan_expires_at).toLocaleDateString('pt-BR')}`
    : planInfo?.plan === 'trial'
    ? `${planInfo.trial_days_left} dia${planInfo.trial_days_left !== 1 ? 's' : ''} restante${planInfo.trial_days_left !== 1 ? 's' : ''} no trial`
    : 'Seu acesso expirou';

  const PIX_KEY   = 'felipe.tech.brasil@gmail.com';
  const PIX_NAME  = 'Felipe Macedo';

  return (
    <>
      {toast.msg && (
        <div style={{ position:'fixed', bottom:24, right:24, background:'#13131a', border:`1px solid ${toast.type==='error'?'rgba(252,129,129,.3)':'#2a2a3a'}`, borderRadius:12, padding:'14px 20px', fontSize:13, zIndex:999 }}>
          {toast.msg}
        </div>
      )}

      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:700 }}>Configurações</h1>
      </div>

      {/* ── MEU PLANO ── */}
      <div id="plano" style={{ ...card, marginBottom:20 }}>
        <div style={cardHeader}><h2 style={cardTitle}>💳 Meu Plano</h2></div>
        <div style={{ padding:20 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ padding:'6px 14px', background:`${planColor}22`, border:`1px solid ${planColor}55`, borderRadius:20, fontSize:13, fontWeight:700, color:planColor }}>
                {planLabel}
              </div>
              <span style={{ fontSize:13, color:'#6b6b80' }}>{planExpiry}</span>
            </div>
            {planInfo?.plan !== 'pro' && (
              <div style={{ fontSize:13, color:'#6b6b80' }}>
                Plano Pro: <strong style={{ color:'#e8e8f0' }}>R$ 49/mês</strong>
              </div>
            )}
          </div>

          {planInfo?.plan !== 'pro' && (
            <div style={{ background:'rgba(124,106,247,.06)', border:'1px solid rgba(124,106,247,.2)', borderRadius:12, padding:20 }}>
              <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>✨ Plano Pro — R$ 49/mês</div>
              <div style={{ fontSize:13, color:'#6b6b80', marginBottom:16, lineHeight:1.6 }}>
                Acesso completo e ilimitado ao AgendAI. Para assinar, envie o Pix abaixo e aguarde a confirmação por email.
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ background:'#1c1c26', borderRadius:10, padding:'14px 16px' }}>
                  <div style={{ fontSize:11, color:'#6b6b80', textTransform:'uppercase', letterSpacing:.5, marginBottom:6 }}>Chave Pix</div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                    <span style={{ fontSize:14, color:'#e8e8f0', fontWeight:600 }}>{PIX_KEY}</span>
                    <button onClick={() => { navigator.clipboard.writeText(PIX_KEY); showToast('✅ Chave Pix copiada!'); }}
                      style={{ padding:'6px 12px', background:'rgba(124,106,247,.2)', border:'1px solid rgba(124,106,247,.3)', borderRadius:6, color:'#a89cf7', fontSize:12, cursor:'pointer' }}>
                      Copiar
                    </button>
                  </div>
                </div>
                <div style={{ background:'#1c1c26', borderRadius:10, padding:'14px 16px' }}>
                  <div style={{ fontSize:11, color:'#6b6b80', textTransform:'uppercase', letterSpacing:.5, marginBottom:4 }}>Nome do destinatário</div>
                  <span style={{ fontSize:14, color:'#e8e8f0' }}>{PIX_NAME}</span>
                </div>
                <div style={{ background:'#1c1c26', borderRadius:10, padding:'14px 16px' }}>
                  <div style={{ fontSize:11, color:'#6b6b80', textTransform:'uppercase', letterSpacing:.5, marginBottom:4 }}>Valor</div>
                  <span style={{ fontSize:18, fontWeight:800, color:'#7c6af7' }}>R$ 49,00</span>
                </div>
              </div>

              <div style={{ marginTop:14, padding:'12px 14px', background:'rgba(79,209,197,.06)', border:'1px solid rgba(79,209,197,.15)', borderRadius:8, fontSize:12, color:'#4fd1c5', lineHeight:1.6 }}>
                📧 Após o Pix, envie o comprovante para <strong>felipe.tech.brasil@gmail.com</strong> com seu email cadastrado. Ativaremos em até 24h.
              </div>
            </div>
          )}

          {planInfo?.plan === 'pro' && (
            <div style={{ padding:'12px 16px', background:'rgba(104,211,145,.06)', border:'1px solid rgba(104,211,145,.2)', borderRadius:10, fontSize:13, color:'#68d391' }}>
              ✅ Plano Pro ativo. Para renovar, envie o Pix para <strong>felipe.tech.brasil@gmail.com</strong> antes do vencimento.
            </div>
          )}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* PERFIL */}
        <div style={card}>
          <div style={cardHeader}><h2 style={cardTitle}>👤 Perfil Profissional</h2></div>
          <form onSubmit={handleSaveProfile} style={{ padding:20, display:'flex', flexDirection:'column', gap:14 }}>
            <div><label style={labelStyle}>Nome Completo *</label><input required style={inputStyle} value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
            <div><label style={labelStyle}>Nome do Negócio</label><input style={inputStyle} value={form.business_name} onChange={e=>setForm({...form,business_name:e.target.value})} placeholder="Barbearia Silva..."/></div>
            <div><label style={labelStyle}>Profissão / Nicho</label>
              <select style={inputStyle} value={form.profession} onChange={e=>setForm({...form,profession:e.target.value})}>
                <option value="">Selecione...</option>
                {professions.map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Telefone</label><input style={inputStyle} value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="(11) 99999-9999"/></div>
            <div><label style={labelStyle}>Email</label><input style={{...inputStyle,opacity:.5}} value={user?.email||''} disabled/></div>
            <button type="submit" disabled={saving} style={{...btnPrimary,opacity:saving?.7:1}}>{saving?'Salvando...':'Salvar Alterações'}</button>
          </form>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {/* WHATSAPP */}
          <div style={card}>
            <div style={cardHeader}><h2 style={cardTitle}>📱 Integração WhatsApp</h2></div>
            <div style={{ padding:20, display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ padding:'12px 14px', background:'rgba(79,209,197,.08)', border:'1px solid rgba(79,209,197,.2)', borderRadius:8, fontSize:12, color:'#4fd1c5', lineHeight:1.6 }}>
                ℹ️ Configure sua conta Meta Business para envio automático de mensagens.<br/>
                <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" style={{color:'#4fd1c5'}}>developers.facebook.com →</a>
              </div>
              <div><label style={labelStyle}>WhatsApp Token</label><input type="password" style={inputStyle} value={form.whatsapp_token} onChange={e=>setForm({...form,whatsapp_token:e.target.value})} placeholder="EAAxxxxxxxxxx..."/></div>
              <div><label style={labelStyle}>Phone Number ID</label><input style={inputStyle} value={form.whatsapp_phone_id} onChange={e=>setForm({...form,whatsapp_phone_id:e.target.value})} placeholder="123456789012345"/></div>
              <button type="button" onClick={handleSaveProfile} style={{...btnPrimary,width:'100%'}}>Salvar Configuração</button>
            </div>
          </div>

          {/* SENHA */}
          <div style={card}>
            <div style={cardHeader}><h2 style={cardTitle}>🔐 Segurança</h2></div>
            <div style={{ padding:20, display:'flex', flexDirection:'column', gap:14 }}>
              <div><label style={labelStyle}>Senha Atual</label><input type="password" style={inputStyle} value={passwordForm.current} onChange={e=>setPasswordForm({...passwordForm,current:e.target.value})} placeholder="••••••••"/></div>
              <div><label style={labelStyle}>Nova Senha</label><input type="password" style={inputStyle} value={passwordForm.newPass} onChange={e=>setPasswordForm({...passwordForm,newPass:e.target.value})} placeholder="Mínimo 8 caracteres"/></div>
              <div><label style={labelStyle}>Confirmar Nova Senha</label><input type="password" style={inputStyle} value={passwordForm.confirm} onChange={e=>setPasswordForm({...passwordForm,confirm:e.target.value})} placeholder="••••••••"/></div>
              <button type="button" style={{...btnPrimary,background:'transparent',border:'1px solid #2a2a3a',color:'#e8e8f0'}}
                onClick={()=>showToast('⚠️ Em implementação — contate o suporte para alterar a senha')}>
                Alterar Senha
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const card       = { background:'#13131a', border:'1px solid #2a2a3a', borderRadius:16, overflow:'hidden' };
const cardHeader = { padding:'16px 20px', borderBottom:'1px solid #2a2a3a' };
const cardTitle  = { fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:700 };
const btnPrimary = { padding:'10px 16px', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer', border:'none', background:'#7c6af7', color:'#fff', fontFamily:'DM Sans,sans-serif' };
const labelStyle = { fontSize:12, color:'#6b6b80', textTransform:'uppercase', letterSpacing:'.5px', display:'block', marginBottom:6 };
const inputStyle = { width:'100%', padding:'10px 14px', background:'#1c1c26', border:'1px solid #2a2a3a', borderRadius:8, color:'#e8e8f0', fontSize:14, fontFamily:'DM Sans,sans-serif', outline:'none', boxSizing:'border-box' };
