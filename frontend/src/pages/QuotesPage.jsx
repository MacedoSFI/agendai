// src/pages/QuotesPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';

const TABS = ['templates', 'orcamentos'];

export default function QuotesPage() {
  const [tab, setTab]               = useState('templates');
  const [templates, setTemplates]   = useState([]);
  const [quotes, setQuotes]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState('');

  // Modals
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate]     = useState(null);
  const [showConvertModal, setShowConvertModal]   = useState(false);
  const [convertingQuote, setConvertingQuote]     = useState(null);
  const [services, setServices]                   = useState([]);

  // Template form
  const emptyTemplate = { name:'', description:'', validity_days:7, items:[] };
  const [tForm, setTForm] = useState(emptyTemplate);
  const [saving, setSaving] = useState(false);

  // Convert form
  const [cForm, setCForm] = useState({ service_id:'', start_time:'' });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, qRes] = await Promise.all([
        api.get('/quotes/templates'),
        api.get('/quotes'),
      ]);
      setTemplates(tRes.data);
      setQuotes(qRes.data);
    } catch { showToast('❌ Erro ao carregar dados'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Template CRUD ──────────────────────────
  const openCreate = () => { setEditingTemplate(null); setTForm(emptyTemplate); setShowTemplateModal(true); };
  const openEdit   = (t) => { setEditingTemplate(t); setTForm({ name:t.name, description:t.description||'', validity_days:t.validity_days, items: t.items.map(i=>({...i})) }); setShowTemplateModal(true); };

  const addItem = () => setTForm(f => ({ ...f, items:[...f.items,{ name:'', description:'', price:'', quantity:1, adjustable:false }] }));
  const removeItem = (idx) => setTForm(f => ({ ...f, items: f.items.filter((_,i)=>i!==idx) }));
  const updateItem = (idx, field, val) => setTForm(f => ({ ...f, items: f.items.map((it,i)=> i===idx ? {...it,[field]:val} : it) }));

  const saveTemplate = async (e) => {
    e.preventDefault();
    if (!tForm.items.length) return showToast('❌ Adicione pelo menos um item');
    setSaving(true);
    try {
      if (editingTemplate) await api.put(`/quotes/templates/${editingTemplate.id}`, { ...tForm, active: true });
      else                  await api.post('/quotes/templates', tForm);
      setShowTemplateModal(false);
      load();
      showToast(editingTemplate ? '✅ Template atualizado!' : '✅ Template criado!');
    } catch (err) { showToast('❌ ' + (err.response?.data?.error || 'Erro ao salvar')); }
    finally { setSaving(false); }
  };

  const deleteTemplate = async (id) => {
    if (!window.confirm('Remover este template?')) return;
    try { await api.delete(`/quotes/templates/${id}`); load(); showToast('✅ Removido'); }
    catch { showToast('❌ Erro ao remover'); }
  };

  const copyLink = (id) => {
    const url = `${window.location.origin}/orcamento/${id}`;
    navigator.clipboard.writeText(url);
    showToast('📋 Link copiado!');
  };

  // ── Converter em agendamento ───────────────
  const openConvert = async (quote) => {
    setConvertingQuote(quote);
    const { data } = await api.get('/services');
    setServices(data);
    setCForm({ service_id:'', start_time:'' });
    setShowConvertModal(true);
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/quotes/${convertingQuote.id}/convert`, cForm);
      setShowConvertModal(false);
      load();
      showToast('✅ Convertido em agendamento!');
    } catch (err) { showToast('❌ ' + (err.response?.data?.error || 'Erro ao converter')); }
    finally { setSaving(false); }
  };

  const statusInfo = (s) => ({
    draft:     { label:'Rascunho',   color:'#6b6b80' },
    sent:      { label:'Enviado',    color:'#63b3ed' },
    accepted:  { label:'Aceito',     color:'#68d391' },
    rejected:  { label:'Recusado',   color:'#fc8181' },
    converted: { label:'Convertido', color:'#4fd1c5' },
  }[s] || { label:s, color:'#6b6b80' });

  const BASE_URL = window.location.origin;

  return (
    <>
      {toast && <div style={{ position:'fixed', bottom:24, right:24, background:'#13131a', border:'1px solid #2a2a3a', borderRadius:12, padding:'14px 20px', fontSize:13, zIndex:999 }}>{toast}</div>}

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h1 style={{ fontFamily:'Syne, sans-serif', fontSize:20, fontWeight:700 }}>💰 Orçamentos</h1>
        {tab === 'templates' && <button onClick={openCreate} style={btnPrimary}>＋ Novo Template</button>}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:24 }}>
        {[['templates','📋 Templates'],['orcamentos','📄 Orçamentos gerados']].map(([key,label]) => (
          <button key={key} onClick={()=>setTab(key)} style={{ padding:'7px 18px', borderRadius:20, fontSize:13, fontWeight:600, cursor:'pointer', border:`1px solid ${tab===key?'#7c6af7':'#2a2a3a'}`, background: tab===key?'rgba(124,106,247,.15)':'transparent', color: tab===key?'#7c6af7':'#6b6b80', fontFamily:"'DM Sans', sans-serif" }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? <div style={{ padding:40, textAlign:'center', color:'#6b6b80' }}>Carregando...</div> : (<>

        {/* ── TEMPLATES ── */}
        {tab === 'templates' && (
          templates.length === 0
            ? <div style={{ ...card, padding:48, textAlign:'center', color:'#6b6b80' }}>
                <div style={{ fontSize:36, marginBottom:12 }}>📋</div>
                <p>Nenhum template criado ainda.</p>
                <button onClick={openCreate} style={{ ...btnPrimary, marginTop:16 }}>Criar primeiro template</button>
              </div>
            : <div style={{ display:'grid', gap:16 }}>
                {templates.map(t => (
                  <div key={t.id} style={card}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                          <strong style={{ fontSize:15 }}>{t.name}</strong>
                          <span style={{ fontSize:11, padding:'2px 8px', borderRadius:10, background: t.active?'rgba(104,211,145,.15)':'rgba(252,129,129,.15)', color: t.active?'#68d391':'#fc8181' }}>{t.active?'Ativo':'Inativo'}</span>
                        </div>
                        {t.description && <p style={{ fontSize:12, color:'#6b6b80', marginBottom:8 }}>{t.description}</p>}
                        <div style={{ fontSize:12, color:'#555570' }}>
                          {t.items.length} iten{t.items.length!==1?'s':''} · Validade: {t.validity_days} dia{t.validity_days!==1?'s':''}
                        </div>
                        <div style={{ marginTop:8, fontSize:12, color:'#444460', wordBreak:'break-all' }}>
                          🔗 {BASE_URL}/orcamento/{t.id}
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        <button onClick={()=>copyLink(t.id)} style={btnSm}>📋 Copiar link</button>
                        <button onClick={()=>openEdit(t)} style={btnSm}>✏️ Editar</button>
                        <button onClick={()=>deleteTemplate(t.id)} style={{ ...btnSm, color:'#fc8181', borderColor:'rgba(252,129,129,.3)', background:'rgba(252,129,129,.08)' }}>🗑</button>
                      </div>
                    </div>
                    {t.items.length > 0 && (
                      <div style={{ marginTop:16, borderTop:'1px solid #1a1a2e', paddingTop:14, display:'flex', flexWrap:'wrap', gap:8 }}>
                        {t.items.map((it,i) => (
                          <div key={i} style={{ fontSize:12, padding:'4px 12px', background:'#1c1c26', borderRadius:8, color:'#a0a0b8' }}>
                            {it.name} · <span style={{ color:'#68d391' }}>R$ {parseFloat(it.price).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
        )}

        {/* ── ORÇAMENTOS ── */}
        {tab === 'orcamentos' && (
          quotes.length === 0
            ? <div style={{ ...card, padding:48, textAlign:'center', color:'#6b6b80' }}>
                <div style={{ fontSize:36, marginBottom:12 }}>📄</div>
                <p>Nenhum orçamento gerado ainda.</p>
              </div>
            : <div style={{ display:'grid', gap:14 }}>
                {quotes.map(q => {
                  const st = statusInfo(q.status);
                  return (
                    <div key={q.id} style={card}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
                        <div>
                          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                            <strong style={{ fontSize:15 }}>{q.client_name || 'Cliente não informado'}</strong>
                            <span style={{ fontSize:11, padding:'2px 8px', borderRadius:10, background:`${st.color}22`, color:st.color }}>{st.label}</span>
                          </div>
                          {q.client_phone && <div style={{ fontSize:12, color:'#6b6b80' }}>📱 {q.client_phone}</div>}
                          {q.template_name && <div style={{ fontSize:12, color:'#555570', marginTop:2 }}>Template: {q.template_name}</div>}
                          <div style={{ marginTop:8, display:'flex', gap:16 }}>
                            <span style={{ fontSize:14, fontWeight:700, color:'#68d391' }}>R$ {parseFloat(q.total).toFixed(2)}</span>
                            <span style={{ fontSize:12, color:'#555570' }}>{new Date(q.created_at).toLocaleDateString('pt-BR')}</span>
                            {q.expires_at && <span style={{ fontSize:12, color: new Date(q.expires_at)<new Date()?'#fc8181':'#555570' }}>Expira: {new Date(q.expires_at).toLocaleDateString('pt-BR')}</span>}
                          </div>
                          {q.items.length > 0 && (
                            <div style={{ marginTop:10, display:'flex', flexWrap:'wrap', gap:6 }}>
                              {q.items.map((it,i)=>(
                                <span key={i} style={{ fontSize:11, padding:'3px 10px', background:'#1c1c26', borderRadius:8, color:'#a0a0b8' }}>
                                  {it.name} x{it.quantity}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                          {q.status !== 'converted' && (
                            <button onClick={()=>openConvert(q)} style={{ ...btnSm, color:'#4fd1c5', borderColor:'rgba(79,209,197,.3)', background:'rgba(79,209,197,.08)' }}>
                              📅 Converter em agendamento
                            </button>
                          )}
                          {q.status === 'converted' && (
                            <span style={{ fontSize:12, color:'#4fd1c5', padding:'4px 12px' }}>✓ Agendamento criado</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
        )}
      </>)}

      {/* ── Modal Template ── */}
      {showTemplateModal && (
        <div style={modalBg} onClick={e=>e.target===e.currentTarget&&setShowTemplateModal(false)}>
          <div style={{ ...modalBox, maxHeight:'90vh', overflowY:'auto' }}>
            <h2 style={modalTitle}>{editingTemplate?'✏️ Editar Template':'📋 Novo Template de Orçamento'}</h2>
            <form onSubmit={saveTemplate}>
              <div style={field}><label style={lbl}>Nome do template *</label>
                <input required style={inp} value={tForm.name} onChange={e=>setTForm({...tForm,name:e.target.value})} placeholder="Ex: Pacote Noiva Completo"/></div>
              <div style={field}><label style={lbl}>Descrição</label>
                <input style={inp} value={tForm.description} onChange={e=>setTForm({...tForm,description:e.target.value})} placeholder="Descrição opcional"/></div>
              <div style={field}><label style={lbl}>Validade (dias)</label>
                <input type="number" min="1" style={inp} value={tForm.validity_days} onChange={e=>setTForm({...tForm,validity_days:parseInt(e.target.value)})}/></div>

              {/* Itens */}
              <div style={{ marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <label style={lbl}>Itens do orçamento *</label>
                  <button type="button" onClick={addItem} style={{ ...btnSm, fontSize:11 }}>＋ Adicionar item</button>
                </div>
                {tForm.items.length === 0 && <div style={{ fontSize:12, color:'#555570', padding:'12px 0' }}>Nenhum item adicionado ainda.</div>}
                {tForm.items.map((it,idx) => (
                  <div key={idx} style={{ background:'#1c1c26', border:'1px solid #2a2a3a', borderRadius:10, padding:14, marginBottom:10 }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                      <div><label style={lbl}>Nome *</label>
                        <input required style={inp} value={it.name} onChange={e=>updateItem(idx,'name',e.target.value)} placeholder="Ex: Maquiagem"/></div>
                      <div><label style={lbl}>Preço (R$) *</label>
                        <input required type="number" min="0" step="0.01" style={inp} value={it.price} onChange={e=>updateItem(idx,'price',e.target.value)} placeholder="0.00"/></div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                      <div><label style={lbl}>Quantidade padrão</label>
                        <input type="number" min="1" style={inp} value={it.quantity} onChange={e=>updateItem(idx,'quantity',parseInt(e.target.value))}/></div>
                      <div style={{ display:'flex', alignItems:'center', gap:8, paddingTop:22 }}>
                        <input type="checkbox" id={`adj${idx}`} checked={it.adjustable} onChange={e=>updateItem(idx,'adjustable',e.target.checked)}/>
                        <label htmlFor={`adj${idx}`} style={{ fontSize:12, cursor:'pointer' }}>Cliente pode alterar qtd</label>
                      </div>
                    </div>
                    <div><label style={lbl}>Descrição do item</label>
                      <input style={inp} value={it.description||''} onChange={e=>updateItem(idx,'description',e.target.value)} placeholder="Opcional"/></div>
                    <button type="button" onClick={()=>removeItem(idx)} style={{ marginTop:10, fontSize:11, color:'#fc8181', background:'none', border:'none', cursor:'pointer' }}>🗑 Remover item</button>
                  </div>
                ))}
              </div>

              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button type="button" onClick={()=>setShowTemplateModal(false)} style={{ ...btnSm, padding:'8px 16px' }}>Cancelar</button>
                <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity:saving?.7:1 }}>{saving?'Salvando...':'Salvar Template'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Converter ── */}
      {showConvertModal && convertingQuote && (
        <div style={modalBg} onClick={e=>e.target===e.currentTarget&&setShowConvertModal(false)}>
          <div style={modalBox}>
            <h2 style={modalTitle}>📅 Converter em Agendamento</h2>
            <div style={{ background:'#1c1c26', borderRadius:10, padding:14, marginBottom:20, fontSize:13 }}>
              <div><strong>{convertingQuote.client_name}</strong></div>
              <div style={{ color:'#6b6b80' }}>{convertingQuote.client_phone}</div>
              <div style={{ color:'#68d391', fontWeight:700, marginTop:4 }}>R$ {parseFloat(convertingQuote.total).toFixed(2)}</div>
            </div>
            <form onSubmit={handleConvert}>
              <div style={field}><label style={lbl}>Serviço *</label>
                <select required style={inp} value={cForm.service_id} onChange={e=>setCForm({...cForm,service_id:e.target.value})}>
                  <option value="">Selecione o serviço...</option>
                  {services.map(s=><option key={s.id} value={s.id}>{s.name} — R$ {parseFloat(s.price).toFixed(2)}</option>)}
                </select>
              </div>
              <div style={field}><label style={lbl}>Data e horário *</label>
                <input required type="datetime-local" style={inp} value={cForm.start_time} onChange={e=>setCForm({...cForm,start_time:e.target.value})}/></div>
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button type="button" onClick={()=>setShowConvertModal(false)} style={{ ...btnSm, padding:'8px 16px' }}>Cancelar</button>
                <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity:saving?.7:1 }}>{saving?'Convertendo...':'Confirmar Agendamento'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const card     = { background:'#13131a', border:'1px solid #2a2a3a', borderRadius:16, padding:20 };
const btnPrimary = { padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', border:'none', background:'#7c6af7', color:'#fff', fontFamily:"'DM Sans', sans-serif" };
const btnSm    = { padding:'5px 12px', borderRadius:6, fontSize:12, fontWeight:500, cursor:'pointer', border:'1px solid #2a2a3a', background:'transparent', color:'#e8e8f0', fontFamily:"'DM Sans', sans-serif" };
const modalBg  = { position:'fixed', inset:0, background:'rgba(0,0,0,.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, backdropFilter:'blur(4px)', padding:'20px 0', overflowY:'auto' };
const modalBox = { background:'#13131a', border:'1px solid #2a2a3a', borderRadius:20, padding:28, width:520, maxWidth:'95vw' };
const modalTitle = { fontFamily:'Syne, sans-serif', fontSize:18, fontWeight:700, marginBottom:20 };
const field    = { marginBottom:16 };
const lbl      = { fontSize:11, color:'#6b6b80', textTransform:'uppercase', letterSpacing:.5, display:'block', marginBottom:6 };
const inp      = { width:'100%', padding:'10px 14px', background:'#1c1c26', border:'1px solid #2a2a3a', borderRadius:8, color:'#e8e8f0', fontSize:14, fontFamily:"'DM Sans', sans-serif", outline:'none', boxSizing:'border-box' };
