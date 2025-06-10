import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Home, ShoppingBag, PieChart, User } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const menuItems = [
  { icon: Home, label: 'Orders', path: '/dashboard' },
  { icon: ShoppingBag, label: 'Menu', path: '/dashboard/menu' },
  { icon: PieChart, label: 'Analytics', path: '/dashboard/analytics' },
  { icon: User, label: 'Profile', path: '/dashboard/profile' },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar for desktop only */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="sidebar hidden md:block"
      >
        <div className="flex items-center gap-3 mb-8">
          <Menu size={24} className="text-primary" />
          <h1 className="text-lg sm:text-xl font-bold">Restaurant Panel</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all text-sm sm:text-base ${
                location.pathname === item.path
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </motion.aside>

      {/* Main content */}
      <main className="main-content">
        {children}
      </main>

      {/* Bottom navigation for mobile */}
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="mobile-nav md:hidden"
      >
        <div className="flex justify-around items-center">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`p-2 rounded-lg flex flex-col items-center gap-1 ${
                location.pathname === item.path ? 'text-primary' : 'text-gray-500'
              }`}
            >
              <item.icon size={20} />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </motion.nav>
    </div>
  );
};

export default DashboardLayout;
