import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import ProductDetail from './ProductDetail';

const ProductList = ({ isSeller }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // No modal state needed, render all products as ProductDetail

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
    <>
      <div className="product-list-grid">
        {products.map(product => (
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
