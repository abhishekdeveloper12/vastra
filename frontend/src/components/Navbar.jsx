import React, { useEffect, useState } from 'react';
import { FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // If userId or token is missing, force logout
    if (!localStorage.getItem('userId') || !localStorage.getItem('token')) {
      localStorage.clear();
      setUser(null);
      if (window.location.pathname !== '/signin' && window.location.pathname !== '/signup') {
        window.location.href = '/signin';
      }
      return;
    }
    const localUser = localStorage.getItem('clothesellingUser');
    if (localUser) {
      try {
        setUser(JSON.parse(localUser));
      } catch {
        localStorage.removeItem('clothesellingUser');
      }
    }

    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email,
        });
      } else {
        const stored = localStorage.getItem('clothesellingUser');
        setUser(stored ? JSON.parse(stored) : null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignin = () => navigate('/signin');
  const handleSignup = () => navigate('/signup');
  const handleSettings = () => navigate('/settings');

  const handleLogout = async () => {
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (error) {
      console.error('Logout failed', error);
    }
    localStorage.removeItem('clothesellingUser');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    setUser(null);
    navigate('/signin');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo">Logo</div>
      </div>
      <div className="navbar-center">
        <a href="#home" onClick={e => { e.preventDefault(); navigate('/dashboard'); }}>Home</a>
        <a href="#about">About Us</a>
        <a href="#help">Help</a>
      </div>
      <div className="navbar-right">
        <div className="user-container">
          <div className="user-icon">
            <FaUser size={24} />
          </div>
          <div className="dropdown">
            {user ? (
              <div className="profile-card">
                <p className="profile-welcome">Welcome</p>
                <p className="profile-name">{user.displayName || 'User'}</p>
                <button type="button" className="profile-button" onClick={handleSettings}>
                  Settings
                </button>
                <button type="button" className="logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button type="button" onClick={handleSignin}>Sign In</button>
                <button type="button" onClick={handleSignup}>Sign Up</button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;