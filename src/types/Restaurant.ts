export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OperatingHours {
  open: string;
  close: string;
  isOpen: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  email: string;
  mobile: string;
  description?: string;
  cuisines: string[];
  vegNonveg: 'veg' | 'nonveg' | 'both';
  hours: {
    Monday: OperatingHours;
    Tuesday: OperatingHours;
    Wednesday: OperatingHours;
    Thursday: OperatingHours;
    Friday: OperatingHours;
    Saturday: OperatingHours;
    Sunday: OperatingHours;
  };
  address: Address;
  banners: string[];
  applicableTaxBracket: number;
  areaId: string;
  approval: boolean;
  servingRadius?: number;
  restaurantType?: string;
  website?: string;
  gstNumber?: string;
  fssaiNumber?: string;
}

export interface AuthResponseData {
  restaurant: Restaurant;
  token: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: AuthResponseData;
}
