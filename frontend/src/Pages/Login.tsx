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
      // Limpa dados antigos e salva dados do usuário logado
      localStorage.removeItem('userData');
      let userData = data.user;
      // Se não veio user no payload, decodifica do JWT
      if (!userData && data.token) {
        try {
          // Decodifica JWT payload para UTF-8
          const base64 = data.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join('')
          );
          const payload = JSON.parse(jsonPayload);
          // Busca o nome em todos os campos comuns
          const name = payload.name
            || payload.unique_name
            || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]
            || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/name"];
          userData = {
            id: payload.sub || payload.id,
            name,
            email: payload.email || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/emailaddress"],
          };
        } catch {}
      }
      if (userData) {
        localStorage.setItem('userData', JSON.stringify(userData));
      }
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
