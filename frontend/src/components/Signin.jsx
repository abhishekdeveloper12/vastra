import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Auth.css';
import { signInWithGoogle } from '../firebase';
import { API_BASE_URL } from '../api';

const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      const text = await response.text();
      console.log('LOGIN RESPONSE:', text);
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
      if (!response.ok || !data) throw new Error((data && data.message) || 'Login failed or invalid response');
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('role', data.role);
      localStorage.setItem('clothesellingUser', JSON.stringify({ displayName: email.split('@')[0] || 'User', email }));
      if (data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from);
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  const handleGoogleSignin = async () => {
    setError('');
    setLoading(true);
    try {
      // Sign in with Google (Firebase)
      const user = await signInWithGoogle();
      // Get Firebase ID token
      const idToken = await user.getIdToken();
      // Send ID token to backend to get app JWT
      const response = await fetch(`${API_BASE_URL}/api/users/google-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: user.displayName || '',
          email: user.email,
          googleId: user.uid,
          idToken,
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Google sign-in failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('role', data.role);
      localStorage.setItem('clothesellingUser', JSON.stringify({ displayName: user.displayName || user.email?.split('@')[0] || 'User', email: user.email }));
      const dest = from === '/signin' ? '/dashboard' : from;
      navigate(dest);
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
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ paddingRight: 40, width: '100%' }}
            />
            <button
              type="button"
              tabIndex={-1}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                padding: 0,
                fontSize: 15,
                cursor: 'pointer',
                border: 'none',
                background: 'none',
                color: '#007bff',
                height: 24,
                width: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
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