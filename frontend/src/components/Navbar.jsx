import React, { useEffect, useState } from 'react';
import { FaUser } from 'react-icons/fa';
import { FaComments } from 'react-icons/fa';
import { getUserChats } from '../api/chatApi';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  // Fetch unread chat count
  useEffect(() => {
    const fetchUnread = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const chats = await getUserChats(token);
        let count = 0;
        const userId = localStorage.getItem('userId');
        chats.forEach(chat => {
          chat.messages.forEach(msg => {
            if (String(msg.sender) !== String(userId) && !msg.read) count++;
          });
        });
        setUnreadCount(count);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Always set user from localStorage on mount
    const localUser = localStorage.getItem('clothesellingUser');
    if (localUser) {
      try {
        setUser(JSON.parse(localUser));
      } catch {
        setUser(null);
        localStorage.removeItem('clothesellingUser');
      }
    } else {
      setUser(null);
    }

    // Listen for Firebase auth state changes
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email,
        });
        // Optionally update localStorage for consistency
        localStorage.setItem('clothesellingUser', JSON.stringify({
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email,
        }));
      } else {
        // If not logged in, clear user
        setUser(null);
        localStorage.removeItem('clothesellingUser');
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
    localStorage.removeItem('user_address');
    localStorage.removeItem('user_location');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/signin');
  };

  // Detect admin by role in localStorage
  const role = localStorage.getItem('role');

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo">Logo</div>
      </div>
      {/* Chat Icon with Notification Badge (only if logged in and not admin) */}
      {user && role !== 'admin' && (
        <div className="navbar-chat-icon" style={{ position: 'relative', marginLeft: 18, cursor: 'pointer' }} onClick={() => navigate('/chats')}>
          <FaComments size={26} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: -6,
              right: -6,
              background: '#e53935',
              color: '#fff',
              borderRadius: '50%',
              padding: '2px 7px',
              fontSize: '0.9rem',
              fontWeight: 700,
              zIndex: 10,
            }}>{unreadCount}</span>
          )}
        </div>
      )}
      <div className="navbar-center">
        {user ? (
          <>
            <a href="#home" onClick={e => { e.preventDefault(); navigate('/dashboard'); }}>Dashboard</a>
            <a href="#about" onClick={e => { e.preventDefault(); navigate('/about'); }}>About Us</a>
            <a href="#help" onClick={e => { e.preventDefault(); navigate('/help'); }}>Help</a>
          </>
        ) : (
          <>
            <a href="#about" onClick={e => { e.preventDefault(); navigate('/about'); }}>About Us</a>
            <a href="#help" onClick={e => { e.preventDefault(); navigate('/help'); }}>Help</a>
          </>
        )}
      </div>
      <div className="navbar-right">
        <div className="user-container">
          <div className="user-icon">
            <FaUser size={24} />
          </div>
          <div className="dropdown">
            {role === 'admin' ? (
              <div className="profile-card">
                <p className="profile-welcome">Welcome Admin</p>
                <button type="button" className="logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : user ? (
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