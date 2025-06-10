import React from 'react';
import { OrderStatus } from '../../types/orders';
import { motion } from 'framer-motion';
import { Clock, MapPin } from 'lucide-react';
import Card from '../ui/Card';

interface AddressObject {
  typedAddress?: string;
  mappedAddress?: any;
  [key: string]: any;
}

interface OrderData {
  id: string;
  customer: string;
  address?: string | AddressObject;
  items: { name: string; quantity: number; price: number; isAddon?: boolean }[];
  total: number;
  status: OrderStatus;
  timestamp?: string;
}

interface OrderHistoryCardProps {
  order: OrderData;
}

const OrderHistoryCard: React.FC<OrderHistoryCardProps> = ({ order }) => {
  const { id, customer, address, items, total, status, timestamp } = order;

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
          <span className="text-xs font-semibold text-blue-600 bg-blue-100 rounded px-2 py-0.5">
            {status === 'dispatch' ? 'Dispatch' : status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        <div className="text-gray-500 text-sm mb-1">
          <p>#{id.split('-')[0]}</p>
        </div>
        {timestamp && (
          <div className="flex items-center space-x-2 text-gray-500 text-sm mb-1">
            <Clock size={14} />
            <span>{timestamp}</span>
          </div>
        )}
        {address && (
          <div className="flex items-center space-x-2 text-gray-500 text-sm mb-3">
            <MapPin size={14} />
            <span>
              {typeof address === 'string'
                ? address
                : address && typeof address === 'object'
                ? address.typedAddress || address.mappedAddress || ''
                : ''}
            </span>
          </div>
        )}


        <div className="mb-3">
          {items.map((item, index) => (
            <div key={index} className={`flex flex-col mb-1 ${item.isAddon ? 'ml-6 text-gray-600 text-sm' : 'text-gray-700'}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 min-w-0 max-w-xs">
                  {!item.isAddon && (
                    <div className="w-6 h-6 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {item.quantity}
                    </div>
                  )}
                  <span className="truncate">{item.name}</span>
                </div>
                <span>₹{item.price}</span>
              </div>
            </div>
          ))}
        </div>


        <div className="flex justify-between items-center font-semibold text-lg text-blue-700 mb-3">
          <span>Total Amount</span>
          <span>₹{total}</span>
        </div>
      </motion.div>
    </Card>
  );
};

export default OrderHistoryCard;
