import React, { useState, useEffect } from 'react';
import LoginForm from '../Components/Forms/LoginForm';
import { login } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/home');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login({ email, password });
      localStorage.setItem('token', data.token);
      navigate('/home');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-title">Entrar no Sistema</div>
        {error && <div className="login-error">{error}</div>}
        <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
          <input
            type="email"
            className="form-control"
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="form-control"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary w-100 mt-2">Entrar</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
