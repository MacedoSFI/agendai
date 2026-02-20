import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../utils/api';

const COLORS = ['#7c6af7','#4fd1c5','#f6ad55','#68d391','#fc8181'];

export default function ReportsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/appointments/report?year=${year}&month=${month}`)
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year, month]);

  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  if (loading) return <div className="empty"><div className="emoji">⏳</div><p>Carregando relatório...</p></div>;

  const s = data?.summary || {};
  const byService = data?.by_service || [];
  const daily = data?.daily || [];

  return (
    <>
      <div className="flex-between mb-20">
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <select className="form-control" style={{width:'auto',padding:'8px 12px'}}
            value={month} onChange={e=>setMonth(parseInt(e.target.value))}>
            {months.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <select className="form-control" style={{width:'auto',padding:'8px 12px'}}
            value={year} onChange={e=>setYear(parseInt(e.target.value))}>
            <option>2026</option><option>2025</option>
          </select>
        </div>
      </div>

      <div className="stats-grid mb-20">
        <div className="stat-card" style={{'--card-color':'#7c6af7'}}>
          <span className="stat-icon">✅</span>
          <div className="stat-label">Concluídos</div>
          <div className="stat-value" style={{color:'var(--accent)'}}>{s.total_completed||0}</div>
        </div>
        <div className="stat-card" style={{'--card-color':'#4fd1c5'}}>
          <span className="stat-icon">💰</span>
          <div className="stat-label">Faturamento</div>
          <div className="stat-value" style={{color:'var(--accent2)',fontSize:22}}>R${parseFloat(s.total_revenue||0).toFixed(2)}</div>
        </div>
        <div className="stat-card" style={{'--card-color':'#f6ad55'}}>
          <span className="stat-icon">🎯</span>
          <div className="stat-label">Ticket Médio</div>
          <div className="stat-value" style={{color:'var(--accent3)',fontSize:22}}>
            R${s.total_completed > 0 ? (s.total_revenue/s.total_completed).toFixed(2) : '0.00'}
          </div>
        </div>
        <div className="stat-card" style={{'--card-color':'#fc8181'}}>
          <span className="stat-icon">❌</span>
          <div className="stat-label">Cancelamentos</div>
          <div className="stat-value" style={{color:'var(--danger)'}}>{s.total_cancelled||0}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h2>Faturamento Diário</h2></div>
          <div style={{padding:'20px'}}>
            {daily.length === 0
              ? <div className="empty"><div className="emoji">📊</div><p>Sem dados no período</p></div>
              : <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={daily.map(d=>({day:d.day.split('-')[2],revenue:parseFloat(d.revenue)}))}>
                    <XAxis dataKey="day" tick={{fill:'#6b6b80',fontSize:11}}/>
                    <YAxis tick={{fill:'#6b6b80',fontSize:11}}/>
                    <Tooltip contentStyle={{background:'#1c1c26',border:'1px solid #2a2a3a',borderRadius:8}}/>
                    <Bar dataKey="revenue" fill="#7c6af7" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
            }
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2>Por Serviço</h2></div>
          <div style={{padding:'20px'}}>
            {byService.length === 0
              ? <div className="empty"><div className="emoji">📋</div><p>Sem dados</p></div>
              : <>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie data={byService} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({name,percent})=>`${Math.round(percent*100)}%`}>
                        {byService.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                      </Pie>
                      <Tooltip contentStyle={{background:'#1c1c26',border:'1px solid #2a2a3a',borderRadius:8}}/>
                    </PieChart>
                  </ResponsiveContainer>
                  {byService.map((s, i) => (
                    <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:13,marginTop:8}}>
                      <span><span className="color-dot" style={{background:COLORS[i%COLORS.length]}}></span>{s.name}</span>
                      <strong style={{color:'var(--success)'}}>R${parseFloat(s.revenue).toFixed(2)}</strong>
                    </div>
                  ))}
                </>
            }
          </div>
        </div>
      </div>
    </>
  );
}
