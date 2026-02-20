import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const navItems = [
    { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/agenda', icon: '📅', label: 'Agenda' },
    { to: '/appointments', icon: '📋', label: 'Agendamentos' },
  ];

  const navItems2 = [
    { to: '/clients', icon: '👥', label: 'Clientes' },
    { to: '/services', icon: '✂️', label: 'Serviços' },
  ];

  const navItems3 = [
    { to: '/reports', icon: '📊', label: 'Relatórios' },
    { to: '/settings', icon: '⚙️', label: 'Configurações' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f', color: '#e8e8f0', fontFamily: "'DM Sans', sans-serif" }}>

      {/* SIDEBAR */}
      <nav style={{ width: 240, background: '#13131a', borderRight: '1px solid #2a2a3a', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 100 }}>
        <div style={{ padding: '28px 24px 20px', fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg, #7c6af7, #4fd1c5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          AgendAI
          <div style={{ fontSize: 11, fontWeight: 400, color: '#6b6b80', WebkitTextFillColor: '#6b6b80', fontFamily: 'DM Sans, sans-serif', marginTop: -4 }}>
            {user?.business_name || 'Sistema de Agendamento'}
          </div>
        </div>

        <div style={{ flex: 1, padding: '8px 12px', overflowY: 'auto' }}>
          <div style={sectionStyle}>Menu</div>
          {navItems.map(item => <NavItem key={item.to} {...item} />)}

          <div style={sectionStyle}>Cadastros</div>
          {navItems2.map(item => <NavItem key={item.to} {...item} />)}

          <div style={sectionStyle}>Análises</div>
          {navItems3.map(item => <NavItem key={item.to} {...item} />)}
        </div>

        <div style={{ margin: 12, padding: 14, background: '#1c1c26', borderRadius: 12, border: '1px solid #2a2a3a', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #7c6af7, #4fd1c5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0, color: '#fff' }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: '#6b6b80', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.profession || user?.email}</div>
          </div>
          <button onClick={handleLogout} title="Sair" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: 0.5, padding: 4 }}>🚪</button>
        </div>
      </nav>

      {/* MAIN */}
      <main style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '32px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const sectionStyle = {
  fontSize: 10, textTransform: 'uppercase', letterSpacing: 1,
  color: '#6b6b80', padding: '16px 12px 6px'
};

function NavItem({ to, icon, label }) {
  return (
    <NavLink to={to} style={({ isActive }) => ({
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
      borderRadius: 10, cursor: 'pointer', fontSize: 14, marginBottom: 2,
      textDecoration: 'none', transition: 'all .2s',
      color: isActive ? '#e8e8f0' : '#6b6b80',
      background: isActive ? 'linear-gradient(135deg, rgba(124,106,247,.2), rgba(79,209,197,.1))' : 'transparent',
      border: isActive ? '1px solid rgba(124,106,247,.3)' : '1px solid transparent',
    })}>
      <span style={{ width: 18, textAlign: 'center', fontSize: 16 }}>{icon}</span>
      {label}
    </NavLink>
  );
}
