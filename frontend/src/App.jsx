import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import AgendaPage from './pages/AgendaPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ClientsPage from './pages/ClientsPage';
import ServicesPage from './pages/ServicesPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import BookingPage from './pages/BookingPage';
import { BarbeariaNichePage, ClinicaNichePage, PsicologoNichePage, NutricionistaNichePage } from './pages/NichePages';
import BlogPage from './pages/BlogPage';
import AdminPage from './pages/AdminPage';
import QuotesPage from './pages/QuotesPage';
import PublicQuotePage from './pages/PublicQuotePage';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!user.onboarding_completed) return <Navigate to="/onboarding" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Páginas públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<LoginPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/agendar/:slug" element={<BookingPage />} />
          <Route path="/para/barbearia" element={<BarbeariaNichePage />} />
          <Route path="/para/clinica" element={<ClinicaNichePage />} />
          <Route path="/para/psicologo" element={<PsicologoNichePage />} />
          <Route path="/para/nutricionista" element={<NutricionistaNichePage />} />
          <Route path="/reset-password" element={<LoginPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/orcamento/:templateId" element={<PublicQuotePage />} />

          {/* Páginas privadas (requerem login + onboarding) */}
          <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="agenda" element={<AgendaPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="orcamentos" element={<QuotesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
