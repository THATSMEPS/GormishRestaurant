import React from 'react';
import { OrderStatus } from '../../types/orders';

interface OrderStatusTabsProps {
  orderStates: OrderStatus[];
  activeTab: OrderStatus;
  onTabChange: (tab: OrderStatus) => void;
}

const OrderStatusTabs: React.FC<OrderStatusTabsProps> = ({
  orderStates,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex gap-4 mb-6">
      {orderStates.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === tab
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default OrderStatusTabs;
