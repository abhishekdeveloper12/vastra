import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../firebase';
import './Auth.css';

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [role, setRole] = useState('buyer');
  const [password, setPassword] = useState('');
  const [googleProfile, setGoogleProfile] = useState(null);
  const [googleContact, setGoogleContact] = useState('');
  const [googleRole, setGoogleRole] = useState('buyer');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    alert(`Signing up ${firstName} as ${role}`);
  };

  const handleGoogleSignup = async () => {
    try {
      const user = await signInWithGoogle();
      setGoogleProfile(user);
      setGoogleContact(user.phoneNumber || '');
      setGoogleRole('buyer');
    } catch (error) {
      console.error('Google signup failed', error);
      alert(`Google signup failed: ${error.message}`);
    }
  };

  const handleGoogleComplete = (event) => {
    event.preventDefault();
    alert(
      `Google signup completed for ${googleProfile.displayName || googleProfile.email} as ${googleRole}` +
        (googleContact ? ` with phone ${googleContact}` : '')
    );
    navigate('/');
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

          <button type="submit">Finish Signup</button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="button" className="google-button" onClick={handleGoogleSignup}>
            Sign up with Google
          </button>
          <button type="submit">Sign Up</button>
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