import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import ProductDetail from './ProductDetail';

// Haversine formula to calculate distance between two lat/lng points in km
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const ProductList = ({ isSeller, search = "", sort = "desc", nearby = false, buyerLocation = null }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = isSeller ? `${API_BASE_URL}/api/products/seller` : `${API_BASE_URL}/api/products/all`;
        let res;
        if (isSeller) {
          const token = localStorage.getItem('token');
          res = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          res = await axios.get(url);
        }
        setProducts(res.data);
      } catch (err) {
        setProducts([]);
      }
      setLoading(false);
    };
    fetchProducts();
  }, [isSeller]);

  if (loading) return <div>Loading products...</div>;
  if (!products.length) return <div>No products found.</div>;

  // Filter and sort for buyers
  let filteredProducts = products;
  if (!isSeller && search) {
    filteredProducts = filteredProducts.filter(p =>
      p.name && p.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  // Filter by nearby if enabled and buyer location is available
  if (!isSeller && nearby && buyerLocation && buyerLocation.lat && buyerLocation.lng) {
    filteredProducts = filteredProducts.filter(p => {
      if (typeof p.latitude === 'number' && typeof p.longitude === 'number') {
        const dist = getDistanceFromLatLonInKm(buyerLocation.lat, buyerLocation.lng, p.latitude, p.longitude);
        return dist <= 2;
      }
      return false;
    });
  }
  if (!isSeller) {
    filteredProducts = filteredProducts.slice().sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || a.updatedAt || 0);
      const dateB = new Date(b.createdAt || b.date || b.updatedAt || 0);
      return sort === "asc" ? dateA - dateB : dateB - dateA;
    });
  }

  if (!filteredProducts.length) return <div>No products found.</div>;

  return (
    <>
      <div className="product-list-grid">
        {filteredProducts.map(product => (
          <div key={product._id} style={{ marginBottom: 32 }}>
            <ProductDetail product={product} />
            {isSeller && (
              <div style={{ margin: '12px 0 0 32px' }}>
                <b>Status: </b>
                {product.status === 'pending' && <span style={{ color: 'orange' }}>Approval Pending</span>}
                {product.status === 'approved' && <>
                  <span style={{ color: 'green' }}>Approved</span>
                  <button style={{ marginLeft: 8 }} onClick={async () => {
                    try {
                      const token = localStorage.getItem('token');
                      await axios.patch(`${API_BASE_URL}/api/products/sold/${product._id}`, {}, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      setProducts(products => products.map(p => p._id === product._id ? { ...p, status: 'sold' } : p));
                    } catch {}
                  }}>Mark as Sold</button>
                  <button style={{ marginLeft: 8, background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', cursor: 'pointer' }} onClick={async () => {
                    if (!window.confirm('Are you sure you want to delete this product?')) return;
                    try {
                      const token = localStorage.getItem('token');
                      await axios.delete(`${API_BASE_URL}/api/products/${product._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      setProducts(products => products.filter(p => p._id !== product._id));
                    } catch {}
                  }}>Delete</button>
                </>}
                {product.status === 'rejected' && <span style={{ color: 'red' }}>Rejected</span>}
                {product.status === 'sold' && <span style={{ color: 'blue' }}>Sold</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default ProductList;
