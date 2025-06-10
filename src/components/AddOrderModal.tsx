import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Plus, Minus, Phone, X, IndianRupee, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

const menuItems: MenuItem[] = [
  { id: '1', name: 'Margherita Pizza', price: 299, category: 'Pizza' },
  { id: '2', name: 'Pepperoni Pizza', price: 399, category: 'Pizza' },
  { id: '3', name: 'Butter Chicken', price: 349, category: 'Main Course' },
  { id: '4', name: 'Dal Makhani', price: 249, category: 'Main Course' },
  { id: '5', name: 'Garlic Naan', price: 49, category: 'Breads' },
  { id: '6', name: 'Chocolate Brownie', price: 199, category: 'Desserts' },
  { id: '7', name: 'Ice Cream', price: 149, category: 'Desserts' },
  { id: '8', name: 'Masala Dosa', price: 199, category: 'South Indian' },
  { id: '9', name: 'Idli Sambar', price: 149, category: 'South Indian' },
  { id: '10', name: 'Manchurian', price: 249, category: 'Chinese' },
];

interface OrderItem extends MenuItem {
  quantity: number;
}

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddOrderModal: React.FC<AddOrderModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<'DINE-IN' | 'PARCEL'>('DINE-IN');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH'>('UPI');
  const [showCart, setShowCart] = useState(false);
  const [tableNumber, setTableNumber] = useState('');

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addItem = (item: MenuItem) => {
    setSelectedItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setSelectedItems(prev => {
      const updatedItems = prev.map(item => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      }).filter((item): item is OrderItem => item !== null);
      return updatedItems;
    });
  };

  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + (item.price * item.quantity), 0
  );

  const handleSubmit = () => {
    if (selectedItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }
    // Handle order submission here
    toast.success('Order created successfully!');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-0 sm:p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white w-full h-full sm:h-auto sm:rounded-xl shadow-xl sm:max-w-4xl sm:max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-lg font-semibold">New Order</h2>
              <button
                onClick={() => setShowCart(prev => !prev)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative block sm:hidden"
              >
                <ShoppingBag size={20} />
                {selectedItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {selectedItems.length}
                  </span>
                )}
              </button>
            </div>

            <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
              {/* Left Side - Menu Items */}
              <div className={`w-full sm:w-2/3 border-r border-gray-200 flex flex-col ${showCart ? 'hidden sm:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-200">
                  <div className="search-input-group">
                    <Search className="search-icon" size={18} />
                    <input
                      type="text"
                      placeholder="Search menu items..."
                      className="input-field"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 max-h-[60vh]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-h-min">
                    {filteredItems.map((item) => (
                      <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addItem(item)}
                        className="p-4 rounded-lg border border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-colors text-left"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-800">{item.name}</h3>
                          <span className="text-primary font-medium">₹{item.price}</span>
                        </div>
                        <p className="text-sm text-gray-500">{item.category}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Order Summary */}
              <div className={`w-full sm:w-1/3 flex flex-col ${!showCart ? 'hidden sm:flex' : 'flex'}`}>
                <div className="flex-1 overflow-y-auto p-6 max-h-[90vh] sm:pb-12">
                  <div className="mb-6">
                    <button
                      onClick={() => setShowCart(false)}
                      className="mb-6 p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 sm:hidden"
                    >
                      <ArrowLeft size={20} />
                      <span>Back to Menu</span>
                    </button>
                    <div className="flex gap-4 mb-6">
                      <button
                        onClick={() => setOrderType('DINE-IN')}
                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                          orderType === 'DINE-IN'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        Dine In
                      </button>
                      <button
                        onClick={() => setOrderType('PARCEL')}
                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                          orderType === 'PARCEL'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        Parcel
                      </button>
                    </div>

                    {orderType === 'DINE-IN' && (
                      <div className="mb-6">
                        <label className="form-label" htmlFor="tableNumber">Table Number (Optional)</label>
                        <input
                          type="text"
                          id="tableNumber"
                          className="input-field"
                          placeholder="Enter table number"
                          value={tableNumber}
                          onChange={(e) => setTableNumber(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="input-group mb-6">
                      <Phone className="input-group-icon" size={18} />
                      <input
                        type="tel"
                        placeholder="Customer phone number (optional)"
                        className="input-field"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        maxLength={10}
                      />
                    </div>
                  </div>

                  {selectedItems.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                      <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Your cart is empty</p>
                      <p className="text-sm">Add items from the menu</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {selectedItems.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-800">{item.name}</h4>
                            <p className="text-sm text-gray-500 mt-1">₹{item.price} × {item.quantity}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-2 hover:bg-gray-100 rounded"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-2 hover:bg-gray-100 rounded"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <div className="p-6 border-t border-gray-200 mt-6">
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-medium">Total Amount</span>
                      <span className="text-lg font-semibold text-primary">₹{totalAmount}</span>
                    </div>

                    <div className="flex gap-4 mb-6">
                      <button
                        onClick={() => setPaymentMethod('UPI')}
                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                          paymentMethod === 'UPI'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        UPI
                      </button>
                      <button
                        onClick={() => setPaymentMethod('CASH')}
                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                          paymentMethod === 'CASH'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        Cash
                      </button>
                    </div>

                    <button
                      onClick={handleSubmit}
                      className="btn-primary w-full py-3"
                    >
                      Place Order
                    </button>
                  </div>

                  {/* Empty container for extra space */}
                  <div style={{ height: '100px' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddOrderModal;