// src/pages/PublicQuotePage.jsx
// Rota: /orcamento/:templateId
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'https://agendai-production-17d6.up.railway.app/api';

export default function PublicQuotePage() {
  const { templateId } = useParams();
  const navigate       = useNavigate();

  const [template, setTemplate] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [step, setStep]         = useState(1); // 1=items 2=dados 3=confirmação
  const [submitting, setSubmitting] = useState(false);

  // Seleções do cliente
  const [selected, setSelected]     = useState({}); // { itemId: quantity }
  const [discount, setDiscount]     = useState(0);
  const [clientForm, setClientForm] = useState({ name:'', phone:'', email:'', notes:'' });
  const [result, setResult]         = useState(null);

  useEffect(() => {
    axios.get(`${API}/public/quote-template/${templateId}`)
      .then(r => { setTemplate(r.data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [templateId]);

  const toggleItem = (item) => {
    setSelected(prev => {
      if (prev[item.id]) { const n={...prev}; delete n[item.id]; return n; }
      return { ...prev, [item.id]: item.quantity || 1 };
    });
  };

  const setQty = (itemId, qty) => {
    if (qty < 1) return;
    setSelected(prev => ({ ...prev, [itemId]: qty }));
  };

  const subtotal = template?.items.reduce((sum, it) => {
    if (!selected[it.id]) return sum;
    return sum + parseFloat(it.price) * selected[it.id];
  }, 0) || 0;

  const total = Math.max(subtotal - parseFloat(discount || 0), 0);
  const selectedItems = template?.items.filter(it => selected[it.id]) || [];

  const handleSubmit = async () => {
    if (!clientForm.name || !clientForm.phone) return;
    setSubmitting(true);
    try {
      const items = selectedItems.map(it => ({
        name: it.name, description: it.description,
        price: it.price, quantity: selected[it.id],
      }));
      const { data } = await axios.post(`${API}/public/quotes`, {
        template_id:  template.id,
        client_name:  clientForm.name,
        client_phone: clientForm.phone,
        client_email: clientForm.email,
        notes:        clientForm.notes,
        discount:     parseFloat(discount || 0),
        items,
        validity_days: template.validity_days,
      });
      setResult(data);
      setStep(3);
    } catch {
      alert('Erro ao enviar orçamento. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#080810', display:'flex', alignItems:'center', justifyContent:'center', color:'#6b6b80', fontFamily:"'DM Sans', sans-serif" }}>
      Carregando...
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight:'100vh', background:'#080810', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#e8e8f0', fontFamily:"'DM Sans', sans-serif" }}>
      <div style={{ fontSize:48, marginBottom:16 }}>😕</div>
      <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:22, fontWeight:800 }}>Formulário não encontrado</h2>
      <p style={{ color:'#6b6b80', marginTop:8 }}>O link pode ter expirado ou sido desativado.</p>
    </div>
  );

  return (
    <div style={wrap}>
      {/* Header */}
      <div style={header}>
        <div style={headerInner}>
          <div style={badge}>💰 Orçamento</div>
          <h1 style={title}>{template.business_name || template.professional_name}</h1>
          <p style={sub}>{template.name}</p>
          {template.description && <p style={{ color:'#6b6b80', fontSize:13, marginTop:4 }}>{template.description}</p>}
        </div>
      </div>

      <div style={container}>
        {/* Steps indicator */}
        <div style={{ display:'flex', gap:8, marginBottom:28, justifyContent:'center' }}>
          {['Itens','Seus dados','Confirmação'].map((s,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:24, height:24, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, background: step>i+1?'#68d391': step===i+1?'#7c6af7':'#1c1c26', color: step>=i+1?'#fff':'#555570', border: step===i+1?'none':'1px solid #2a2a3a' }}>{i+1}</div>
              <span style={{ fontSize:12, color: step===i+1?'#e8e8f0':'#555570' }}>{s}</span>
              {i < 2 && <span style={{ color:'#2a2a3a', fontSize:12 }}>›</span>}
            </div>
          ))}
        </div>

        {/* STEP 1 — Selecionar itens */}
        {step === 1 && (
          <div>
            <h2 style={stepTitle}>Selecione os serviços</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
              {template.items.map(it => {
                const isSelected = !!selected[it.id];
                return (
                  <div key={it.id} onClick={()=>toggleItem(it)} style={{ ...itemCard, border:`1px solid ${isSelected?'#7c6af7':'rgba(255,255,255,.08)'}`, background: isSelected?'rgba(124,106,247,.06)':'rgba(255,255,255,.02)', cursor:'pointer' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:20, height:20, borderRadius:4, border:`2px solid ${isSelected?'#7c6af7':'#444460'}`, background: isSelected?'#7c6af7':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          {isSelected && <span style={{ color:'#fff', fontSize:12 }}>✓</span>}
                        </div>
                        <div>
                          <div style={{ fontSize:14, fontWeight:600, color:'#e8e8f0' }}>{it.name}</div>
                          {it.description && <div style={{ fontSize:12, color:'#6b6b80', marginTop:2 }}>{it.description}</div>}
                        </div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontSize:15, fontWeight:700, color:'#68d391' }}>R$ {parseFloat(it.price).toFixed(2)}</div>
                        {isSelected && it.adjustable && (
                          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:6, justifyContent:'flex-end' }} onClick={e=>e.stopPropagation()}>
                            <button onClick={()=>setQty(it.id, selected[it.id]-1)} style={qtyBtn}>−</button>
                            <span style={{ fontSize:13, minWidth:20, textAlign:'center' }}>{selected[it.id]}</span>
                            <button onClick={()=>setQty(it.id, selected[it.id]+1)} style={qtyBtn}>+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Resumo */}
            {selectedItems.length > 0 && (
              <div style={{ background:'rgba(104,211,145,.06)', border:'1px solid rgba(104,211,145,.2)', borderRadius:12, padding:16, marginBottom:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#a0a0b8', marginBottom:4 }}>
                  <span>Subtotal</span><span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:16, fontWeight:700, color:'#68d391' }}>
                  <span>Total estimado</span><span>R$ {total.toFixed(2)}</span>
                </div>
                <div style={{ fontSize:11, color:'#555570', marginTop:6 }}>Válido por {template.validity_days} dias</div>
              </div>
            )}

            <button
              onClick={()=>setStep(2)}
              disabled={selectedItems.length === 0}
              style={{ ...btnPrimary, width:'100%', padding:14, fontSize:15, opacity: selectedItems.length===0?.5:1 }}>
              Continuar →
            </button>
          </div>
        )}

        {/* STEP 2 — Dados do cliente */}
        {step === 2 && (
          <div>
            <button onClick={()=>setStep(1)} style={backBtn}>← Voltar</button>
            <h2 style={stepTitle}>Seus dados</h2>

            {/* Resumo dos itens */}
            <div style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.06)', borderRadius:12, padding:16, marginBottom:24 }}>
              {selectedItems.map(it => (
                <div key={it.id} style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#a0a0b8', padding:'4px 0' }}>
                  <span>{it.name} {selected[it.id]>1?`x${selected[it.id]}`:''}</span>
                  <span>R$ {(parseFloat(it.price)*selected[it.id]).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ borderTop:'1px solid rgba(255,255,255,.06)', marginTop:10, paddingTop:10, display:'flex', justifyContent:'space-between', fontWeight:700, color:'#68d391' }}>
                <span>Total</span><span>R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:20 }}>
              <div><label style={lbl}>Seu nome *</label>
                <input style={inp} value={clientForm.name} onChange={e=>setClientForm({...clientForm,name:e.target.value})} placeholder="Nome completo"/></div>
              <div><label style={lbl}>WhatsApp *</label>
                <input style={inp} value={clientForm.phone} onChange={e=>setClientForm({...clientForm,phone:e.target.value})} placeholder="(11) 99999-9999" type="tel"/></div>
              <div><label style={lbl}>E-mail</label>
                <input style={inp} value={clientForm.email} onChange={e=>setClientForm({...clientForm,email:e.target.value})} placeholder="opcional" type="email"/></div>
              <div><label style={lbl}>Observações</label>
                <textarea style={{ ...inp, minHeight:70, resize:'vertical' }} value={clientForm.notes} onChange={e=>setClientForm({...clientForm,notes:e.target.value})} placeholder="Alguma observação?"/></div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !clientForm.name || !clientForm.phone}
              style={{ ...btnPrimary, width:'100%', padding:14, fontSize:15, opacity: (!clientForm.name||!clientForm.phone||submitting)?.5:1 }}>
              {submitting ? 'Enviando...' : 'Enviar orçamento →'}
            </button>
          </div>
        )}

        {/* STEP 3 — Confirmação */}
        {step === 3 && (
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:64, marginBottom:16 }}>🎉</div>
            <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:24, fontWeight:800, marginBottom:8 }}>Orçamento enviado!</h2>
            <p style={{ color:'#8b8ba0', marginBottom:28 }}>O profissional irá analisar e entrar em contato em breve.</p>
            <div style={{ background:'rgba(104,211,145,.06)', border:'1px solid rgba(104,211,145,.2)', borderRadius:16, padding:24, textAlign:'left', marginBottom:24 }}>
              <div style={confirmRow}><span style={confirmLbl}>Cliente</span><span style={confirmVal}>{clientForm.name}</span></div>
              <div style={confirmRow}><span style={confirmLbl}>WhatsApp</span><span style={confirmVal}>{clientForm.phone}</span></div>
              {selectedItems.map(it=>(
                <div key={it.id} style={confirmRow}><span style={confirmLbl}>{it.name}</span><span style={confirmVal}>R$ {(parseFloat(it.price)*selected[it.id]).toFixed(2)}</span></div>
              ))}
              <div style={{ ...confirmRow, borderBottom:'none', marginTop:8 }}><span style={{ ...confirmLbl, color:'#68d391' }}>Total</span><span style={{ ...confirmVal, color:'#68d391', fontWeight:700, fontSize:16 }}>R$ {total.toFixed(2)}</span></div>
            </div>
            <p style={{ color:'#444460', fontSize:12 }}>Orçamento via AgendAI ✨</p>
          </div>
        )}
      </div>
    </div>
  );
}

const wrap        = { minHeight:'100vh', background:'#080810', color:'#e8e8f0', fontFamily:"'DM Sans', sans-serif" };
const header      = { background:'linear-gradient(160deg,#0d0d1a,#13131a)', borderBottom:'1px solid #1a1a2e', padding:'48px 24px 36px' };
const headerInner = { maxWidth:560, margin:'0 auto', textAlign:'center' };
const badge       = { display:'inline-block', padding:'4px 14px', borderRadius:20, background:'rgba(124,106,247,.15)', border:'1px solid rgba(124,106,247,.3)', color:'#7c6af7', fontSize:12, fontWeight:600, letterSpacing:1, marginBottom:14 };
const title       = { fontFamily:'Syne, sans-serif', fontSize:28, fontWeight:800, marginBottom:4 };
const sub         = { color:'#8b8ba0', fontSize:15 };
const container   = { maxWidth:560, margin:'0 auto', padding:'36px 20px' };
const stepTitle   = { fontFamily:'Syne, sans-serif', fontSize:20, fontWeight:800, marginBottom:20 };
const backBtn     = { background:'none', border:'none', color:'#7c6af7', cursor:'pointer', fontSize:13, fontWeight:600, padding:'0 0 20px', display:'block', fontFamily:"'DM Sans', sans-serif" };
const btnPrimary  = { background:'linear-gradient(135deg,#7c6af7,#4fd1c5)', border:'none', borderRadius:12, color:'#fff', fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans', sans-serif" };
const itemCard    = { borderRadius:12, padding:16, transition:'all .15s' };
const qtyBtn      = { width:28, height:28, borderRadius:6, border:'1px solid #2a2a3a', background:'#1c1c26', color:'#e8e8f0', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' };
const lbl         = { fontSize:11, color:'#6b6b80', textTransform:'uppercase', letterSpacing:.5, display:'block', marginBottom:6 };
const inp         = { width:'100%', background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', borderRadius:10, padding:'12px 14px', color:'#e8e8f0', fontSize:15, outline:'none', fontFamily:"'DM Sans', sans-serif", boxSizing:'border-box' };
const confirmRow  = { display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,.05)' };
const confirmLbl  = { fontSize:12, color:'#8b8ba0' };
const confirmVal  = { fontSize:13, color:'#e8e8f0', fontWeight:500 };
