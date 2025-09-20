import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginOrRegister } from '../utils/auth';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const type = isLogin ? 'login' : 'register';
    const result = await loginOrRegister({ email, password, name, type });
    console.log(result);
    console.log(result.user+"tae");
    if (result && result.user) {
      console.log('User authenticated:', result.user);
      setTimeout(() => navigate('/app'), 150);
    } else {
      alert(result.message || 'Authentication failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 60 }}>
      <h2>{isLogin ? 'Login' : 'Register'} as Manager</h2>
      <form onSubmit={handleSubmit} style={{ minWidth: 320, background: '#fff', padding: 24, borderRadius: 8 }}>
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
        <button type="submit" className="btn btn-success" style={{ marginRight: 8 }}>{isLogin ? 'Login' : 'Register'}</button>
        <button type="button" className="btn btn-secondary" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Switch to Register' : 'Switch to Login'}
        </button>
      </form>
    </div>
  );
};

export default AuthPage;
