
import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, CreditCard, PieChart, Settings } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { to: '/', icon: BarChart3, label: 'Dashboard' },
    { to: '/transactions', icon: CreditCard, label: 'Transactions' },
    { to: '/analytics', icon: PieChart, label: 'Analytics' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-sm">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">QuickTrack</h1>
        <p className="text-sm text-gray-600 mt-1">Business Finance</p>
      </div>
      
      <nav className="px-4 space-y-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <Icon className="h-5 w-5 mr-3" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <button className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
          <Settings className="h-5 w-5 mr-3" />
          Settings
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
