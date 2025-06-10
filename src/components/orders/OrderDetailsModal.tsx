import React from 'react';
import Modal from '../ui/BaseModal';
import { Clock, MapPin } from 'lucide-react';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    customer: string;
    address: string;
    items: { name: string; quantity: number; price: number; addons?: { name: string; price?: number }[] }[];
    total: number;
    timestamp: string;
  } | null;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Order Details`}>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-gray-800 font-semibold text-lg"><strong></strong> {order.customer}</p>
          <span className="text-xs font-semibold text-blue-600 bg-blue-100 rounded px-2 py-0.5">DELIVERY</span>
        </div>
        <div className="text-gray-500 text-sm mb-1">
          <p>#{order.id}</p>
        </div>
        <div className="flex items-center space-x-2 text-gray-500 text-sm mb-1">
          <Clock size={14} />
          <span>{order.timestamp}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-500 text-sm mb-3 break-words whitespace-normal">
          <MapPin size={14} />
          <span>{order.address}</span>
        </div>

        <hr className="border-gray-300 mb-3" />

        <div className="mb-3">
          {order.items.map((item, index) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between items-center text-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-xs font-semibold">
                    {item.quantity}
                  </div>
                  <span>{item.name}</span>
                </div>
                <span>₹{item.price}</span>
              </div>
              {item.addons && item.addons.length > 0 && (
                <ul className="ml-8 text-gray-600 text-sm list-disc">
                  {item.addons.map((addon, idx) => (
                    <li key={idx}>
                      {addon.name} - ₹{addon.price ?? '0'}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <hr className="border-gray-300 mb-3" />

        <div className="flex justify-between items-center font-semibold text-lg text-blue-700 mb-3">
          <span>Total Amount</span>
          <span>₹{order.total}</span>
        </div>
      </div>
    </Modal>
  );
};

export default OrderDetailsModal;
