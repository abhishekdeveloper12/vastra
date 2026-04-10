import React, { useState, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api';

const AddProduct = ({ onProductAdded }) => {
  const [form, setForm] = useState({
    name: '',
    address: '',
    price: '',
    reasonForSelling: '',
    contactNumber: '',
    photos: [null, null, null, null, null],
    latitude: '',
    longitude: ''
  });
  const [geoLoading, setGeoLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const addressInputRef = useRef(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch address suggestions from Nominatim
  const fetchSuggestions = async (query) => {
    setGeoLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&countrycodes=IN`);
      const data = await res.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setGeoLoading(false);
    }
  };

  const handleChange = async e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'address') {
      setForm(prev => ({ ...prev, latitude: '', longitude: '' }));
      setError('');
      if (value.trim().length > 2) {
        await fetchSuggestions(value);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  // When user selects a suggestion
  const handleSuggestionClick = (suggestion) => {
    setForm(prev => ({
      ...prev,
      address: suggestion.display_name,
      latitude: suggestion.lat,
      longitude: suggestion.lon
    }));
    setSuggestions([]);
    setShowSuggestions(false);
    setError('');
  };

  // Hide suggestions on blur (with delay for click)
  const handleAddressBlur = () => {
    setTimeout(() => setShowSuggestions(false), 150);
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
    let latitude = form.latitude;
    let longitude = form.longitude;
    // If lat/lng missing, try to geocode on submit (user may have only typed address)
    if ((!latitude || !longitude) && form.address.trim().length > 2) {
      setGeoLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.address)}&addressdetails=1&limit=1&countrycodes=IN`);
        const data = await res.json();
        if (data && data.length > 0) {
          latitude = data[0].lat;
          longitude = data[0].lon;
        } else {
          setError('Could not find location for this address.');
          setGeoLoading(false);
          return;
        }
      } catch {
        setError('Could not find location for this address.');
        setGeoLoading(false);
        return;
      }
      setGeoLoading(false);
    }
    if (!latitude || !longitude) {
      setError('Please enter a valid address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = new FormData();
      Object.keys(form).forEach(key => {
        if (key === 'photos') {
          form.photos.forEach(photo => data.append('photos', photo));
        } else if (key === 'latitude') {
          data.append('latitude', latitude);
        } else if (key === 'longitude') {
          data.append('longitude', longitude);
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
      setForm({ name: '', address: '', price: '', reasonForSelling: '', contactNumber: '', photos: [null, null, null, null, null], latitude: '', longitude: '' });
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
      <div style={{ position: 'relative' }}>
        <input
          id="address"
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          onFocus={() => form.address.length > 2 && suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={handleAddressBlur}
          ref={addressInputRef}
          autoComplete="off"
          required
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul style={{
            position: 'absolute',
            zIndex: 10,
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: 6,
            width: '100%',
            maxHeight: 180,
            overflowY: 'auto',
            margin: 0,
            padding: 0,
            listStyle: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            {suggestions.map((s, idx) => (
              <li
                key={s.place_id}
                style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: idx !== suggestions.length - 1 ? '1px solid #eee' : 'none' }}
                onMouseDown={() => handleSuggestionClick(s)}
              >
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <label htmlFor="price">Price</label>
      {geoLoading && <div style={{ color: '#555', fontSize: 13 }}>Detecting location from address...</div>}
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
