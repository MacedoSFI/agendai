import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { usePushNotifications } from '../hooks/usePushNotifications';

const NAV_ITEMS = [
  { to: '/app/dashboard',    icon: '🏠', label: 'Dashboard' },
  { to: '/app/agenda',       icon: '📅', label: 'Agenda' },
  { to: '/app/appointments', icon: '📋', label: 'Agendamentos', badge: true },
  { to: '/app/clients',      icon: '👥', label: 'Clientes' },
  { to: '/app/services',     icon: '✂️', label: 'Serviços' },
  { to: '/app/reports',      icon: '📊', label: 'Relatórios' },
  { to: '/app/settings',     icon: '⚙️', label: 'Configurações' },
  { to: '/app/orcamentos',   icon: '📄', label: 'Orçamentos', pro: true },
];

const SECTIONS = [
  { label: 'Menu',      items: [0, 1, 2] },
  { label: 'Cadastros', items: [3, 4] },
  { label: 'Análises',  items: [5, 6, 7] },
];

const MOBILE_NAV_IDXS = [0, 1, 2, 3, 5];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  usePushNotifications();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile]       = useState(window.innerWidth < 768);
  const [newCount, setNewCount]       = useState(0);
  const [lastCheck, setLastCheck]     = useState(
    () => localStorage.getItem('agendai_last_check') || new Date().toISOString()
  );

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const checkNew = useCallback(async () => {
    try {
      const { data } = await api.get('/appointments?status=confirmed');
      const count = data.filter(a => new Date(a.created_at) > new Date(lastCheck)).length;
      setNewCount(count);
    } catch {}
  }, [lastCheck]);

  useEffect(() => {
    checkNew();
    const id = setInterval(checkNew, 30000);
    return () => clearInterval(id);
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

  const NavItemEl = ({ item }) => {
    const badge = item.badge ? newCount : 0;
    return (
      <NavLink to={item.to} style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px', borderRadius: 10, marginBottom: 2,
        textDecoration: 'none', transition: 'all .2s', fontSize: 14,
        color:      isActive ? '#e8e8f0' : '#6b6b80',
        background: isActive ? 'linear-gradient(135deg,rgba(124,106,247,.2),rgba(79,209,197,.1))' : 'transparent',
        border:     isActive ? '1px solid rgba(124,106,247,.3)' : '1px solid transparent',
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
  };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 800, background: 'linear-gradient(135deg,#7c6af7,#4fd1c5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AgendAI
          </div>
          <div style={{ fontSize: 11, color: '#6b6b80', marginTop: -2 }}>
            {user?.business_name || 'Sistema de Agendamento'}
          </div>
        </div>
        {isMobile && (
          <button onClick={() => setSidebarOpen(false)}
            style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#8b8ba0', cursor: 'pointer', fontSize: 16, padding: '6px 10px', borderRadius: 8 }}>
            ✕
          </button>
        )}
      </div>

      <div style={{ flex: 1, padding: '4px 12px', overflowY: 'auto' }}>
        {SECTIONS.map(s => (
          <div key={s.label}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#6b6b80', padding: '14px 12px 6px' }}>{s.label}</div>
            {s.items.map(idx => {
              const item = NAV_ITEMS[idx];
              if (item.pro && user?.plan !== 'pro') return null;
              return <NavItemEl key={item.to} item={item} />;
            })}
          </div>
        ))}
      </div>

      <div style={{ margin: 12, padding: 14, background: '#1c1c26', borderRadius: 12, border: '1px solid #2a2a3a', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#7c6af7,#4fd1c5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: '#6b6b80', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.profession || user?.email}</div>
        </div>
        <button onClick={handleLogout} title="Sair" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: .5, padding: 4 }}>🚪</button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f', color: '#e8e8f0', fontFamily: "'DM Sans',sans-serif" }}>

      {/* DESKTOP sidebar */}
      {!isMobile && (
        <nav style={{ width: 240, background: '#13131a', borderRight: '1px solid #2a2a3a', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100 }}>
          <SidebarContent />
        </nav>
      )}

      {/* MOBILE header — sempre fixo, zIndex 500 */}
      {isMobile && (
        <header style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          height: 56,
          background: '#13131a',
          borderBottom: '1px solid #2a2a3a',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px',
          zIndex: 500,
          willChange: 'transform',
          WebkitTransform: 'translateZ(0)',
          transform: 'translateZ(0)',
        }}>
          <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 800, background: 'linear-gradient(135deg,#7c6af7,#4fd1c5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AgendAI
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {newCount > 0 && (
              <span style={{ background: '#f85149', color: '#fff', borderRadius: 10, fontSize: 10, fontWeight: 700, padding: '3px 8px' }}>
                {newCount > 9 ? '9+' : newCount} novo{newCount > 1 ? 's' : ''}
              </span>
            )}
            <button
              onClick={() => setSidebarOpen(v => !v)}
              aria-label="Menu"
              style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, cursor: 'pointer', width: 38, height: 38, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <span style={{ display: 'block', width: 18, height: 2, background: '#e8e8f0', borderRadius: 2, transition: 'transform .25s,opacity .25s', transform: sidebarOpen ? 'rotate(45deg) translate(3px,3px)' : 'none' }} />
              <span style={{ display: 'block', width: 18, height: 2, background: '#e8e8f0', borderRadius: 2, transition: 'opacity .25s', opacity: sidebarOpen ? 0 : 1 }} />
              <span style={{ display: 'block', width: 18, height: 2, background: '#e8e8f0', borderRadius: 2, transition: 'transform .25s,opacity .25s', transform: sidebarOpen ? 'rotate(-45deg) translate(3px,-3px)' : 'none' }} />
            </button>
          </div>
        </header>
      )}

      {/* MOBILE overlay */}
      {isMobile && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,.65)',
          zIndex: 300,
          opacity: sidebarOpen ? 1 : 0,
          pointerEvents: sidebarOpen ? 'all' : 'none',
          transition: 'opacity .25s',
        }} />
      )}

      {/* MOBILE drawer */}
      {isMobile && (
        <nav style={{
          position: 'fixed', top: 0, left: 0,
          width: 280, height: '100vh',
          background: '#13131a',
          borderRight: '1px solid #2a2a3a',
          zIndex: 400,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform .28s cubic-bezier(.16,1,.3,1)',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ height: 56, flexShrink: 0 }} />
          <SidebarContent />
        </nav>
      )}

      {/* MAIN */}
      <main style={{
        marginLeft: isMobile ? 0 : 240,
        flex: 1, minWidth: 0,
        paddingTop:    isMobile ? 56 : 0,
        paddingBottom: isMobile ? 72 : 0,
      }}>
        <div style={{ padding: isMobile ? '20px 16px' : '32px' }}>
          <Outlet />
        </div>
      </main>

      {/* MOBILE bottom nav — sempre fixo, zIndex 500 */}
      {isMobile && (
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          height: 64,
          background: '#13131a',
          borderTop: '1px solid #2a2a3a',
          display: 'flex', alignItems: 'center',
          zIndex: 500,
          paddingBottom: 'env(safe-area-inset-bottom)',
          willChange: 'transform',
          WebkitTransform: 'translateZ(0)',
          transform: 'translateZ(0)',
        }}>
          {MOBILE_NAV_IDXS.map(idx => {
            const item     = NAV_ITEMS[idx];
            const badge    = item.badge ? newCount : 0;
            const isActive = location.pathname === item.to;
            return (
              <NavLink key={item.to} to={item.to} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 4px', textDecoration: 'none', position: 'relative' }}>
                {isActive && (
                  <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 24, height: 2, background: 'linear-gradient(90deg,#7c6af7,#4fd1c5)', borderRadius: 2 }} />
                )}
                <div style={{ position: 'relative' }}>
                  <span style={{ fontSize: 20, filter: isActive ? 'none' : 'grayscale(50%)', opacity: isActive ? 1 : .45, transition: 'all .2s' }}>
                    {item.icon}
                  </span>
                  {badge > 0 && (
                    <span style={{ position: 'absolute', top: -4, right: -6, background: '#f85149', color: '#fff', borderRadius: 8, fontSize: 9, fontWeight: 700, padding: '1px 4px' }}>
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 9, color: isActive ? '#a89cf7' : '#444460', fontWeight: isActive ? 600 : 400 }}>
                  {item.label.split(' ')[0]}
                </span>
              </NavLink>
            );
          })}
          <button onClick={() => setSidebarOpen(v => !v)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 4px', background: 'none', border: 'none', cursor: 'pointer' }}>
            <span style={{ fontSize: 20, opacity: .45 }}>☰</span>
            <span style={{ fontSize: 9, color: '#444460' }}>Mais</span>
          </button>
        </nav>
      )}
    </div>
  );
}
