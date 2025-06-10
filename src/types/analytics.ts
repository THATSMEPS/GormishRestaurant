import { LucideIcon } from 'lucide-react';
import { ChartData, ChartOptions } from 'chart.js';
import { OrderItem as BaseOrderItem } from './orders';

export interface OrderItem extends BaseOrderItem {
  menuItem?: {
    name: string;
  };
}

export interface AnalyticsData {
  date: string;
  sales: number;
  orders: number;
}

export interface Order {
  id: string;
  customer: string;
  address?: string;
  items: OrderItem[];
  total: number;
  date: string;
  time: string;
  status: 'dispatch' | 'delivered';
  customerNotes?: string;
  paymentType?: 'COD' | 'ONLINE';
  orderType?: 'DELIVERY' | 'TAKEAWAY';
}

export interface DateRange {
  value: string;
  label: string;
}

export interface MetricCard {
  title: string;
  value: string | number;
  icon: LucideIcon;
}

export type SalesChartData = ChartData<'line'>;
export type OrdersChartData = ChartData<'bar'>;
export type ChartOptionsType = ChartOptions;
