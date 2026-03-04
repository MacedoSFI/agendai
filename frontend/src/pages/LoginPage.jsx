import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

export default function LoginPage() {
  const [tab, setTab]         = useState('login');
  const [screen, setScreen]   = useState('main');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const { login, register }   = useAuth();
  const navigate              = useNavigate();
  const [searchParams]        = useSearchParams();

  const [loginForm, setLoginForm]       = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', phone: '', profession: '', business_name: '' });
  const [resetForm, setResetForm]       = useState({ password: '', confirm: '' });

  const resetToken   = searchParams.get('token');
  const activeScreen = resetToken ? 'reset' : screen;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(loginForm.email, loginForm.password);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await register(registerForm);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao cadastrar');
    } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (resetForm.password !== resetForm.confirm) return setError('As senhas não coincidem.');
    setLoading(true); setError(''); setSuccess('');
    try {
      await api.post('/auth/reset-password', { token: resetToken, password: resetForm.password });
      setSuccess('Senha redefinida com sucesso!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Link inválido ou expirado.');
    } finally { setLoading(false); }
  };

  const professions = ['Barbearia','Clínica de Estética','Personal Trainer','Psicólogo','Manicure / Pedicure','Médico','Dentista','Nutricionista','Outros'];

  return (
    <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", padding: '24px 16px', position: 'relative', overflow: 'hidden' }}>

      {/* Glow de fundo */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(124,106,247,.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(79,209,197,.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Logo */}
      <Link to="/" style={{ marginBottom: 32, textDecoration: 'none' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg, #7c6af7, #4fd1c5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          AgendAI
        </div>
      </Link>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 440, background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 20, overflow: 'hidden', position: 'relative', zIndex: 1 }}>

        {/* TELA PRINCIPAL */}
        {activeScreen === 'main' && (
          <>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #2a2a3a' }}>
              {['login', 'register'].map(t => (
                <button key={t} onClick={() => { setTab(t); setError(''); }}
                  style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', color: tab === t ? '#e8e8f0' : '#6b6b80', borderBottom: tab === t ? '2px solid #7c6af7' : '2px solid transparent', transition: 'all .2s', marginBottom: -1 }}>
                  {t === 'login' ? 'Entrar' : 'Criar conta'}
                </button>
              ))}
            </div>

            <div style={{ padding: '28px 28px 24px' }}>
              {tab === 'login' ? (
                <>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 6, color: '#e8e8f0' }}>Bem-vindo de volta</h2>
                  <p style={{ fontSize: 13, color: '#6b6b80', marginBottom: 24 }}>Entre na sua conta para gerenciar sua agenda</p>
                </>
              ) : (
                <>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 6, color: '#e8e8f0' }}>Crie sua conta grátis</h2>
                  <p style={{ fontSize: 13, color: '#6b6b80', marginBottom: 24 }}>30 dias de acesso completo, sem cartão de crédito</p>
                </>
              )}

              {error && (
                <div style={{ background: 'rgba(252,129,129,.08)', border: '1px solid rgba(252,129,129,.25)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#fc8181', marginBottom: 18 }}>
                  {error}
                </div>
              )}

              {tab === 'login' ? (
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={labelSt}>Email</label>
                    <input style={inputSt} type="email" required placeholder="seu@email.com"
                      value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelSt}>Senha</label>
                    <input style={inputSt} type="password" required placeholder="••••••••"
                      value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
                  </div>
                  <button type="submit" disabled={loading} style={{ ...btnPrimary, marginTop: 4 }}>
                    {loading ? 'Entrando...' : 'Entrar →'}
                  </button>
                  <div style={{ textAlign: 'center' }}>
                    <button type="button" onClick={() => { setScreen('forgot'); setError(''); }}
                      style={{ background: 'none', border: 'none', color: '#7c6af7', fontSize: 13, cursor: 'pointer' }}>
                      Esqueci minha senha
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={labelSt}>Nome completo *</label>
                    <input style={inputSt} required placeholder="Seu nome"
                      value={registerForm.name} onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelSt}>Nome do negócio</label>
                    <input style={inputSt} placeholder="Barbearia Silva, Clínica X..."
                      value={registerForm.business_name} onChange={e => setRegisterForm({ ...registerForm, business_name: e.target.value })} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelSt}>Email *</label>
                      <input style={inputSt} type="email" required
                        value={registerForm.email} onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelSt}>Telefone</label>
                      <input style={inputSt} placeholder="(11) 99999-9999"
                        value={registerForm.phone} onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label style={labelSt}>Profissão</label>
                    <select style={inputSt} value={registerForm.profession} onChange={e => setRegisterForm({ ...registerForm, profession: e.target.value })}>
                      <option value="">Selecione...</option>
                      {professions.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelSt}>Senha *</label>
                    <input style={inputSt} type="password" required placeholder="Mínimo 8 caracteres"
                      value={registerForm.password} onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })} />
                  </div>
                  <button type="submit" disabled={loading} style={{ ...btnPrimary, marginTop: 4 }}>
                    {loading ? 'Criando conta...' : 'Criar conta grátis →'}
                  </button>
                </form>
              )}
            </div>
          </>
        )}

        {/* TELA ESQUECI A SENHA */}
        {activeScreen === 'forgot' && (
          <div style={{ padding: '32px 28px' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: '#e8e8f0', marginBottom: 8 }}>Esqueceu sua senha?</h2>
              <p style={{ fontSize: 13, color: '#6b6b80', lineHeight: 1.6 }}>Entre em contato com o suporte para redefinir sua senha:</p>
            </div>
            <a href="mailto:felipe.tech.brasil@gmail.com"
              style={{ display: 'block', textAlign: 'center', padding: '13px', background: 'linear-gradient(135deg, #7c6af7, #4fd1c5)', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: 14, marginBottom: 12 }}>
              felipe.tech.brasil@gmail.com
            </a>
            <p style={{ fontSize: 12, color: '#444460', textAlign: 'center', marginBottom: 20 }}>Respondemos em até 24 horas.</p>
            <div style={{ textAlign: 'center' }}>
              <button type="button" onClick={() => { setScreen('main'); setError(''); }}
                style={{ background: 'none', border: 'none', color: '#6b6b80', fontSize: 13, cursor: 'pointer' }}>
                ← Voltar para o login
              </button>
            </div>
          </div>
        )}

        {/* TELA NOVA SENHA */}
        {activeScreen === 'reset' && (
          <div style={{ padding: '32px 28px' }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: '#e8e8f0', marginBottom: 6 }}>Criar nova senha</h2>
            <p style={{ fontSize: 13, color: '#6b6b80', marginBottom: 24 }}>Digite sua nova senha abaixo.</p>

            {error   && <div style={{ background: 'rgba(252,129,129,.08)', border: '1px solid rgba(252,129,129,.25)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#fc8181', marginBottom: 18 }}>{error}</div>}
            {success && <div style={{ background: 'rgba(104,211,145,.08)', border: '1px solid rgba(104,211,145,.25)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#68d391', marginBottom: 18 }}>{success} Redirecionando...</div>}

            {!success && (
              <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelSt}>Nova senha</label>
                  <input style={inputSt} type="password" required minLength={8} placeholder="Mínimo 8 caracteres"
                    value={resetForm.password} onChange={e => setResetForm({ ...resetForm, password: e.target.value })} />
                </div>
                <div>
                  <label style={labelSt}>Confirmar nova senha</label>
                  <input style={inputSt} type="password" required placeholder="Repita a senha"
                    value={resetForm.confirm} onChange={e => setResetForm({ ...resetForm, confirm: e.target.value })} />
                </div>
                <button type="submit" disabled={loading} style={{ ...btnPrimary, marginTop: 4 }}>
                  {loading ? 'Salvando...' : 'Salvar nova senha →'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Rodapé */}
      <p style={{ marginTop: 24, fontSize: 12, color: '#333350' }}>© 2026 AgendAI · Todos os direitos reservados</p>
    </div>
  );
}

const labelSt  = { display: 'block', fontSize: 11, color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6, fontWeight: 600 };
const inputSt  = { width: '100%', padding: '10px 14px', background: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: 8, color: '#e8e8f0', fontSize: 14, fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s' };
const btnPrimary = { padding: '12px', background: 'linear-gradient(135deg, #7c6af7, #4fd1c5)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', width: '100%' };
