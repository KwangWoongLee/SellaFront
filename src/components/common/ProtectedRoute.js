import React from 'react';
import { Navigate } from 'react-router-dom';
import { is_authed } from 'util/com';

const ProtectedRoute = ({ auth, children }) => {
  if (!is_authed()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
export default ProtectedRoute;
