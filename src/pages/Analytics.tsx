import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { format, eachDayOfInterval, subDays } from 'date-fns';
import { TrendingUp, Users, ShoppingBag, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

// Import components
import Header from '../components/analytics/Header';
import MetricsCard from '../components/analytics/MetricsCard';
import SalesChart from '../components/analytics/SalesChart';
import OrdersChart from '../components/analytics/OrdersChart';
import RecentOrdersTable from '../components/analytics/RecentOrdersTable';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';
import api from '../utils/api';

// Import utils and types
import { salesChartOptions, ordersChartOptions, filterOrdersByStatus, groupOrdersByDate, calculateKPIValues } from '../utils/analytics';
import { AnalyticsData, Order, DateRange, MetricCard, SalesChartData, OrdersChartData } from '../types/analytics';

interface AnalyticsProps {
  restaurantId: string;
}

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const dateRangeOptions: DateRange[] = [
  { value: '7', label: 'Last 7 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: '90', label: 'Last 90 Days' },
  { value: '365', label: 'Last Year' },
  { value: 'all', label: 'All Time' },
];

import OrderDetailsModal from '../components/orders/OrderDetailsModal';

const Analytics: React.FC<AnalyticsProps> = ({ restaurantId }) => {
  const [selectedRange, setSelectedRange] = useState<DateRange>(dateRangeOptions[0]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  // Remove statusFilter state as it's not needed for order history filtering
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Loading states for button clicks
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isDateLoading, setIsDateLoading] = useState(false);
  const [isClearLoading, setIsClearLoading] = useState(false);
  const [isOrderClickLoading, setIsOrderClickLoading] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
  const fetchOrders = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const response = await api.get(`/orders/restaurant/${restaurantId}/history`);
    console.log('Orders API response data:', response.data);
    const dispatchedOrders = response.data.data;
    const mappedOrders = dispatchedOrders.map((order: any) => ({
          id: order.id,
          date: format(new Date(order.placedAt), 'MMM dd, yyyy'),
          time: format(new Date(order.placedAt), 'hh:mm a'),
          customer: order.customer?.name || 'Unknown',
          address: order.customer?.address || 'Address not available',
          total: parseFloat(order.totalAmount) || 0,
          status: order.status,
          items: order.items?.map((item: any) => {
            const basePriceNum = typeof item.basePrice === 'string' ? parseFloat(item.basePrice) : item.basePrice;
            const totalPriceNum = typeof item.totalPrice === 'string' ? parseFloat(item.totalPrice) : item.totalPrice;
            const addons = item.addons?.map((addon: any) => ({
              ...addon,
              price: typeof addon.extraPrice === 'string' ? parseFloat(addon.extraPrice) : addon.extraPrice || 0,
            })) || [];
            const calculatedTotalPrice = totalPriceNum && totalPriceNum > 0
              ? totalPriceNum
              : (basePriceNum * item.quantity) + addons.reduce((sum: number, a: any) => sum + a.price, 0);
            return {
              ...item,
              totalPrice: calculatedTotalPrice,
              addons,
            };
          }) || [],
          customerNotes: order.customerNotes,
          paymentType: order.paymentType,
          orderType: order.orderType,
        }));
    setOrders(mappedOrders);
  } catch (err) {
    setError('Failed to load orders');
    toast.error('Failed to load orders');
  } finally {
    setIsLoading(false);
  }
};


    fetchOrders();
  }, [restaurantId]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setIsSearchLoading(false);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    const filterOrders = () => {
      return orders.filter(order => {
        const searchLower = debouncedSearchQuery.toLowerCase();
        const matchesIdOrCustomer =
          order.id.toString().includes(debouncedSearchQuery) ||
          order.customer.toLowerCase().includes(searchLower);
        const matchesItemName = order.items?.some(item => {
          const itemName = item.menuItem?.name || '';
          return itemName.toLowerCase().includes(searchLower);
        }) ?? false;
        const matchesSearch = matchesIdOrCustomer || matchesItemName;
        const matchesDate = selectedDate ? format(new Date(selectedDate), 'MMM dd, yyyy') === order.date : true;
        return matchesSearch && matchesDate;
      });
    };

    setFilteredOrders(filterOrders());
  }, [debouncedSearchQuery, selectedDate, orders]);

  const handleClearFilters = () => {
    setIsClearLoading(true);
    setSearchQuery('');
    setSelectedDate('');
    setIsClearLoading(false);
  };

  const filteredDispatchedOrders = orders.filter(order => {
    if (selectedRange.value === 'all') return true;
    const days = parseInt(selectedRange.value);
    const orderDate = new Date(order.date);
    const cutoffDate = subDays(new Date(), days - 1);
    return orderDate >= cutoffDate;
  });

  // Calculate KPIs from filtered dispatched orders
  const {
    totalSales,
    totalOrders,
    avgOrderValue,
    customerSatisfaction: rawCustomerSatisfaction,
  } =  calculateKPIValues(filteredDispatchedOrders);

  const customerSatisfaction = rawCustomerSatisfaction ?? 0;

  // Group dispatched orders by date for charts
  const groupedOrders = groupOrdersByDate(filteredDispatchedOrders);
  const lastDays = selectedRange.value === 'all' 
  ? eachDayOfInterval({ start: new Date(2020, 0, 1), end: new Date() }) 
  : eachDayOfInterval({ start: subDays(new Date(), parseInt(selectedRange.value) - 1), end: new Date() });
  const lastDaysFormatted = lastDays.map(date => format(date, 'MMM dd, yyyy'));

  const salesData = lastDaysFormatted.map(date => {
    const ordersForDate = groupedOrders[date] || [];
    return ordersForDate.reduce((sum, order) => sum + order.total, 0);
  });

  const ordersData = lastDaysFormatted.map(date => {
    const ordersForDate = groupedOrders[date] || [];
    return ordersForDate.length;
  });

  const salesChartData: SalesChartData = {
    labels: lastDaysFormatted,
    datasets: [
      {
        label: 'Sales',
        data: salesData,
        borderColor: '#6552FF',
        backgroundColor: 'rgba(101, 82, 255, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const ordersChartData: OrdersChartData = {
    labels: lastDaysFormatted,
    datasets: [
      {
        label: 'Orders',
        data: ordersData,
        backgroundColor: '#6552FF',
        borderRadius: 6,
      },
    ],
  };

  // Handlers for modal
  const openOrderDetails = (order: Order) => {
    setIsOrderClickLoading(true);
    setSelectedOrder(order);
    setIsModalOpen(true);
    setIsOrderClickLoading(false);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  // Transform selectedOrder to match OrderDetailsModalProps type
  const getModalOrder = () => {
    if (!selectedOrder) return null;
    let addressString = 'Address not available';
    if (selectedOrder.address) {
      if (typeof selectedOrder.address === 'string') {
        addressString = selectedOrder.address;
      } else if (typeof selectedOrder.address === 'object' && selectedOrder.address !== null) {
        const addr = selectedOrder.address as { typedAddress?: string; mappedAddress?: string };
        addressString = addr.typedAddress ?? addr.mappedAddress ?? JSON.stringify(selectedOrder.address);
      }
    }
    return {
      id: selectedOrder.id,
      customer: selectedOrder.customer || 'N/A',
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

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-medium">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto pb-12 px-4"
      >
        <Header
          selectedRange={selectedRange}
          onRangeChange={setSelectedRange}
          isLoading={isLoading}
        />

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                {
                  title: 'Total Sales',
                  value: `₹${totalSales.toLocaleString()}`,
                  icon: TrendingUp,
                },
                {
                  title: 'Total Orders',
                  value: totalOrders,
                  icon: ShoppingBag,
                },
                {
                  title: 'Avg. Order Value',
                  value: `₹${avgOrderValue.toFixed(2)}`,
                  icon: Users,
                },
                {
                  title: 'Customer Satisfaction',
                  value: `${customerSatisfaction.toFixed(2)}/5`,
                  icon: Star,
                },
              ].map((metric, index) => (
                <MetricsCard
                  key={metric.title}
                  title={metric.title}
                  value={metric.value}
                  icon={metric.icon}
                  index={index}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Sales Overview</h2>
                <SalesChart data={salesChartData} options={salesChartOptions} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Orders Overview</h2>
                <OrdersChart data={ordersChartData} options={ordersChartOptions} />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <RecentOrdersTable
                orders={filteredOrders}
                searchQuery={searchQuery}
                selectedDate={selectedDate}
                onSearchChange={(query) => {
                  setIsSearchLoading(true);
                  setSearchQuery(query);
                }}
                onDateChange={(date) => {
                  setIsDateLoading(true);
                  setSelectedDate(date);
                  setIsDateLoading(false);
                }}
                onClearFilters={handleClearFilters}
                onOrderClick={(order) => {
                  setIsOrderClickLoading(true);
                  openOrderDetails(order);
                  setIsOrderClickLoading(false);
                }}
                isSearchLoading={isSearchLoading}
                isDateLoading={isDateLoading}
                isClearLoading={isClearLoading}
                isOrderClickLoading={isOrderClickLoading}
              />
              <OrderDetailsModal
                isOpen={isModalOpen}
                onClose={closeOrderDetails}
                order={getModalOrder()}
              />
            </motion.div>
          </>
        )}
      </motion.div>
    </ErrorBoundary>
  );
};

export default Analytics;
