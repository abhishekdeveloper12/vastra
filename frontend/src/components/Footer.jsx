import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-olx">
      <div className="footer-main">
        <div className="footer-section">
            <img src={process.env.PUBLIC_URL + '/logo.png'} alt="Logo" className="footer-logo-img" />
            <h3>Customer Care</h3>
            <p>Phone: <b>+91-9999999999</b> <span style={{color:'#888', fontSize:'0.95em'}}>(will be updated soon)</span></p>
            <p>Email: <b>support@olxclone.com</b></p>
        </div>
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/about">About Us</a></li>
            <li><a href="/help">Help</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Legal</h3>
          <ul>
            <li>Terms & Conditions</li>
            <li>Privacy Policy</li>
            <li>© {new Date().getFullYear()} OLX Clone. All rights reserved.</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
