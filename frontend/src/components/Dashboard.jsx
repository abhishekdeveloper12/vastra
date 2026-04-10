import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './Product.css';
import AddProduct from './AddProduct';
import ProductList from './ProductList';

// Dummy role logic, replace with real auth logic
const getUserRole = () => {
  // e.g., return localStorage.getItem('role')
  return localStorage.getItem('role') || 'buyer';
};


const Dashboard = () => {
  const navigate = useNavigate();
  // Auth check: Only show dashboard if logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
    }
  }, [navigate]);

  const [refresh, setRefresh] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("desc");
  const [nearby, setNearby] = useState(false);
  const role = getUserRole();

  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem('user_location');
    return saved ? JSON.parse(saved) : null;
  });
  const [address, setAddress] = useState(() => localStorage.getItem('user_address') || "");
  const [locError, setLocError] = useState("");
  const [locLoading, setLocLoading] = useState(false);

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      return data.display_name || '';
    } catch {
      return '';
    }
  };

  const handleGetLocation = () => {
    setLocError("");
    setLocLoading(true);
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.");
      setLocLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setLocation(coords);
        localStorage.setItem('user_location', JSON.stringify(coords));
        const addr = await reverseGeocode(coords.lat, coords.lng);
        setAddress(addr);
        localStorage.setItem('user_address', addr);
        setLocLoading(false);
      },
      (err) => {
        setLocError("Location access denied or unavailable.");
        setLocLoading(false);
      }
    );
  };

  useEffect(() => {
    // If location exists but address is missing, fetch address
    if (location && !address) {
      (async () => {
        const addr = await reverseGeocode(location.lat, location.lng);
        setAddress(addr);
        localStorage.setItem('user_address', addr);
      })();
    }
  }, [location]);

  return (
    <div className="dashboard-page">
      <h1>{role === 'seller' ? 'Seller Dashboard' : 'Buyer Dashboard'}</h1>
      {role === 'seller' && <AddProduct onProductAdded={() => setRefresh(r => !r)} />}
      {role === 'buyer' && (
        <>
          <div className="buyer-controls">
            <input
              type="text"
              placeholder="Search products by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
            <button className="get-location-btn" onClick={handleGetLocation} disabled={locLoading}>
              {locLoading ? "Getting Location..." : "Get Location"}
            </button>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 12 }}>
              <input
                type="checkbox"
                checked={nearby}
                onChange={e => setNearby(e.target.checked)}
                style={{ marginRight: 4 }}
                disabled={!address}
              />
              Sort by Nearby (2 km)
            </label>
          </div>
          <div className="location-display">
            {address && (
              <span className="location-pill">
                📍 Your Location: <b>{address}</b>
              </span>
            )}
            {locError && <span className="location-error">{locError}</span>}
          </div>
        </>
      )}
      <ProductList isSeller={role === 'seller'} key={refresh} search={search} sort={sort} nearby={nearby} buyerLocation={location} />
    </div>
  );
};

export default Dashboard;
