import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  index: number;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ title, value, icon: Icon, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center text-center"
    >
      <div className="p-2 bg-primary/10 rounded-lg mb-3">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="text-gray-600 text-xs sm:text-sm mb-1">{title}</h3>
      <p className="text-lg sm:text-2xl font-bold text-gray-800">{value}</p>
    </motion.div>
  );
};

export default MetricsCard;
