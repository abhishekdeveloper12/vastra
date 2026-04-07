import React, { useState } from 'react';
import './ProductDetail.css';
import ChatModal from './ChatModal';

const ProductDetail = ({ product }) => {
  // Determine if current user is a buyer
  // Get role from localStorage (default to buyer)
  const role = localStorage.getItem('role') || 'buyer';
  // Debug log
  console.log('ProductDetail:', { product, role, seller: product.seller });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  if (!product) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? product.photos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === product.photos.length - 1 ? 0 : prev + 1));
  };

  const handleZoom = () => setZoom((z) => !z);

  let src = product.photos[currentIndex];
  if (src && !src.startsWith('http')) {
    src = `/uploads/${src.split('uploads/')[1]}`;
  }

  return (
    <div className="product-detail-container">
      {/* Zoom overlay for better UX */}
      {zoom && (
        <div
          className="zoom-overlay"
          onClick={() => setZoom(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.18)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ position: 'relative' }}>
            <button
              style={{
                position: 'absolute',
                top: 12,
                right: 18,
                background: '#3949ab',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 16px',
                fontSize: '1rem',
                cursor: 'pointer',
                zIndex: 10,
              }}
              onClick={e => { e.stopPropagation(); setZoom(false); }}
            >Close</button>
            <div className="carousel-image-wrapper zoomed" onClick={e => e.stopPropagation()}>
              <img src={src} alt="Product" className="carousel-image" />
            </div>
          </div>
        </div>
      )}
      <div className="product-detail-left">
        <div className="carousel">
          <button className="carousel-arrow left" onClick={handlePrev}>&lt;</button>
          <div className={`carousel-image-wrapper${zoom ? ' zoomed' : ''}`} onClick={() => setZoom(true)}>
            <img src={src} alt="Product" className="carousel-image" />
          </div>
          <button className="carousel-arrow right" onClick={handleNext}>&gt;</button>
        </div>
        <div className="carousel-indicators">
          {product.photos.map((_, idx) => (
            <span key={idx} className={idx === currentIndex ? 'active' : ''} />
          ))}
        </div>
        <div className="zoom-hint">{zoom ? 'Click outside or Close to exit zoom' : 'Click image to zoom'}</div>
      </div>
      <div className="product-detail-right">
        <h2>{product.name}</h2>
        <div><b>Price:</b> ₹{product.price}</div>
        <div><b>Address:</b> {product.address}</div>
        <div><b>Reason:</b> {product.reasonForSelling}</div>
        <div><b>Contact:</b> {product.contactNumber}</div>
        {product.seller?.email && <div><b>Seller:</b> {product.seller.email}</div>}
        {/* Show chat button for buyers only */}
        {role === 'buyer' && (
          <>
            <button
              className="chat-seller-btn"
              style={{
                marginTop: 16,
                background: '#3949ab',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '10px 24px',
                fontSize: '1.1rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
              onClick={() => setChatOpen(true)}
            >
              Chat with Seller
            </button>
            <ChatModal
              open={chatOpen}
              onClose={() => setChatOpen(false)}
              product={product}
              buyerEmail={localStorage.getItem('email') || 'buyer'}
              sellerEmail={product.seller?.email || 'seller@example.com'}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
