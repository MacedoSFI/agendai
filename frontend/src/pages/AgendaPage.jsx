import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const HOURS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'];
const DAYS_PT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

function getWeekDates(baseDate) {
  const d = new Date(baseDate);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const weekDates = getWeekDates(currentDate);

  useEffect(() => {
    const start = weekDates[0].toISOString();
    const end = weekDates[6].toISOString();
    api.get(`/appointments?start=${start}&end=${end}`)
      .then(r => setAppointments(r.data))
      .catch(console.error);
  }, [currentDate]);

  const prevWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); };
  const nextWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); };
  const today = () => setCurrentDate(new Date());

  const getApptForCell = (date, hour) => {
    return appointments.filter(a => {
      const start = new Date(a.start_time);
      return (
        start.toDateString() === date.toDateString() &&
        start.getHours() === parseInt(hour.split(':')[0])
      );
    });
  };

  const isToday = (date) => date.toDateString() === new Date().toDateString();

  const monthYear = weekDates[0].toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const rangeLabel = `${weekDates[0].getDate()} – ${weekDates[6].getDate()} de ${monthYear}`;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700 }}>Agenda Semanal</h1>
      </div>

      <div style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 16, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #2a2a3a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={prevWeek} style={btnOutline}>←</button>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15 }}>{rangeLabel}</span>
            <button onClick={nextWeek} style={btnOutline}>→</button>
          </div>
          <button onClick={today} style={btnOutline}>Hoje</button>
        </div>

        {/* Calendar grid */}
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', minWidth: 700 }}>
            {/* Day headers */}
            <div style={cellHeader}></div>
            {weekDates.map((date, i) => (
              <div key={i} style={{ ...cellHeader, color: isToday(date) ? '#7c6af7' : '#6b6b80', background: isToday(date) ? 'rgba(124,106,247,.08)' : '#1c1c26' }}>
                <div>{DAYS_PT[date.getDay()]}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: isToday(date) ? '#7c6af7' : '#e8e8f0', marginTop: 2 }}>{date.getDate()}</div>
              </div>
            ))}

            {/* Time rows */}
            {HOURS.map(hour => (
              <React.Fragment key={hour}>
                <div style={timeLabel}>{hour}</div>
                {weekDates.map((date, di) => {
                  const appts = getApptForCell(date, hour);
                  return (
                    <div key={di} style={{ ...calCell, background: isToday(date) ? 'rgba(124,106,247,.03)' : '#13131a' }}>
                      {appts.map(a => (
                        <div key={a.id} style={{
                          background: a.service_color || '#7c6af7',
                          borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 500,
                          color: '#fff', marginBottom: 2, cursor: 'pointer', opacity: a.status === 'cancelled' ? 0.4 : 1
                        }}>
                          {a.client_name} · {a.service_name}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

const btnOutline = { padding: '6px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', border: '1px solid #2a2a3a', background: 'transparent', color: '#e8e8f0', fontFamily: 'DM Sans, sans-serif' };
const cellHeader = { padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, borderBottom: '1px solid #2a2a3a' };
const timeLabel = { padding: '8px', textAlign: 'right', fontSize: 11, color: '#6b6b80', borderBottom: '1px solid rgba(42,42,58,.4)', borderRight: '1px solid #2a2a3a' };
const calCell = { minHeight: 52, padding: 4, borderBottom: '1px solid rgba(42,42,58,.4)', borderRight: '1px solid rgba(42,42,58,.3)' };
