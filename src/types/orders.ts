export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'dispatch' | 'delivered' | 'cancelled' | 'rejected';

export interface Addon {
  name: string;
  isAvailable?: boolean;
  extraPrice: number;
}

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  basePrice: number;
  totalPrice: number;
  addons?: Addon[];
}

export interface Customer {
  name: string;
  address?: string;
}

export interface Address {
  typedAddress: string;
  latitude: number;
  longitude: number;
  mappedAddress: string;
  areaId: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerId: string;
  customer: Customer;
  address?: Address;
  items: OrderItem[];
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
