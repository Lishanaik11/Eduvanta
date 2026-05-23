import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {

  const admin = localStorage.getItem('admin');

  // If admin not logged in
  if (!admin) {
    return <Navigate to="/admin" replace />;
  }

  // Admin authenticated
  return children;
};

export default AdminProtectedRoute;