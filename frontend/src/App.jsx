import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import AgendaPage from './pages/AgendaPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ClientsPage from './pages/ClientsPage';
import ServicesPage from './pages/ServicesPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import { BarbeariaNichePage, ClinicaNichePage, PsicologoNichePage, NutricionistaNichePage } from './pages/NichePages';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Páginas públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<LoginPage />} />
          <Route path="/para/barbearia" element={<BarbeariaNichePage />} />
          <Route path="/para/clinica" element={<ClinicaNichePage />} />
          <Route path="/para/psicologo" element={<PsicologoNichePage />} />
          <Route path="/para/nutricionista" element={<NutricionistaNichePage />} />

          {/* Páginas privadas (requerem login) */}
          <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="agenda" element={<AgendaPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
