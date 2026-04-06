import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api';

const AddProduct = ({ onProductAdded }) => {
  const [form, setForm] = useState({
    name: '',
    address: '',
    price: '',
    reasonForSelling: '',
    contactNumber: '',
    photos: [null, null, null, null, null]
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (idx, file) => {
    const newPhotos = [...form.photos];
    newPhotos[idx] = file;
    setForm({ ...form, photos: newPhotos });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const missingPhotos = form.photos.map((p, idx) => (p ? null : idx + 1)).filter(Boolean);
    if (missingPhotos.length > 0) {
      setError(`Please upload a photo for input(s): ${missingPhotos.join(', ')}`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = new FormData();
      Object.keys(form).forEach(key => {
        if (key === 'photos') {
          form.photos.forEach(photo => data.append('photos', photo));
        } else {
          data.append(key, form[key]);
        }
      });
      // Add authentication header with JWT token
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/products/add`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setForm({ name: '', address: '', price: '', reasonForSelling: '', contactNumber: '', photos: [null, null, null, null, null] });
      if (onProductAdded) onProductAdded();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add product');
    }
    setLoading(false);
  };

  return (
    <form className="add-product-form" onSubmit={handleSubmit}>
      <h2>Add Product</h2>
      {error && <div className="error">{error}</div>}
      <label htmlFor="name">Product Name</label>
      <input id="name" name="name" placeholder="Product Name" value={form.name} onChange={handleChange} required />
      <label htmlFor="address">Address</label>
      <input id="address" name="address" placeholder="Address" value={form.address} onChange={handleChange} required />
      <label htmlFor="price">Price</label>
      <input id="price" name="price" placeholder="Price" type="number" value={form.price} onChange={handleChange} required />
      <label htmlFor="reasonForSelling">Reason for Selling</label>
      <input id="reasonForSelling" name="reasonForSelling" placeholder="Reason for Selling" value={form.reasonForSelling} onChange={handleChange} required />
      <label htmlFor="contactNumber">Contact Number</label>
      <input id="contactNumber" name="contactNumber" placeholder="Contact Number" value={form.contactNumber} onChange={handleChange} required />
      <label>Product Photos (5 required)</label>
      {[0,1,2,3,4].map(idx => (
        <input
          key={idx}
          type="file"
          accept="image/*"
          required
          onChange={e => handlePhotoChange(idx, e.target.files[0])}
        />
      ))}
      <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Product'}</button>
    </form>
  );
};

export default AddProduct;
