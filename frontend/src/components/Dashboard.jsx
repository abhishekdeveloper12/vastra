import React, { useState } from 'react';
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
  const [refresh, setRefresh] = useState(false);
  const role = getUserRole();

  return (
    <div className="dashboard-page">
      <h1>{role === 'seller' ? 'Seller Dashboard' : 'Buyer Dashboard'}</h1>
      {role === 'seller' && <AddProduct onProductAdded={() => setRefresh(r => !r)} />}
      <ProductList isSeller={role === 'seller'} key={refresh} />
    </div>
  );
};

export default Dashboard;
