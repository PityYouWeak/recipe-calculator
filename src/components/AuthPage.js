import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginOrRegister } from '../utils/auth';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const type = isLogin ? 'login' : 'register';
    const result = await loginOrRegister({ email, password, name, type });
    if (result && result.user) {
      setTimeout(() => navigate('/app'), 150);
    } else {
      setError(result.message || 'Authentication failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 60 }}>
      <h2>{isLogin ? 'Login' : 'Register'} as Manager</h2>
  <form onSubmit={handleSubmit} style={{ minWidth: 540, minHeight: 420, background: '#fff', padding: 32, borderRadius: 12, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="form-input"
            style={{ width: '100%', marginBottom: 12 }}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="form-input"
          style={{ width: '100%', marginBottom: 12 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="form-input"
          style={{ width: '100%', marginBottom: 12 }}
        />
        {error && (
          <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
          <button
            type="submit"
            className="btn btn-success"
            style={{ fontSize: 14, padding: '6px 18px', borderRadius: 6 }}
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: 14, padding: '6px 18px', borderRadius: 6 }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Switch to Register' : 'Switch to Login'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthPage;
