import { format, subDays, eachDayOfInterval } from 'date-fns';
import { ChartOptions } from 'chart.js';
import { AnalyticsData, Order } from '../types/analytics';

// Generate dummy data for charts
export const generateDummyData = (days: string | number) => {
  const endDate = new Date();
  const startDate = days === 'all' ? new Date(2020, 0, 1) : subDays(endDate, Number(days) - 1);
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

  return dateRange.map(date => ({
    date: format(date, 'MMM dd'),
    sales: Math.floor(Math.random() * 50000) + 10000,
    orders: Math.floor(Math.random() * 100) + 20,
    customers: Math.floor(Math.random() * 50) + 10,
  }));
};

export const generateDummyOrders = () => {
  const orders = [];
  const startDate = new Date(2020, 0, 1);
  const endDate = new Date();

  for (let i = 0; i < 50; i++) {
    const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
    orders.push({
      id: 123456 + i,
      customer: `Customer ${i + 1}`,
      items: '2× Pizza, 1× Pasta',
      total: Math.floor(Math.random() * 5000) + 1000,
      status: 'Completed',
      date: format(randomDate, 'MMM dd, yyyy'),
    });
  }
  return orders;
};

export const salesChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: '#1F2937',
      titleColor: '#F3F4F6',
      bodyColor: '#F3F4F6',
      titleMarginBottom: 8,
      padding: 12,
      cornerRadius: 8,
      usePointStyle: true,
    }
  },
  scales: {
    x: {
      grid: {
        display: false,
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: '#F3F4F6',
      },      ticks: {
        callback: function(tickValue: string | number) {
          const value = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
          return `₹${value.toLocaleString()}`;
        }
      }
    }
  }
};

export const ordersChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: '#1F2937',
      titleColor: '#F3F4F6',
      bodyColor: '#F3F4F6',
      titleMarginBottom: 8,
      padding: 12,
      cornerRadius: 8,
      usePointStyle: true,
    }
  },
  scales: {
    x: {
      grid: {
        display: false,
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: '#F3F4F6',
      },      ticks: {
        callback: function(tickValue: string | number) {
          return typeof tickValue === 'string' ? parseInt(tickValue, 10) : tickValue;
        }
      }
    }
  }
};

// New utility functions for filtering, grouping, and KPI calculations

export const filterOrdersByStatus = (orders: Order[], status: string): Order[] => {
  if (status === 'All') {
    return orders;
  }
  return orders.filter(order => order.status === status);
};

export const groupOrdersByDate = (orders: Order[]): { [date: string]: Order[] } => {
  return orders.reduce((grouped, order) => {
    const date = order.date;
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(order);
    return grouped;
  }, {} as { [date: string]: Order[] });
};

export const calculateKPIValues = (orders: Order[]) => {
  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  // Customer satisfaction not available in order data, set to null or static value
  const customerSatisfaction = null;

  return {
    totalSales,
    totalOrders,
    avgOrderValue,
    customerSatisfaction,
  };
};
