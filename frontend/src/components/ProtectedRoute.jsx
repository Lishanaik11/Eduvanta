import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {

  const user = localStorage.getItem('user');

  // If no login data
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in
  return children;
};

export default ProtectedRoute;