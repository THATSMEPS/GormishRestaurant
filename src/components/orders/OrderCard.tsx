import React, { useState } from 'react';
import { OrderStatus, Address } from '../../types/orders';
import { motion } from 'framer-motion';
import { Check, X, Clock, MapPin, User } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface OrderData {
  id: string;
  customer: string;
  address: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: OrderStatus;
  timestamp: string;
}

interface OrderCardProps {
  order: OrderData;
  activeTab: OrderStatus;
  onApprove: () => void;
  onReject: () => void;
  onStatusChange: (status: OrderStatus) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  activeTab,
  onApprove,
  onReject,
  onStatusChange,
}) => {
  const { id, customer, address, items, total, status, timestamp } = order;

  const renderActions = () => {
    if (activeTab === 'pending') {
      return (
        <div className="flex gap-2 mt-4">
          <Button
            variant="success"
            fullWidth
            leftIcon={<Check size={16} />}
            onClick={(event) => {
              event.stopPropagation();
              onApprove();
            }}
          >
            Accept
          </Button>
          <Button
            variant="danger"
            fullWidth
            leftIcon={<X size={16} />}
            onClick={(event) => {
              event.stopPropagation();
              onReject();
            }}
          >
            Reject
          </Button>
        </div>
      );
    }

    if (activeTab === 'preparing') {
      return (
        <Button
          variant="primary"
          fullWidth
          onClick={(event) => {
            event.stopPropagation();
            onStatusChange('ready');
          }}
          className="mt-4"
        >
          Ready
        </Button>
      );
    }

    if (activeTab === 'ready') {
      return (
        <Button
          variant="primary"
          fullWidth
          onClick={(event) => {
            event.stopPropagation();
            onStatusChange('dispatch');
          }}
          className="mt-4"
        >
          Dispatched
        </Button>
      );
    }

    return null;
  };

  return (
    <Card>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex justify-between items-center mb-2">
          <p className="text-gray-800 font-semibold text-lg">{customer}</p>
          <span className="text-xs font-semibold text-blue-600 bg-blue-100 rounded px-2 py-0.5">DELIVERY</span>
        </div>
        <div className="text-gray-500 text-sm mb-1">
          <p>#{id.split('-')[0]}</p>
        </div>
        <div className="flex items-center space-x-2 text-gray-500 text-sm mb-1">
          <Clock size={14} />
          <span>{timestamp}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-500 text-sm mb-3">
          <MapPin size={14} />
          <span>
            {(() => {
              if (!address) return '';
              const fullAddress = address;
              if (fullAddress.length > 10) {
                return fullAddress.slice(0, 10) + '...';
              }
              return fullAddress;
            })()}
          </span>
        </div>

        <hr className="border-gray-300 mb-3" />

        <div className="mb-3">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-gray-700 mb-1">
              <div className="flex items-center space-x-2 min-w-0 max-w-xs">
                <div className="w-6 h-6 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {item.quantity}
                </div>
                <span className="truncate">{item.name}</span>
              </div>
              <span>₹{item.price}</span>
            </div>
          ))}
        </div>

        <hr className="border-gray-300 mb-3" />

        <div className="flex justify-between items-center font-semibold text-lg text-blue-700 mb-3">
          <span>Total Amount</span>
          <span>₹{total}</span>
        </div>

        {renderActions()}
      </motion.div>
    </Card>
  );
};

export default OrderCard;
