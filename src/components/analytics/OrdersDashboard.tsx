import React, { useState, useEffect } from 'react';
import RecentOrdersTable from './RecentOrdersTable';
import { Order } from '../../types/analytics';

interface OrdersDashboardProps {
  initialOrders: Order[];
}

const OrdersDashboard: React.FC<OrdersDashboardProps> = ({ initialOrders }) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Filter orders based on search query and selected date
  const filteredOrders = orders.filter((order) => {
    const lowerSearch = searchQuery.toLowerCase().trim();
    const customerStr = order.customer ? order.customer.toLowerCase() : '';
    const idStr = order.id ? order.id.toLowerCase() : '';
    const addressStr = order.address ? order.address.toLowerCase() : '';
    const itemsStr = order.items ? order.items.map(item => (item.menuItem?.name || '').toLowerCase()).join(' ') : '';

    const matchesSearch =
      searchQuery === '' ||
      customerStr.includes(lowerSearch) ||
      idStr.includes(lowerSearch) ||
      addressStr.includes(lowerSearch) ||
      itemsStr.includes(lowerSearch);

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

  return (
    <RecentOrdersTable
      orders={filteredOrders}
      searchQuery={searchQuery}
      selectedDate={selectedDate}
      onSearchChange={handleSearchChange}
      onDateChange={handleDateChange}
      onClearFilters={handleClearFilters}
    />
  );
};

export default OrdersDashboard;
