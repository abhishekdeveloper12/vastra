import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Auth.css';
import { signInWithGoogle } from '../firebase';
import { API_BASE_URL } from '../api';

const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('role', data.role);
      localStorage.setItem('clothesellingUser', JSON.stringify({ displayName: email.split('@')[0] || 'User', email }));
      navigate(from);
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  const handleGoogleSignin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate(from);
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-page">
      <h1>Sign In</h1>
      <p>Please sign in to your account.</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="auth-error">{error}</div>}
        {from === '/dashboard' && (
          <div className="auth-info">You will be redirected to your dashboard after signing in.</div>
        )}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button type="button" className="google-button" onClick={handleGoogleSignin} disabled={loading}>
          {loading ? 'Signing in with Google…' : 'Sign in with Google'}
        </button>

        <button type="submit">Sign In</button>
      </form>
      <div className="auth-switch">
        New user?{' '}
        <button type="button" className="link-button" onClick={() => navigate('/signup')}>
          Sign up now
        </button>
      </div>
    </div>
  );
};

export default Signin;