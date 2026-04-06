import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api';

const ProductList = ({ isSeller }) => {
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

  return (
    <div className="product-list">
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
          {isSeller && (
            <div>
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
              </>}
              {product.status === 'rejected' && <span style={{ color: 'red' }}>Rejected</span>}
              {product.status === 'sold' && <span style={{ color: 'blue' }}>Sold</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProductList;
