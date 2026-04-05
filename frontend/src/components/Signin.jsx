import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    alert(`Signing in with ${email}`);
  };

  return (
    <div className="auth-form-page">
      <h1>Sign In</h1>
      <p>Please sign in to your account.</p>
      <form className="auth-form" onSubmit={handleSubmit}>
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