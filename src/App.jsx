import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Nursery from './pages/Nursery';
import Biodiversity from './pages/Biodiversity';
import Prediction from './pages/Prediction';
import { useAuth } from './hooks/useAuth';

function PrivateRoute({ children }) {
  const { session, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return session ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/nursery" element={<PrivateRoute><Nursery /></PrivateRoute>} />
      <Route path="/biodiversity" element={<PrivateRoute><Biodiversity /></PrivateRoute>} />
      <Route path="/prediction" element={<PrivateRoute><Prediction /></PrivateRoute>} />
    </Routes>
  );
}

export default App;
