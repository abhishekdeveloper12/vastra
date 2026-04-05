import React from 'react';
import { FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  const handleSignin = () => navigate('/signin');
  const handleSignup = () => navigate('/signup');

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo">Logo</div>
      </div>
      <div className="navbar-center">
        <a href="#home">Home</a>
        <a href="#about">About Us</a>
        <a href="#help">Help</a>
      </div>
      <div className="navbar-right">
        <div className="user-container">
          <div className="user-icon">
            <FaUser size={24} />
          </div>
          <div className="dropdown">
            <button onClick={handleSignin}>Sign In</button>
            <button onClick={handleSignup}>Sign Up</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;