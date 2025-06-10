import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Order } from '../../types/analytics';
import { Calendar } from 'lucide-react';
import OrdersHeader from '../orders/OrdersHeader';
import Card from '../ui/Card';
import OrderHistoryCard from '../orders/OrderHistoryCard';
import { AnimatePresence } from 'framer-motion';

interface RecentOrdersTableProps {
  orders: Order[];
  searchQuery: string;
  selectedDate: string;
  onSearchChange: (query: string) => void;
  onDateChange: (date: string) => void;
  onClearFilters: () => void;
  onOrderClick?: (order: Order) => void;

  // Loading states for buttons
  isSearchLoading?: boolean;
  isDateLoading?: boolean;
  isClearLoading?: boolean;
  isOrderClickLoading?: boolean;
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options);
};

const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({
  orders,
  searchQuery,
  selectedDate,
  onSearchChange,
  onDateChange,
  onClearFilters,
  onOrderClick,
  isSearchLoading = false,
  isDateLoading = false,
  isClearLoading = false,
  isOrderClickLoading = false,
}) => {
  const [isSticky, setIsSticky] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(window.scrollY);
  const [date, setDate] = useState<Date | null>(selectedDate ? new Date(selectedDate) : null);

  React.useEffect(() => {
    if (selectedDate) {
      setDate(new Date(selectedDate));
    } else {
      setDate(null);
    }
  }, [selectedDate]);

  // CustomInput component for react-datepicker with forwarded ref
  const CustomInput = React.forwardRef<HTMLButtonElement, React.HTMLProps<HTMLButtonElement>>(
    (props, ref) => {
      const { onClick, type, ...rest } = props;
      return (
        <button
          type="button"
          {...rest}
          ref={ref}
          onClick={(e) => {
            console.log('Calendar button clicked');
            onClick?.(e);
          }}
          className="w-full py-2 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent flex justify-center items-center"
        >
          <Calendar className="h-5 w-5" />
        </button>
      );
    }
  );

  // Helper function to safely convert address object to string
  const getAddressString = (address: any): string => {
    if (!address) return '';
    if (typeof address === 'string') return address;
    return address.typedAddress || address.mappedAddress || '';
  };

  // Helper function to safely convert customer object to string
  const getCustomerString = (customer: any): string => {
    if (!customer) return 'N/A';
    if (typeof customer === 'string') return customer;
    if (customer.name && typeof customer.name === 'string') return customer.name;
    return 'N/A';
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!barRef.current) return;
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > barRef.current.offsetTop) {
        if (!isSticky) setIsSticky(true);
      } else if (currentScrollY < lastScrollY.current) {
        if (isSticky) setIsSticky(false);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSticky]);

  const sortedOrders = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      <div
        ref={barRef}
        className={`bg-white px-4 py-3 mb-6 z-10 ${
          isSticky ? 'fixed top-0 left-0 right-0 shadow-md border-b border-gray-200' : ''
        }`}
      >
        <div className="flex items-center gap-4 max-w-full mx-auto w-full overflow-hidden">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={isSearchLoading}
            className="px-6 py-3 flex-grow min-w-0 max-w-full sm:max-w-[400px] rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
          />
          {/* <div className="relative max-w-[140px] flex-shrink-0">
            <DatePicker
              selected={date}
              onChange={(date: Date | null, event?: React.SyntheticEvent<any, Event>) => {
                console.log('Date selected:', date); // Debug log
                setDate(date);
                if (date) {
                  onDateChange(date.toISOString().split('T')[0]);
                } else {
                  onDateChange('');
                }
              }}
              customInput={<CustomInput />}
              popperClassName="z-50"
              disabled={isDateLoading}
            />
          </div> */}
          <button
            onClick={onClearFilters}
            disabled={isClearLoading}
            aria-label="Clear filters"
            className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-gray-600 hover:text-gray-800 rounded border border-gray-300 hover:border-gray-500 disabled:opacity-50"
          >
            ×
          </button>
        </div>
      </div>

      <div className="space-y-6 mt-2">
        <AnimatePresence>
          {sortedOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => {
                if (isOrderClickLoading) return;
                onOrderClick && onOrderClick(order);
              }}
              className={`cursor-pointer ${isOrderClickLoading ? 'pointer-events-none opacity-50' : ''}`}
            >
              <OrderHistoryCard
                order={{
                  id: order.id,
                  customer: getCustomerString(order.customer),
                  address: (() => {
                    const fullAddress = getAddressString(order.address);
                    if (fullAddress.length > 10) {
                      return fullAddress.slice(0, 10) + '...';
                    }
                    return fullAddress;
                  })(),
                  items: order.items?.map((item) => ({
                    name: item.menuItem?.name || item.menuItemId,
                    quantity: item.quantity,
                    price: typeof item.totalPrice === 'number' ? item.totalPrice : 0,
                  })) || [],
                  total: order.total,
                  status: order.status,
                  timestamp: formatDate(order.date),
                }}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RecentOrdersTable;