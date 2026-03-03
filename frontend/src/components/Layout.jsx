import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const NAV_ITEMS = [
  { to: '/app/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/app/agenda', icon: '📅', label: 'Agenda' },
  { to: '/app/appointments', icon: '📋', label: 'Agendamentos', badge: true },
  { to: '/app/clients', icon: '👥', label: 'Clientes' },
  { to: '/app/services', icon: '✂️', label: 'Serviços' },
  { to: '/app/reports', icon: '📊', label: 'Relatórios' },
  { to: '/app/settings', icon: '⚙️', label: 'Configurações' },
];

const SECTIONS = [
  { label: 'Menu', items: [0, 1, 2] },
  { label: 'Cadastros', items: [3, 4] },
  { label: 'Análises', items: [5, 6] },
];

// Bottom nav no mobile mostra só os 5 mais importantes
const MOBILE_NAV = [0, 1, 2, 3, 5];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [newCount, setNewCount] = useState(0);
  const [lastCheck, setLastCheck] = useState(
    () => localStorage.getItem('agendai_last_check') || new Date().toISOString()
  );

  // Detecta resize
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Fecha sidebar ao navegar no mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Polling badge
  const checkNew = useCallback(async () => {
    try {
      const { data } = await api.get('/appointments?status=confirmed');
      const count = data.filter(a => new Date(a.created_at) > new Date(lastCheck)).length;
      setNewCount(count);
    } catch {}
  }, [lastCheck]);

  useEffect(() => {
    checkNew();
    const interval = setInterval(checkNew, 30000);
    return () => clearInterval(interval);
  }, [checkNew]);

  useEffect(() => {
    if (location.pathname === '/app/appointments') {
      const now = new Date().toISOString();
      localStorage.setItem('agendai_last_check', now);
      setLastCheck(now);
      setNewCount(0);
    }
  }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: '24px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, background: 'linear-gradient(135deg, #7c6af7, #4fd1c5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AgendAI
          </div>
          <div style={{ fontSize: 11, color: '#6b6b80', marginTop: -2 }}>
            {user?.business_name || 'Sistema de Agendamento'}
          </div>
        </div>
        {isMobile && (
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#6b6b80', cursor: 'pointer', fontSize: 22, padding: 4 }}>✕</button>
        )}
      </div>

      {/* Nav */}
      <div style={{ flex: 1, padding: '4px 12px', overflowY: 'auto' }}>
        {SECTIONS.map(section => (
          <div key={section.label}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#6b6b80', padding: '14px 12px 6px' }}>
              {section.label}
            </div>
            {section.items.map(idx => {
              const item = NAV_ITEMS[idx];
              const badge = item.badge ? newCount : 0;
              return (
                <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  borderRadius: 10, cursor: 'pointer', fontSize: 14, marginBottom: 2,
                  textDecoration: 'none', transition: 'all .2s',
                  color: isActive ? '#e8e8f0' : '#6b6b80',
                  background: isActive ? 'linear-gradient(135deg, rgba(124,106,247,.2), rgba(79,209,197,.1))' : 'transparent',
                  border: isActive ? '1px solid rgba(124,106,247,.3)' : '1px solid transparent',
                })}>
                  <span style={{ width: 18, textAlign: 'center', fontSize: 16 }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {badge > 0 && (
                    <span style={{ background: '#f85149', color: '#fff', borderRadius: 10, fontSize: 10, fontWeight: 700, padding: '2px 7px' }}>
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* User footer */}
      <div style={{ margin: 12, padding: 14, background: '#1c1c26', borderRadius: 12, border: '1px solid #2a2a3a', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #7c6af7, #4fd1c5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: '#6b6b80', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.profession || user?.email}</div>
        </div>
        <button onClick={handleLogout} title="Sair" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: 0.5, padding: 4 }}>🚪</button>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f', color: '#e8e8f0', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── DESKTOP SIDEBAR ── */}
      {!isMobile && (
        <nav style={{ width: 240, background: '#13131a', borderRight: '1px solid #2a2a3a', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 100 }}>
          <SidebarContent />
        </nav>
      )}

      {/* ── MOBILE HEADER ── */}
      {isMobile && (
        <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: '#13131a', borderBottom: '1px solid #2a2a3a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 100 }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, background: 'linear-gradient(135deg, #7c6af7, #4fd1c5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AgendAI
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {newCount > 0 && (
              <span style={{ background: '#f85149', color: '#fff', borderRadius: 10, fontSize: 10, fontWeight: 700, padding: '2px 8px' }}>
                {newCount > 9 ? '9+' : newCount} novo{newCount > 1 ? 's' : ''}
              </span>
            )}
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ width: 22, height: 2, background: '#e8e8f0', borderRadius: 2 }} />
              <div style={{ width: 22, height: 2, background: '#e8e8f0', borderRadius: 2 }} />
              <div style={{ width: 16, height: 2, background: '#e8e8f0', borderRadius: 2 }} />
            </button>
          </div>
        </header>
      )}

      {/* ── MOBILE DRAWER ── */}
      {isMobile && (
        <>
          {/* Overlay */}
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 150, opacity: sidebarOpen ? 1 : 0, pointerEvents: sidebarOpen ? 'all' : 'none', transition: 'opacity .25s', backdropFilter: 'blur(4px)' }} />
          {/* Drawer */}
          <nav style={{ position: 'fixed', top: 0, left: 0, width: 280, height: '100vh', background: '#13131a', borderRight: '1px solid #2a2a3a', display: 'flex', flexDirection: 'column', zIndex: 200, transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform .28s cubic-bezier(.16,1,.3,1)' }}>
            <SidebarContent />
          </nav>
        </>
      )}

      {/* ── MAIN CONTENT ── */}
      <main style={{ marginLeft: isMobile ? 0 : 240, flex: 1, paddingTop: isMobile ? 56 : 0, paddingBottom: isMobile ? 72 : 0 }}>
        <div style={{ padding: isMobile ? '20px 16px' : '32px' }}>
          <Outlet />
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      {isMobile && (
        <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 64, background: '#13131a', borderTop: '1px solid #2a2a3a', display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {MOBILE_NAV.map(idx => {
            const item = NAV_ITEMS[idx];
            const badge = item.badge ? newCount : 0;
            const isActive = location.pathname === item.to;
            return (
              <NavLink key={item.to} to={item.to} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 12px', textDecoration: 'none', position: 'relative', flex: 1 }}>
                <div style={{ position: 'relative' }}>
                  <span style={{ fontSize: 22, filter: isActive ? 'none' : 'grayscale(60%)', opacity: isActive ? 1 : 0.5, transition: 'all .2s' }}>
                    {item.icon}
                  </span>
                  {badge > 0 && (
                    <span style={{ position: 'absolute', top: -4, right: -6, background: '#f85149', color: '#fff', borderRadius: 8, fontSize: 9, fontWeight: 700, padding: '1px 5px', minWidth: 14, textAlign: 'center' }}>
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 9, color: isActive ? '#a89cf7' : '#444460', fontWeight: isActive ? 600 : 400, transition: 'color .2s' }}>
                  {item.label.split(' ')[0]}
                </span>
                {isActive && (
                  <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 28, height: 2, background: 'linear-gradient(90deg, #7c6af7, #4fd1c5)', borderRadius: 2 }} />
                )}
              </NavLink>
            );
          })}
          {/* Botão "Mais" para itens ocultos */}
          <button onClick={() => setSidebarOpen(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 12px', background: 'none', border: 'none', cursor: 'pointer', flex: 1 }}>
            <span style={{ fontSize: 22, opacity: 0.5 }}>☰</span>
            <span style={{ fontSize: 9, color: '#444460' }}>Mais</span>
          </button>
        </nav>
      )}
    </div>
  );
}
