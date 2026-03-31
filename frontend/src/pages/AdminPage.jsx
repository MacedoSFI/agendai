// src/pages/AdminPage.jsx
// Acesso: /admin — protegido por senha local (não precisa de rota no backend)

import React, { useState, useEffect, useCallback } from 'react';

const ADMIN_PASSWORD = 'agendai@admin2026'; // troque aqui
const API = 'https://agendai-production-17d6.up.railway.app/api';

export default function AdminPage() {
  const [authed, setAuthed]     = useState(false);
  const [pwd, setPwd]           = useState('');
  const [users, setUsers]       = useState([]);
  const [summary, setSummary]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState('');
  const [tab, setTab]           = useState('users'); // users | summary
  const [activating, setActivating] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  // Busca dados com token de admin (rota nova no backend)
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, sRes] = await Promise.all([
        fetch(`${API}/admin/users`, { headers: { 'x-admin-key': ADMIN_PASSWORD } }),
        fetch(`${API}/admin/summary`, { headers: { 'x-admin-key': ADMIN_PASSWORD } }),
      ]);
      if (!uRes.ok) throw new Error('Acesso negado');
      setUsers(await uRes.json());
      setSummary(await sRes.json());
    } catch (err) {
      showToast('❌ Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (authed) load(); }, [authed, load]);

  const activatePro = async (email) => {
    setActivating(email);
    try {
      const res = await fetch(`${API}/admin/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_PASSWORD },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      showToast(`✅ Plano Pro ativado para ${email}`);
      load();
    } catch {
      showToast('❌ Erro ao ativar plano');
    } finally {
      setActivating(null);
    }
  };

  const planLabel = (u) => {
    if (u.plan === 'pro') {
      const days = Math.ceil((new Date(u.plan_expires_at) - new Date()) / 86400000);
      return { label: `Pro · ${days}d`, color: '#4fd1c5' };
    }
    if (u.plan === 'trial') {
      const days = Math.ceil((new Date(u.trial_ends_at) - new Date()) / 86400000);
      if (days < 0)  return { label: 'Trial expirado', color: '#fc8181' };
      if (days <= 7) return { label: `Trial · ${days}d ⚠️`, color: '#f6ad55' };
      return { label: `Trial · ${days}d`, color: '#68d391' };
    }
    return { label: u.plan, color: '#6b6b80' };
  };

  // ── Login ──────────────────────────────────
  if (!authed) return (
    <div style={{ minHeight:'100vh', background:'#080810', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans', sans-serif" }}>
      <div style={{ background:'#13131a', border:'1px solid #2a2a3a', borderRadius:20, padding:36, width:340, maxWidth:'90vw' }}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🔐</div>
          <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:20, fontWeight:800, color:'#e8e8f0' }}>Admin AgendAI</h2>
        </div>
        <input
          type="password"
          placeholder="Senha admin"
          value={pwd}
          onChange={e => setPwd(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && pwd === ADMIN_PASSWORD && setAuthed(true)}
          style={{ width:'100%', padding:'11px 14px', background:'#1c1c26', border:'1px solid #2a2a3a', borderRadius:8, color:'#e8e8f0', fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:12, fontFamily:"'DM Sans', sans-serif" }}
        />
        <button
          onClick={() => { if (pwd === ADMIN_PASSWORD) setAuthed(true); else showToast('❌ Senha incorreta'); }}
          style={{ width:'100%', padding:'11px', background:'#7c6af7', border:'none', borderRadius:8, color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }}>
          Entrar
        </button>
        {toast && <div style={{ marginTop:12, fontSize:12, color:'#fc8181', textAlign:'center' }}>{toast}</div>}
      </div>
    </div>
  );

  // ── Painel ────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:'#080810', color:'#e8e8f0', fontFamily:"'DM Sans', sans-serif" }}>
      {toast && <div style={{ position:'fixed', bottom:24, right:24, background:'#13131a', border:'1px solid #2a2a3a', borderRadius:12, padding:'12px 20px', fontSize:13, zIndex:999 }}>{toast}</div>}

      {/* Header */}
      <div style={{ background:'#0d0d1a', borderBottom:'1px solid #1a1a2e', padding:'16px 28px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:20 }}>⚙️</span>
          <span style={{ fontFamily:'Syne, sans-serif', fontWeight:800, fontSize:18 }}>Admin AgendAI</span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={load} style={btnSm}>🔄 Atualizar</button>
          <button onClick={() => setAuthed(false)} style={{ ...btnSm, color:'#fc8181' }}>Sair</button>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 24px' }}>

        {/* Summary cards */}
        {summary && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:12, marginBottom:28 }}>
            {[
              { label:'Usuários',          value: summary.total_usuarios,      color:'#7c6af7' },
              { label:'Em Trial',          value: summary.em_trial,            color:'#f6ad55' },
              { label:'Plano Pro',         value: summary.plano_pro,           color:'#4fd1c5' },
              { label:'Trials Expirados',  value: summary.trials_expirados,    color:'#fc8181' },
              { label:'Agendamentos',      value: summary.total_agendamentos,  color:'#68d391' },
              { label:'Últ. 7 dias',       value: summary.agendamentos_7d,     color:'#63b3ed' },
            ].map(s => (
              <div key={s.label} style={{ background:'#0d0d1a', border:'1px solid #1a1a2e', borderRadius:14, padding:'16px 18px' }}>
                <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:11, color:'#555570', marginTop:4, textTransform:'uppercase', letterSpacing:.5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabela de usuários */}
        <div style={{ background:'#0d0d1a', border:'1px solid #1a1a2e', borderRadius:16, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #1a1a2e', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:15, fontWeight:700 }}>👥 Usuários cadastrados</h2>
            <span style={{ fontSize:12, color:'#555570' }}>{users.length} usuários</span>
          </div>
          {loading ? (
            <div style={{ padding:40, textAlign:'center', color:'#555570' }}>Carregando...</div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:700 }}>
                <thead>
                  <tr>
                    {['Nome','Email','Negócio','Plano','Cadastro','Ação'].map(h => (
                      <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, textTransform:'uppercase', letterSpacing:.5, color:'#555570', borderBottom:'1px solid #1a1a2e' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const pl = planLabel(u);
                    return (
                      <tr key={u.id} style={{ borderBottom:'1px solid rgba(26,26,46,.8)' }}>
                        <td style={td}>{u.name}</td>
                        <td style={{ ...td, color:'#6b6b80', fontSize:12 }}>{u.email}</td>
                        <td style={{ ...td, color:'#6b6b80' }}>{u.business_name || '—'}</td>
                        <td style={td}>
                          <span style={{ padding:'3px 10px', borderRadius:10, fontSize:11, fontWeight:600, background:`${pl.color}22`, color:pl.color }}>
                            {pl.label}
                          </span>
                        </td>
                        <td style={{ ...td, color:'#555570', fontSize:12 }}>
                          {new Date(u.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td style={td}>
                          {u.plan !== 'pro' && (
                            <button
                              onClick={() => activatePro(u.email)}
                              disabled={activating === u.email}
                              style={{ padding:'4px 12px', borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer', border:'1px solid rgba(79,209,197,.3)', background:'rgba(79,209,197,.1)', color:'#4fd1c5', fontFamily:"'DM Sans', sans-serif", opacity: activating === u.email ? 0.6 : 1 }}>
                              {activating === u.email ? '...' : '✓ Ativar Pro'}
                            </button>
                          )}
                          {u.plan === 'pro' && (
                            <button
                              onClick={() => activatePro(u.email)}
                              disabled={activating === u.email}
                              style={{ padding:'4px 12px', borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer', border:'1px solid rgba(124,106,247,.3)', background:'rgba(124,106,247,.1)', color:'#7c6af7', fontFamily:"'DM Sans', sans-serif" }}>
                              +30 dias
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const td    = { padding:'12px 16px', fontSize:13 };
const btnSm = { padding:'6px 14px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', border:'1px solid #2a2a3a', background:'transparent', color:'#e8e8f0', fontFamily:"'DM Sans', sans-serif" };
