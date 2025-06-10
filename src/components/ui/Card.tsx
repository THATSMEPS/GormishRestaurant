import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  delay?: number;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, delay = 0 }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      className={`bg-white rounded-xl shadow-sm p-6 ${className}`}
    >
      {title && (
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
      )}
      {children}
    </motion.div>
  );
};

export default Card;
