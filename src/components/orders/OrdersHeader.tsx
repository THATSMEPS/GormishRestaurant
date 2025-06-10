import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import OnlineToggle from './OnlineToggle';

interface OrdersHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  restaurantId: string;
}

const OrdersHeader: React.FC<OrdersHeaderProps> = ({
  searchQuery,
  onSearchChange,
  restaurantId,
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white z-10 px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="px-6 py-3 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <OnlineToggle restaurantId={restaurantId} />
        </div>
      </div>
    </div>
  );
};

export default OrdersHeader;
