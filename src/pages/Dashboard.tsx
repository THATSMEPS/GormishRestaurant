import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Orders from '../components/Orders';
import Menu from './Menu';
import Analytics from './Analytics';
import Profile from './Profile';
import DashboardLayout from '../components/layouts/DashboardLayout';
import api from '../utils/api';
import { Restaurant } from '../types/Restaurant';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken') || window.authToken;
        console.log('[Dashboard] Checking auth with token:', token);
        if (!token) {
          console.log('[Dashboard] No token found, redirecting to login');
          navigate('/', { replace: true });
          return;
        }

        // Validate stored restaurant data
        const storedRestaurant = localStorage.getItem('restaurant');
        let parsedRestaurant: Restaurant | null = null;
        if (storedRestaurant) {
          try {
            parsedRestaurant = JSON.parse(storedRestaurant);
          } catch (e) {
            console.error('[Dashboard] Invalid restaurant data in localStorage:', e);
            localStorage.removeItem('restaurant');
          }
        }

        // Fetch restaurant data
        const response = await api.get('/restaurants/me');
        console.log('[Dashboard] Fetched restaurant data:', response.data);
        const restaurantData = response.data.data;
        if (!restaurantData || !restaurantData.id) {
          console.error('[Dashboard] restaurantId is undefined in response');
          toast.error('Invalid restaurant data received.');
          navigate('/', { replace: true });
          return;
        }
        setRestaurant(restaurantData);
        localStorage.setItem('restaurantId', restaurantData.id);
        localStorage.setItem('restaurant', JSON.stringify(restaurantData));
        localStorage.setItem('isLoggedIn', 'true');
        // For frontend testing, force approval to true
        response.data.approval = true;
        // Commenting out approval check to always navigate to dashboard
        // if (!response.data.approval) {
        //   console.log('[Dashboard] Restaurant not approved, redirecting to /approval-pending');
        //   navigate('/approval-pending', { replace: true });
        // }
      } catch (error: any) {
        console.error('[Dashboard] Error fetching restaurant:', error);
        const message = error.response?.status === 401
          ? 'Session expired. Please log in again.'
          : 'Failed to load dashboard. Please try again later.';
        toast.error(message);
        localStorage.removeItem('authToken');
        localStorage.removeItem('restaurantId');
        localStorage.removeItem('restaurant');
        window.authToken = undefined;
        navigate('/', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!restaurant) {
    return <Navigate to="/" replace />;
  }

  console.log('[Dashboard] Rendering with restaurantId:', restaurant.id);
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Orders restaurantId={restaurant.id} />} />
        <Route path="/menu" element={<Menu restaurantId={restaurant.id} />} />
        <Route path="/analytics" element={<Analytics restaurantId={restaurant.id} />} />
        <Route path="/profile" element={<Profile restaurant={restaurant} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;