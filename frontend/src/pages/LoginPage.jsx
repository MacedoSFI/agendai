import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '', email: '', password: '', phone: '', profession: '', business_name: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(loginForm.email, loginForm.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await register(registerForm);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao cadastrar');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">AgendAI</div>
        <p className="auth-tagline">Sua agenda profissional em um só lugar</p>
        <div className="auth-box">
          <div className="auth-tabs">
            <button className={`auth-tab ${tab==='login'?'active':''}`} onClick={()=>setTab('login')}>Entrar</button>
            <button className={`auth-tab ${tab==='register'?'active':''}`} onClick={()=>setTab('register')}>Cadastrar</button>
          </div>

          {error && <div style={{background:'rgba(252,129,129,.1)',border:'1px solid rgba(252,129,129,.3)',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#fc8181',marginBottom:16}}>{error}</div>}

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
        </div>
      </div>
    </div>
  );
}
