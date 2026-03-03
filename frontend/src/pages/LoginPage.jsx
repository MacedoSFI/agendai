import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

export default function LoginPage() {
  const [tab, setTab]         = useState('login');
  const [screen, setScreen]   = useState('main'); // 'main' | 'forgot' | 'reset'
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const { login, register }   = useAuth();
  const navigate              = useNavigate();
  const [searchParams]        = useSearchParams();

  const [loginForm, setLoginForm]       = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', phone: '', profession: '', business_name: '' });
  const [forgotEmail, setForgotEmail]   = useState('');
  const [resetForm, setResetForm]       = useState({ password: '', confirm: '' });

  // Se veio com ?token=xxx na URL, vai direto para tela de redefinir
  const resetToken = searchParams.get('token');
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

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      setSuccess('Se este email estiver cadastrado, você receberá as instruções em breve.');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao enviar. Tente novamente.');
    } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (resetForm.password !== resetForm.confirm) {
      return setError('As senhas não coincidem.');
    }
    setLoading(true); setError(''); setSuccess('');
    try {
      await api.post('/auth/reset-password', { token: resetToken, password: resetForm.password });
      setSuccess('Senha redefinida com sucesso!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Link inválido ou expirado.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">AgendAI</div>
        <p className="auth-tagline">Sua agenda profissional em um só lugar</p>
        <div className="auth-box">

          {/* ── TELA PRINCIPAL ── */}
          {activeScreen === 'main' && (
            <>
              <div className="auth-tabs">
                <button className={`auth-tab ${tab==='login'?'active':''}`} onClick={()=>{ setTab('login'); setError(''); }}>Entrar</button>
                <button className={`auth-tab ${tab==='register'?'active':''}`} onClick={()=>{ setTab('register'); setError(''); }}>Cadastrar</button>
              </div>

              {error && <div style={errorBox}>{error}</div>}

              {tab === 'login' ? (
                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label>Email</label>
                    <input className="form-control" type="email" required
                      value={loginForm.email} onChange={e=>setLoginForm({...loginForm,email:e.target.value})}
                      placeholder="seu@email.com"/>
                  </div>
                  <div className="form-group">
                    <label>Senha</label>
                    <input className="form-control" type="password" required
                      value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})}
                      placeholder="••••••••"/>
                  </div>
                  <button className="btn btn-primary" style={{width:'100%',marginTop:8}} disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                  </button>
                  <div style={{textAlign:'center',marginTop:14}}>
                    <button type="button" onClick={()=>{ setScreen('forgot'); setError(''); setSuccess(''); }}
                      style={{background:'none',border:'none',color:'#7c6af7',fontSize:13,cursor:'pointer',textDecoration:'underline'}}>
                      Esqueci minha senha
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegister}>
                  <div className="form-group"><label>Nome</label>
                    <input className="form-control" required value={registerForm.name}
                      onChange={e=>setRegisterForm({...registerForm,name:e.target.value})} placeholder="Seu nome completo"/>
                  </div>
                  <div className="form-group"><label>Nome do Negócio</label>
                    <input className="form-control" value={registerForm.business_name}
                      onChange={e=>setRegisterForm({...registerForm,business_name:e.target.value})} placeholder="Barbearia Silva, Clínica X..."/>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label>Email</label>
                      <input className="form-control" type="email" required value={registerForm.email}
                        onChange={e=>setRegisterForm({...registerForm,email:e.target.value})}/>
                    </div>
                    <div className="form-group"><label>Telefone</label>
                      <input className="form-control" value={registerForm.phone}
                        onChange={e=>setRegisterForm({...registerForm,phone:e.target.value})} placeholder="(11) 99999-9999"/>
                    </div>
                  </div>
                  <div className="form-group"><label>Profissão</label>
                    <select className="form-control" value={registerForm.profession}
                      onChange={e=>setRegisterForm({...registerForm,profession:e.target.value})}>
                      <option value="">Selecione...</option>
                      <option>Barbearia</option><option>Clínica de Estética</option>
                      <option>Personal Trainer</option><option>Psicólogo</option>
                      <option>Manicure / Pedicure</option><option>Médico</option><option>Outros</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Senha</label>
                    <input className="form-control" type="password" required value={registerForm.password}
                      onChange={e=>setRegisterForm({...registerForm,password:e.target.value})} placeholder="Mínimo 8 caracteres"/>
                  </div>
                  <button className="btn btn-primary" style={{width:'100%',marginTop:8}} disabled={loading}>
                    {loading ? 'Criando conta...' : 'Criar Conta Grátis'}
                  </button>
                </form>
              )}
            </>
          )}

          {/* ── TELA ESQUECI A SENHA ── */}
          {activeScreen === 'forgot' && (
            <>
              <h3 style={{fontFamily:'Syne,sans-serif',fontSize:17,fontWeight:700,marginBottom:6}}>Esqueci minha senha</h3>
              <p style={{fontSize:13,color:'#6b6b80',marginBottom:20}}>Digite seu email cadastrado e enviaremos um link para redefinir sua senha.</p>

              {error   && <div style={errorBox}>{error}</div>}
              {success && <div style={successBox}>{success}</div>}

              {!success && (
                <form onSubmit={handleForgot}>
                  <div className="form-group">
                    <label>Email cadastrado</label>
                    <input className="form-control" type="email" required
                      value={forgotEmail} onChange={e=>setForgotEmail(e.target.value)}
                      placeholder="seu@email.com"/>
                  </div>
                  <button className="btn btn-primary" style={{width:'100%',marginTop:8}} disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar link de redefinição'}
                  </button>
                </form>
              )}

              <div style={{textAlign:'center',marginTop:16}}>
                <button type="button" onClick={()=>{ setScreen('main'); setError(''); setSuccess(''); }}
                  style={{background:'none',border:'none',color:'#6b6b80',fontSize:13,cursor:'pointer'}}>
                  ← Voltar para o login
                </button>
              </div>
            </>
          )}

          {/* ── TELA NOVA SENHA ── */}
          {activeScreen === 'reset' && (
            <>
              <h3 style={{fontFamily:'Syne,sans-serif',fontSize:17,fontWeight:700,marginBottom:6}}>Criar nova senha</h3>
              <p style={{fontSize:13,color:'#6b6b80',marginBottom:20}}>Digite sua nova senha abaixo.</p>

              {error   && <div style={errorBox}>{error}</div>}
              {success && <div style={successBox}>{success} Redirecionando...</div>}

              {!success && (
                <form onSubmit={handleReset}>
                  <div className="form-group">
                    <label>Nova senha</label>
                    <input className="form-control" type="password" required minLength={8}
                      value={resetForm.password} onChange={e=>setResetForm({...resetForm,password:e.target.value})}
                      placeholder="Mínimo 8 caracteres"/>
                  </div>
                  <div className="form-group">
                    <label>Confirmar nova senha</label>
                    <input className="form-control" type="password" required
                      value={resetForm.confirm} onChange={e=>setResetForm({...resetForm,confirm:e.target.value})}
                      placeholder="Repita a senha"/>
                  </div>
                  <button className="btn btn-primary" style={{width:'100%',marginTop:8}} disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar nova senha'}
                  </button>
                </form>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}

const errorBox   = { background:'rgba(252,129,129,.1)', border:'1px solid rgba(252,129,129,.3)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#fc8181', marginBottom:16 };
const successBox = { background:'rgba(104,211,145,.1)', border:'1px solid rgba(104,211,145,.3)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#68d391', marginBottom:16 };