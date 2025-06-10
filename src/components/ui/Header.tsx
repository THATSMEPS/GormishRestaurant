import React from 'react';
import { motion } from 'framer-motion';

interface HeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, children }) => {
  return (
    <motion.div
      initial={{ y: -20 }}
      animate={{ y: 0 }}
      className="bg-white rounded-xl shadow-sm p-6 mb-6 relative"
    >
      <div className="flex flex-col items-start gap-4">
        <div className="flex w-full justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export default Header;
