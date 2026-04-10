import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../firebase';
import { API_BASE_URL } from '../api';
import './Auth.css';

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [role, setRole] = useState('buyer');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleProfile, setGoogleProfile] = useState(null);
  const [googleContact, setGoogleContact] = useState('');
  const [googleRole, setGoogleRole] = useState('buyer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, email, contact, role, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Signup failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('role', data.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      setGoogleProfile(user);
      setGoogleContact(user.phoneNumber || '');
      setGoogleRole('buyer');
    } catch (error) {
      console.error('Google signup failed', error);
      setError(`Google signup failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleComplete = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/google-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: googleProfile.displayName || '',
          email: googleProfile.email,
          contact: googleContact,
          role: googleRole,
          googleId: googleProfile.uid,
        })
      });
      const text = await response.text();
      console.log('GOOGLE SIGNUP RESPONSE:', text);
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
      if (!response.ok || !data) throw new Error((data && data.message) || 'Google signup failed or invalid response');
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('role', data.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAlreadyUser = () => {
    navigate('/signin');
  };

  return (
    <div className="auth-form-page">
      <h1>Sign Up</h1>
      <p>Create a new account.</p>
      {googleProfile ? (
        <form className="auth-form" onSubmit={handleGoogleComplete}>
          {error && <div className="auth-error">{error}</div>}
          <p>
            Signed in with Google as{' '}
            <strong>{googleProfile.displayName || googleProfile.email}</strong>.
          </p>

          <label>
            Phone Number (optional)
            <input
              type="tel"
              value={googleContact}
              onChange={(e) => setGoogleContact(e.target.value)}
              placeholder="Enter phone number"
            />
          </label>

          <fieldset>
            <legend>Account Type</legend>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="googleRole"
                  value="seller"
                  checked={googleRole === 'seller'}
                  onChange={(e) => setGoogleRole(e.target.value)}
                />
                Seller
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="googleRole"
                  value="buyer"
                  checked={googleRole === 'buyer'}
                  onChange={(e) => setGoogleRole(e.target.value)}
                />
                Buyer
              </label>
            </div>
          </fieldset>

          <button type="submit" disabled={loading}>
            {loading ? 'Finishing…' : 'Finish Signup'}
          </button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          <label>
            First Name
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </label>

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
            Contact Number
            <input
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </label>

          <fieldset>
            <legend>Account Type</legend>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="role"
                  value="seller"
                  checked={role === 'seller'}
                  onChange={(e) => setRole(e.target.value)}
                />
                Seller
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="role"
                  value="buyer"
                  checked={role === 'buyer'}
                  onChange={(e) => setRole(e.target.value)}
                />
                Buyer
              </label>
            </div>
          </fieldset>

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

          <button type="button" className="google-button" onClick={handleGoogleSignup} disabled={loading}>
            Sign up with Google
          </button>
          <button type="submit" disabled={loading}>
            {loading ? 'Signing up…' : 'Sign Up'}
          </button>
        </form>
      )}

      {!googleProfile && (
        <div className="auth-switch">
          Already a user?{' '}
          <button type="button" className="link-button" onClick={handleAlreadyUser}>
            Sign In
          </button>
        </div>
      )}
    </div>
  );
};

export default Signup;