import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import OrdersHeader from './orders/OrdersHeader';
import OrderStatusTabs from './orders/OrderStatusTabs';
import OrderCard from './orders/OrderCard';
import CardGrid from './ui/CardGrid';
import LoadingSpinner from './ui/LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';
import { Order, OrderStatus } from '../types/orders';
import { format } from 'date-fns';
import api from '../utils/api';
import OrderDetailsModal from './orders/OrderDetailsModal';

const orderStates: OrderStatus[] = ['pending', 'preparing', 'ready'] as OrderStatus[];

interface OrderCardData {
  id: string;
  customer: string;
  address: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: OrderStatus;
  timestamp: string;
}

interface OrderWithStringAddress {
  id: string;
  customerName: string;
  customerId: string;
  customer: any;
  address: string;
  items: any[];
  total: number;
  status: OrderStatus;
  date: string;
  time: string;
  paymentType: 'COD' | 'ONLINE';
  paymentStatus?: string;
  customerNotes?: string;
  orderType: 'DELIVERY' | 'TAKEAWAY';
  restaurantId: string;
  deliveryPartnerId?: string;
  distance?: number;
  gst?: number;
  deliveryFee?: number;
  itemsAmount?: number;
  dpAcceptedAt?: string;
  dpDeliveredAt?: string;
  placedAt: string;
  restaurant?: {
    id: string;
    name: string;
  };
  deliveryPartner?: {
    id: string;
    name: string;
  };
}

interface OrdersProps {
  restaurantId: string;
}

const Orders: React.FC<OrdersProps> = ({ restaurantId }) => {
  const [activeTab, setActiveTab] = useState<OrderStatus>('pending');
  const [isOnline, setIsOnline] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<OrderWithStringAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithStringAddress | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let socket: Socket | null = null;

    const fetchInitialOrders = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/orders/restaurant/${restaurantId}`);
        const apiOrders = response.data.data;
        const mappedOrders = apiOrders.map((order: any) => {
          // Convert address object to string if needed
          let addressString = 'Address not available';
          if (order.customer?.address) {
            if (typeof order.customer.address === 'string') {
              addressString = order.customer.address;
            } else if (typeof order.customer.address === 'object') {
              const addr = order.customer.address as { typedAddress?: string; mappedAddress?: string };
              addressString = addr.typedAddress || addr.mappedAddress || JSON.stringify(order.customer.address);
            }
          }
          return {
            id: order.id,
            customerName: order.customer?.name || 'Unknown Customer',
            address: addressString,
            items: order.items || [],
            total: parseFloat(order.totalAmount) || order.total || order.items?.reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0) || 0,
            status: order.status || 'pending',
            date: format(new Date(order.placedAt), 'MMM dd, yyyy'),
            time: format(new Date(order.placedAt), 'hh:mm a'),
            customerNotes: order.customerNotes,
            paymentType: order.paymentType,
            paymentStatus: order.paymentStatus,
            orderType: order.orderType,
            restaurantId: order.restaurantId,
            deliveryPartnerId: order.deliveryPartnerId,
            distance: order.distance,
            gst: order.gst,
            deliveryFee: order.deliveryFee,
            itemsAmount: order.itemsAmount,
            dpAcceptedAt: order.dpAcceptedAt,
            dpDeliveredAt: order.dpDeliveredAt,
            customerId: order.customerId,
            placedAt: order.placedAt,
            restaurant: order.restaurant,
            customer: order.customer,
            deliveryPartner: order.deliveryPartner,
          };
        });
        setOrders(mappedOrders);
      } catch (error) {
        toast.error('Failed to fetch orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialOrders();

    socket = io('http://localhost:3000');

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
    });

    socket.on('order:new', (newOrder: Order) => {
      setOrders(prevOrders => {
        if (prevOrders.some(order => order.id === newOrder.id)) {
          return prevOrders;
        }
        // Convert newOrder to OrderWithStringAddress
        let addressString = 'Address not available';
        if (newOrder.customer?.address) {
          if (typeof newOrder.customer.address === 'string') {
            addressString = newOrder.customer.address;
          } else if (typeof newOrder.customer.address === 'object') {
            const addr = newOrder.customer.address as { typedAddress?: string; mappedAddress?: string };
            addressString = addr.typedAddress || addr.mappedAddress || JSON.stringify(newOrder.customer.address);
          }
        }
        const formattedOrder: OrderWithStringAddress = {
          ...newOrder,
          status: newOrder.status || 'pending',
          date: format(new Date(newOrder.placedAt || Date.now()), 'MMM dd, yyyy'),
          time: format(new Date(newOrder.placedAt || Date.now()), 'hh:mm a'),
          customerName: newOrder.customer?.name || 'Unknown Customer',
          address: addressString,
        };
        toast.success('New order received!');
        return [...prevOrders, formattedOrder];
      });
    });

socket.on('order:update', (orderUpdate: Order) => {
  setOrders(prevOrders => {
    const index = prevOrders.findIndex(order => order.id === orderUpdate.id);
    if (index !== -1) {
      // Convert orderUpdate to OrderWithStringAddress
      let addressString = 'Address not available';
      if (orderUpdate.customer?.address) {
        if (typeof orderUpdate.customer.address === 'string') {
          addressString = orderUpdate.customer.address;
        } else if (typeof orderUpdate.customer.address === 'object') {
          const addr = orderUpdate.customer.address as { typedAddress?: string; mappedAddress?: string };
          addressString = addr.typedAddress || addr.mappedAddress || JSON.stringify(orderUpdate.customer.address);
        }
      }
      const formattedOrderUpdate: OrderWithStringAddress = {
        ...orderUpdate,
        address: addressString,
        customerName: orderUpdate.customer?.name || 'Unknown Customer',
        date: prevOrders[index].date,
        time: prevOrders[index].time,
      };
      return prevOrders.map(order =>
        order.id === orderUpdate.id
          ? formattedOrderUpdate
          : order
      );
    }
    return prevOrders;
  });
});

    socket.on('disconnect', () => {
      // toast.error('Lost connection to server');
    });

    socket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
      toast.error('Connection error');
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [restaurantId]);

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'pending') {
      return order.status === 'pending' &&
        (searchQuery === '' ||
         order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
         order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
         order.items.some((item: any) => item.menuItem?.name.toLowerCase().includes(searchQuery.toLowerCase())));
    }
    return order.status === activeTab &&
      (searchQuery === '' ||
       order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
       order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
       order.items.some((item: any) => item.menuItem?.name.toLowerCase().includes(searchQuery.toLowerCase())));
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      if (newStatus === 'dispatch') {
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
        toast.success('Order dispatched and moved to history');
      } else {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        toast.success(`Order updated to ${newStatus}`);
      }
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'preparing' });
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: 'preparing' } : order
        )
      );
      toast.success('Order approved and moved to preparing');
    } catch (error) {
      toast.error('Failed to approve order');
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'rejected' });
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      toast.error('Order rejected');
    } catch (error) {
      toast.error('Failed to reject order');
    }
  };

const orderToCardData = (order: OrderWithStringAddress): OrderCardData => {
  const items = order.items.map((item: any) => ({
    name: item.menuItem?.name || 'Unknown',
    quantity: item.quantity || 0,
    price: Number(item.basePrice) || 0,
    addons: item.addons?.map((addon: any) => ({
      name: addon.name,
      price: Number(addon.extraPrice) || 0,
    })) || [],
  }));

  // Calculate total including add-ons, delivery fee, and gst
  const itemsTotal = items.reduce((sum, item) => {
    const addonsTotal = item.addons.reduce((addonSum: number, addon: { price: number }) => addonSum + addon.price, 0);
    return sum + item.price * item.quantity + addonsTotal * item.quantity;
  }, 0);

  const deliveryFee = Number(order.deliveryFee) || 0;
  const gst = Number(order.gst) || 0;

  const total = itemsTotal + deliveryFee + gst;

  return {
    id: order.id,
    customer: order.customerName || 'Unknown Customer',
    address: order.address || order.customer?.address || 'Address not available',
    items,
    total,
    status: order.status,
    timestamp: order.date && order.time ? `${order.date} ${order.time}` : 'Date not available',
  };
};

  const openOrderDetails = (order: OrderWithStringAddress) => {
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
    // Map items and addons properly for modal
    const items = selectedOrder.items.map((item: any) => ({
      name: item.menuItem?.name || 'Unknown',
      quantity: item.quantity || 0,
      price: Number(item.basePrice) || 0,
      addons: item.addons?.map((addon: any) => ({
        name: addon.name,
        price: Number(addon.extraPrice) || Number(addon.price) || 0,
      })) || [],
    }));

    // Calculate total including add-ons, delivery fee, and gst
    const itemsTotal = items.reduce((sum, item) => {
      const addonsTotal = item.addons.reduce((addonSum: number, addon: { price: number }) => addonSum + addon.price, 0);
      return sum + item.price * item.quantity + addonsTotal * item.quantity;
    }, 0);

    const deliveryFee = Number(selectedOrder.deliveryFee) || 0;
    const gst = Number(selectedOrder.gst) || 0;

    const total = itemsTotal + deliveryFee + gst;

    // Convert address object to string if needed
    let addressString = 'Address not available';
    if (selectedOrder.address) {
      if (typeof selectedOrder.address === 'string') {
        addressString = selectedOrder.address;
      } else if (typeof selectedOrder.address === 'object') {
        const addr = selectedOrder.address as { typedAddress?: string; mappedAddress?: string };
        addressString = addr.typedAddress || addr.mappedAddress || JSON.stringify(selectedOrder.address);
      }
    } else if (selectedOrder.customer?.address) {
      if (typeof selectedOrder.customer.address === 'string') {
        addressString = selectedOrder.customer.address;
      } else if (typeof selectedOrder.customer.address === 'object') {
        const addr = selectedOrder.customer.address as { typedAddress?: string; mappedAddress?: string };
        addressString = addr.typedAddress || addr.mappedAddress || JSON.stringify(selectedOrder.customer.address);
      }
    }
    return {
      id: selectedOrder.id,
      customer: selectedOrder.customer.name,
      address: addressString,
      items,
      total,
      timestamp: selectedOrder.date && selectedOrder.time ? `${selectedOrder.date} ${selectedOrder.time}` : 'Date not available',
    };
  };

  return (
    <ErrorBoundary>
      <div className="responsive-container px-4">
        <OrdersHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          restaurantId={restaurantId}
        />
        <div className="pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 sm:mt-14"
          >
            <OrderStatusTabs
              orderStates={orderStates}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </motion.div>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <CardGrid columns={{ sm: 1, lg: 2, xl: 3 }}>
              {filteredOrders.map((order) => (
                <div key={order.id} onClick={() => openOrderDetails(order)} className="cursor-pointer">
                  <OrderCard
                    order={orderToCardData(order)}
                    activeTab={activeTab}
                    onApprove={() => handleApproveOrder(order.id)}
                    onReject={() => handleRejectOrder(order.id)}
                    onStatusChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                  />
                </div>
              ))}
            </CardGrid>
          )}
        </div>
        <OrderDetailsModal
          isOpen={isModalOpen}
          onClose={closeOrderDetails}
          order={getModalOrder()}
        />
      </div>
    </ErrorBoundary>
  );
};

export default Orders;
