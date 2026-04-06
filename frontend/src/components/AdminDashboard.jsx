import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPending = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/products/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      setError('Failed to fetch pending products');
      setProducts([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPending(); }, []);

  const handleAction = async (id, action) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE_URL}/api/products/${action}/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPending();
    } catch {
      alert('Failed to update product');
    }
  };

  if (loading) return <div>Loading pending products...</div>;
  if (error) return <div>{error}</div>;
  if (!products.length) return <div>No pending products.</div>;

  return (
    <div className="admin-dashboard">
      <h2>Pending Product Approvals</h2>
      {products.map(product => (
        <div className="product-card" key={product._id}>
          <h3>{product.name}</h3>
          <div className="product-photos">
            {product.photos.map((photo, idx) => {
              let src = photo;
              if (!photo.startsWith('http')) {
                src = `${API_BASE_URL}/uploads/${photo.split('uploads/')[1]}`;
              }
              return <img src={src} alt="Product" key={idx} style={{ width: 80, marginRight: 8 }} />;
            })}
          </div>
          <div>Address: {product.address}</div>
          <div>Price: ₹{product.price}</div>
          <div>Reason: {product.reasonForSelling}</div>
          <div>Contact: {product.contactNumber}</div>
          <div>Seller: {product.seller?.email}</div>
          <button style={{ marginRight: 8 }} onClick={() => handleAction(product._id, 'approve')}>Approve</button>
          <button onClick={() => handleAction(product._id, 'reject')}>Reject</button>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
