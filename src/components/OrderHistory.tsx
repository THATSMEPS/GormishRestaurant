import React, { useState, useEffect } from 'react';
import RecentOrdersTable from './analytics/RecentOrdersTable';
import api from '../utils/api';
import { Order } from '../types/analytics';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import OrderDetailsModal from './orders/OrderDetailsModal';

interface OrderHistoryProps {
  restaurantId: string;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ restaurantId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // New state for modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/orders/restaurant/${restaurantId}/history`);
        const apiOrders = response.data.data;
        // Map orders to match structure used in Orders.tsx
        const mappedOrders = apiOrders.map((order: any) => ({
          ...order,
          customer: order.customer?.name || 'N/A',
          address: order.address
            ? typeof order.address === 'string'
              ? order.address
              : ((order.address as { typedAddress?: string; mappedAddress?: string })?.typedAddress ?? (order.address as { typedAddress?: string; mappedAddress?: string })?.mappedAddress ?? '')
            : '',
          items: order.items.map((item: any) => ({
            ...item,
            menuItem: item.menuItem || { name: item.name || '' },
          })),
          date: format(new Date(order.placedAt), 'MMM dd, yyyy'),
        }));
        setOrders(mappedOrders);
      } catch (error) {
        toast.error('Failed to fetch order history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderHistory();
  }, [restaurantId]);

  // Filter orders based on searchQuery and selectedDate
  const filteredOrders = orders.filter((order) => {
    const lowerQuery = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      order.id.toLowerCase().includes(lowerQuery) ||
      (order.customer && typeof order.customer === 'object' && 'name' in order.customer && typeof (order.customer as any).name === 'string' && (order.customer as any).name.toLowerCase().includes(lowerQuery)) ||
      (order.items && order.items.some((item: any) =>
        (item.menuItem?.name || '').toLowerCase().includes(lowerQuery)
      ));

    const matchesDate =
      selectedDate === '' || order.date.startsWith(selectedDate);

    return matchesSearch && matchesDate;
  });

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDate('');
  };

  // New handlers for modal
  const openOrderDetails = (order: Order) => {
    console.log('openOrderDetails called with order:', order);
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  // Transform selectedOrder to match OrderDetailsModalProps type
  const getModalOrder = () => {
    if (!selectedOrder) return null;
    // Convert address object to string if needed
    let addressString = 'Address not available';
    if (selectedOrder.address) {
      if (typeof selectedOrder.address === 'string') {
        addressString = selectedOrder.address;
      } else if (typeof selectedOrder.address === 'object' && selectedOrder.address !== null) {
        const addr = selectedOrder.address as { typedAddress?: string; mappedAddress?: string };
        addressString = addr.typedAddress ?? addr.mappedAddress ?? JSON.stringify(selectedOrder.address);
      }
    } else if (selectedOrder.customer && typeof selectedOrder.customer !== 'string' && 'address' in selectedOrder.customer) {
      const customerAddress = (selectedOrder.customer as { address?: any }).address;
      if (typeof customerAddress === 'string') {
        addressString = customerAddress;
      } else if (typeof customerAddress === 'object' && customerAddress !== null) {
        const addr = customerAddress as { typedAddress?: string; mappedAddress?: string };
        addressString = addr.typedAddress ?? addr.mappedAddress ?? JSON.stringify(customerAddress);
      }
    }
    return {
      id: selectedOrder.id,
      customer: typeof selectedOrder.customer === 'string' ? selectedOrder.customer : (selectedOrder.customer as { name?: string })?.name || 'N/A',
      address: addressString,
      items: selectedOrder.items?.map((item: any) => ({
        name: item.menuItem?.name || item.name || '',
        quantity: item.quantity,
        price: typeof item.totalPrice === 'number' ? item.totalPrice : 0,
        addons: item.addons?.map((addon: any) => ({
          name: addon.name,
          price: addon.price || 0,
        })) || [],
      })) || [],
      total: selectedOrder.total,
      timestamp: selectedOrder.date || 'Date not available',
    };
  };

  return (
    <div>
      {isLoading ? (
        <div>Loading order history...</div>
      ) : (
        <>
          <RecentOrdersTable
            orders={filteredOrders}
            searchQuery={searchQuery}
            selectedDate={selectedDate}
            onSearchChange={handleSearchChange}
            onDateChange={handleDateChange}
            onClearFilters={handleClearFilters}
            onOrderClick={openOrderDetails}
          />
          <OrderDetailsModal
            isOpen={isModalOpen}
            onClose={closeOrderDetails}
            order={getModalOrder()}
          />
        </>
      )}
    </div>
  );
};

export default OrderHistory;
