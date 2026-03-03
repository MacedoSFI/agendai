import React, { useEffect, useState } from 'react';
import api from '../utils/api';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/appointments/dashboard')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (status) => {
    const map = { pending:'badge-pending', confirmed:'badge-confirmed', completed:'badge-completed', cancelled:'badge-cancelled' };
    const labels = { pending:'Pendente', confirmed:'Confirmado', completed:'Concluído', cancelled:'Cancelado' };
    return <span className={`badge ${map[status]}`}>{labels[status]}</span>;
  };

  if (loading) return <div className="empty"><div className="emoji">⏳</div><p>Carregando...</p></div>;

  const today = data?.today || [];
  const stats = data?.month_stats || {};
  const upcoming = data?.upcoming || [];

  return (
    <>
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
