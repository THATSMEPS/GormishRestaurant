import React from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  imageUrl?: string;
  title: string;
  description: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  imageUrl = "https://images.unsplash.com/photo-1552566626-52f8b828add9",
  title,
  description
}) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <div className="h-64 md:h-auto md:w-1/2 relative overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img
            src={imageUrl}
            alt="Restaurant Ambiance"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
        </motion.div>

        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {title}
            </h1>
            <p className="text-gray-200 text-lg md:text-xl max-w-md">
              {description}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-8 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
