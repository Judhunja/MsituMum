import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/nursery', icon: 'eco', label: 'Nursery' },
    { path: '/biodiversity', icon: 'forest', label: 'Biodiversity' },
    { path: '/prediction', icon: 'analytics', label: 'Predictions' },
  ];

  return (
    <div className="w-64 bg-green-800 text-white min-h-screen">
      <div className="p-6">
        <h2 className="text-2xl font-bold">MsituMum</h2>
        <p className="text-sm text-green-200 mt-1">Forest Restoration</p>
      </div>

      <nav className="mt-6">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 hover:bg-green-700 transition-colors ${
              location.pathname === item.path ? 'bg-green-700 border-l-4 border-white' : ''
            }`}
          >
            <span className="material-symbols-outlined mr-3">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
