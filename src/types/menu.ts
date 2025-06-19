export interface Addon {
  name: string;
  extraPrice: number;
  available: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  discountedPrice?: number | null;
  isVeg: boolean;
  packagingCharges: number;
  cuisine: string;
  restaurantId: string;
  addons?: {
    name: string;
    extraPrice: number;
    available: boolean;
  }[];
  isAvailable: boolean;
}

export interface FormData {
  name: string;
  description: string;
  price: number;
  discountedPrice?: number | null;
  gstCategory: string;
  isAvailable: boolean;
  addons: {
    name: string;
    extraPrice: number;
    available: boolean;
  }[];
  isVeg: boolean;
  packagingCharges: number;
  cuisine: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  detail?: string;
}

export interface GstCategory {
  value: string;
  label: string;
}
