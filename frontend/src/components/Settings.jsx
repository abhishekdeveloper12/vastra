import React, { useState } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import './Settings.css';

const Settings = () => {
  return (
    <div className="settings-page">
      <h1>Account Settings</h1>
      <p>Manage your profile, preferences, and account details from here.</p>
      <div className="settings-card">
        <h2>Profile settings</h2>
        <p>Update your name, email, and notification preferences.</p>
        <button type="button">Edit Profile</button>
      </div>
      <div className="settings-card" style={{ marginTop: 24 }}>
        <h2>Delete Profile</h2>
        <DeleteProfile />
      </div>
    </div>
  );
};

function DeleteProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // For demo, get userId from localStorage (replace with real auth)
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('User not logged in. (userId missing in localStorage)');
        setLoading(false);
        return;
      }
      // Debug: show userId being sent
      console.log('Deleting user with userId:', userId);
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/users/delete`, {
        data: { userId },
        headers: { Authorization: `Bearer ${token}` }
      });
      // Sign out from Firebase if logged in
      if (auth.currentUser) {
        try {
          await signOut(auth);
        } catch (e) {
          // Ignore Firebase signout error
        }
      }
      setSuccess('Profile deleted. You can now re-register.');
      localStorage.clear();
      setTimeout(() => {
        window.location.href = '/signup';
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete profile');
    }
    setLoading(false);
  };

  return (
    <div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      <button type="button" onClick={handleDelete} disabled={loading} style={{ background: '#e74c3c', color: '#fff', marginTop: 8 }}>
        {loading ? 'Deleting...' : 'Delete Profile'}
      </button>
    </div>
  );
}

export default Settings;
