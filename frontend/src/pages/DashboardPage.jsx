import React, { useEffect, useState } from 'react';
import api from '../utils/api';

export default function DashboardPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [planInfo, setPlanInfo] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/appointments/dashboard'),
      api.get('/auth/plan'),
    ]).then(([dash, plan]) => {
      setData(dash.data);
      setPlanInfo(plan.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const statusBadge = (status) => {
    const map    = { pending:'badge-pending', confirmed:'badge-confirmed', completed:'badge-completed', cancelled:'badge-cancelled' };
    const labels = { pending:'Pendente', confirmed:'Confirmado', completed:'Concluído', cancelled:'Cancelado' };
    return <span className={`badge ${map[status]}`}>{labels[status]}</span>;
  };

  if (loading) return <div className="empty"><div className="emoji">⏳</div><p>Carregando...</p></div>;

  const today    = data?.today || [];
  const stats    = data?.month_stats || {};
  const upcoming = data?.upcoming || [];

  const PlanBanner = () => {
    if (!planInfo || planInfo.plan === 'pro') return null;

    if (planInfo.plan === 'trial') {
      const days = planInfo.trial_days_left;
      if (days > 7) return null; // Só mostra quando restam 7 dias ou menos
      return (
        <div style={{ marginBottom: 20, padding: '14px 20px', borderRadius: 12, background: 'linear-gradient(135deg,rgba(246,173,85,.12),rgba(252,129,129,.08))', border: '1px solid rgba(246,173,85,.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>⏰</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f6ad55' }}>
                {days === 0 ? 'Último dia do trial!' : `${days} dia${days > 1 ? 's' : ''} restante${days > 1 ? 's' : ''} no trial`}
              </div>
              <div style={{ fontSize: 12, color: '#6b6b80', marginTop: 2 }}>Assine o Pro para continuar sem interrupções</div>
            </div>
          </div>
          <a href="/app/settings#plano" style={{ padding: '8px 18px', background: 'linear-gradient(135deg,#7c6af7,#4fd1c5)', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            Ver planos →
          </a>
        </div>
      );
    }

    if (planInfo.plan === 'expired') {
      return (
        <div style={{ marginBottom: 20, padding: '20px', borderRadius: 12, background: 'rgba(252,129,129,.08)', border: '1px solid rgba(252,129,129,.3)', textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fc8181', marginBottom: 6 }}>Seu acesso expirou</div>
          <div style={{ fontSize: 13, color: '#6b6b80', marginBottom: 16 }}>Assine o plano Pro para continuar usando o AgendAI</div>
          <a href="/app/settings#plano" style={{ display: 'inline-block', padding: '10px 24px', background: 'linear-gradient(135deg,#7c6af7,#4fd1c5)', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            Assinar agora — R$ 49/mês
          </a>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <PlanBanner />

      <div className="stats-grid">
        <div className="stat-card" style={{'--card-color':'#7c6af7'}}>
          <span className="stat-icon">📅</span>
          <div className="stat-label">Hoje</div>
          <div className="stat-value" style={{color:'var(--accent)'}}>{today.length}</div>
          <div className="stat-change" style={{color:'var(--muted)'}}>agendamentos</div>
        </div>
        <div className="stat-card" style={{'--card-color':'#4fd1c5'}}>
          <span className="stat-icon">✅</span>
          <div className="stat-label">Concluídos no mês</div>
          <div className="stat-value" style={{color:'var(--accent2)'}}>{stats.completed || 0}</div>
        </div>
        <div className="stat-card" style={{'--card-color':'#f6ad55'}}>
          <span className="stat-icon">💰</span>
          <div className="stat-label">Faturamento do mês</div>
          <div className="stat-value" style={{color:'var(--accent3)'}}>
            R${parseFloat(stats.revenue||0).toFixed(0)}
          </div>
        </div>
        <div className="stat-card" style={{'--card-color':'#68d391'}}>
          <span className="stat-icon">📋</span>
          <div className="stat-label">Próximos</div>
          <div className="stat-value" style={{color:'var(--success)'}}>{upcoming.length}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h2>Agenda de Hoje</h2>
            <span className="tag">{today.length} agendamentos</span>
          </div>
          {today.length === 0
            ? <div className="empty"><div className="emoji">🎉</div><p>Sem agendamentos hoje!</p></div>
            : <table>
                <thead><tr><th>Horário</th><th>Cliente</th><th>Serviço</th><th>Status</th></tr></thead>
                <tbody>
                  {today.map(a => (
                    <tr key={a.id}>
                      <td><strong>{new Date(a.start_time).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',timeZone:'America/Sao_Paulo'})}</strong></td>
                      <td>{a.client_name}</td>
                      <td><span className="color-dot" style={{background:a.service_color||'#7c6af7'}}></span>{a.service_name}</td>
                      <td>{statusBadge(a.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>

        <div className="card">
          <div className="card-header"><h2>Próximos Agendamentos</h2></div>
          {upcoming.length === 0
            ? <div className="empty"><div className="emoji">📆</div><p>Nenhum agendamento futuro</p></div>
            : <table>
                <thead><tr><th>Data/Hora</th><th>Cliente</th><th>Serviço</th></tr></thead>
                <tbody>
                  {upcoming.map(a => (
                    <tr key={a.id}>
                      <td>{new Date(a.start_time).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',timeZone:'America/Sao_Paulo'})}</td>
                      <td>{a.client_name}</td>
                      <td>{a.service_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      </div>
    </>
  );
}
