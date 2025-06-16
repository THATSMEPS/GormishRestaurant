import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../components/layouts/AuthLayout';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import Button from '../components/ui/Button';
import api, { uploadBannerImage, uploadBannerImageSignup } from '../utils/api';
import { AuthResponse, Restaurant } from '../types/Restaurant';

// Add these types at the top of the file
declare global {
  interface Window {
    authToken?: string;
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

interface Area {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

import { useLocation } from 'react-router-dom';

const AuthPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tokenFromUrl = queryParams.get('token');

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState({
    street: '',
    landmark: '',
    area: '',
    fullAddress: ''
  });
  
  const [serving_radius, setserving_radius] = useState('');
  const [cuisines, setCuisines] = useState<{ value: string; label: string }[]>([]);
  const [vegNonVeg, setVegNonVeg] = useState<string>('both');
  const [banners, setBanners] = useState<File[]>([]);
  const [hours, setHours] = useState<Record<string, { open: string; close: string; isOpen: boolean }>>({
    Monday: { open: "09:00", close: "22:00", isOpen: true },
    Tuesday: { open: "09:00", close: "22:00", isOpen: true },
    Wednesday: { open: "09:00", close: "22:00", isOpen: true },
    Thursday: { open: "09:00", close: "22:00", isOpen: true },
    Friday: { open: "09:00", close: "22:00", isOpen: true },
    Saturday: { open: "09:00", close: "22:00", isOpen: true },
    Sunday: { open: "09:00", close: "22:00", isOpen: true }
  });
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [selectedAreaCoordinates, setSelectedAreaCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const saved = localStorage.getItem('isLoggedIn');
    return saved ? JSON.parse(saved) : false;
  });
  const [token, setToken] = useState<string | null>(() => {
    const saved = localStorage.getItem('authToken');
    return saved ? saved : null;
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  // Load signup form state from localStorage on mount
  useEffect(() => {
    const savedSignupState = localStorage.getItem('signupFormState');
    if (savedSignupState) {
      const parsed = JSON.parse(savedSignupState);
      setRestaurantName(parsed.restaurantName || '');
      setSignupEmail(parsed.signupEmail || '');
      setSignupPassword(parsed.signupPassword || '');
      setMobileNumber(parsed.mobileNumber || '');
      
      setAddress(parsed.address || { street: '', landmark: '', area: '', fullAddress: '' });
      setserving_radius(parsed.serving_radius || '');
      setCuisines(parsed.cuisines || []);
      setVegNonVeg(parsed.vegNonVeg || 'both');
      setBanners(parsed.banners || []);
      setHours(parsed.hours || {
        Monday: { open: "09:00", close: "22:00", isOpen: true },
        Tuesday: { open: "09:00", close: "22:00", isOpen: true },
        Wednesday: { open: "09:00", close: "22:00", isOpen: true },
        Thursday: { open: "09:00", close: "22:00", isOpen: true },
        Friday: { open: "09:00", close: "22:00", isOpen: true },
        Saturday: { open: "09:00", close: "22:00", isOpen: true },
        Sunday: { open: "09:00", close: "22:00", isOpen: true }
      });
      setSelectedAreaId(parsed.selectedAreaId || '');
    }
  }, []);

  // Save signup form state to localStorage on change
  useEffect(() => {
    const signupState = {
      restaurantName,
      signupEmail,
      signupPassword,
      mobileNumber,
      address,
      serving_radius,
      cuisines,
      vegNonVeg,
      banners,
      hours,
      selectedAreaId
    };
    localStorage.setItem('signupFormState', JSON.stringify(signupState));
  }, [restaurantName, signupEmail, signupPassword, mobileNumber, address, serving_radius, cuisines, vegNonVeg, banners, hours, selectedAreaId]);

  // On mount, check for verification token in URL and switch to signup mode if present
  useEffect(() => {
    if (tokenFromUrl) {
      setIsLogin(false);
      setVerificationToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  // Clear signup form state on successful signup or logout
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.removeItem('signupFormState');
    }
  }, [isLoggedIn]);

  // Fetch areas on component mount
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await api.get('/areas');
        // Map API response to Area[] with id, name, latitude, longitude
        const mappedAreas: Area[] = response.data.data.map((area: any) => ({
          id: area.id,
          name: area.areaName,
          latitude: area.latitude,
          longitude: area.longitude
        }));
        setAreas(mappedAreas);
        if (mappedAreas.length > 0) {
          const defaultArea = mappedAreas.find(area => area.name === 'Kudasan') || mappedAreas[0];
          setSelectedAreaId(defaultArea.id);
          setAddress(prev => ({ ...prev, area: defaultArea.name }));
          setSelectedAreaCoordinates({
            latitude: defaultArea.latitude,
            longitude: defaultArea.longitude
          });
        }
      } catch (error) {
        console.error('[AuthPage] Failed to fetch areas:', error);
        toast.error('Failed to load areas');
      }
    };
    fetchAreas();
  }, []);

  useEffect(() => {
    const selectedArea = areas.find(area => area.id === selectedAreaId);
    if (selectedArea) {
      setSelectedAreaCoordinates({
        latitude: selectedArea.latitude,
        longitude: selectedArea.longitude
      });
      setAddress(prev => ({ ...prev, area: selectedArea.name }));
    }
  }, [selectedAreaId, areas]);

  // Persist state to localStorage
  useEffect(() => {
    if (!isLoggingOut) {
      localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
      if (token) {
        localStorage.setItem('authToken', token); // Store as plain string
      } else {
        localStorage.removeItem('authToken');
      }
      console.log('[AuthPage] Persisted state to localStorage:', { isLoggedIn, token });
    }
  }, [isLoggedIn, token, isLoggingOut]);

  // Handle auto-login with injected token
  useEffect(() => {
    console.log('[AuthPage] Component mounted');

    const handleAuthToken = async () => {
      console.log('[AuthPage] handleAuthToken called');
      const storedToken = window.authToken;
      console.log('[AuthPage] Received injected token for auto-login:', storedToken);
      if (isLoggingOut) {
        console.log('[AuthPage] Skipping auto-login due to logout in progress');
        // Always navigate to login page if logging out
        navigate('/', { replace: true });
        return;
      }
      if (storedToken && !isLoggedIn) {
        try {
          // Verify token by fetching restaurant profile
          const response = await api.get<Restaurant>('/restaurants/me', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          setToken(storedToken);
          setIsLoggedIn(true);
          localStorage.setItem('authToken', storedToken);
          localStorage.setItem('restaurantId', response.data.id);
          localStorage.setItem('restaurant', JSON.stringify(response.data));
          toast.success('Auto-logged in successfully!');
          navigate(response.data.approval ? '/dashboard' : '/approval-pending', { replace: true });
        } catch (error) {
          console.error('[AuthPage] Auto-login failed:', error);
          toast.error('Auto-login failed');
          navigate('/', { replace: true });
        }
      } else if (!storedToken) {
        console.log('[AuthPage] No token found for auto-login');
      } else {
        console.log('[AuthPage] Already logged in, skipping auto-login');
      }
    };

    if (window.authToken) {
      console.log('[AuthPage] Token found on mount:', window.authToken);
      handleAuthToken();
    }

    console.log('[AuthPage] Adding event listener for authTokenReady');
    window.addEventListener('authTokenReady', handleAuthToken);

    return () => {
      console.log('[AuthPage] Cleaning up');
      window.removeEventListener('authTokenReady', handleAuthToken);
    };
  }, [navigate, isLoggedIn, isLoggingOut]);

  // Ensure navigation to dashboard if already logged in, but not during logout
  useEffect(() => {
    console.log('[AuthPage] isLoggedIn state updated:', isLoggedIn);
    if (isLoggingOut) {
      // Always go to login page if logging out
      navigate('/', { replace: true });
      return;
    }
    // If verification token is present, do not redirect to dashboard/login
    if (tokenFromUrl) {
      console.log('[AuthPage] Verification token present, skipping redirect');
      return;
    }
    if (isLoggedIn && token) {
      // Commenting out approval check to always navigate to dashboard
      const restaurant = localStorage.getItem('restaurant');
      if (restaurant) {
        const parsed = JSON.parse(restaurant) as Restaurant;
        parsed.approval = true;
        console.log('[AuthPage] Navigating based on approval:', parsed.approval);
        navigate(parsed.approval ? '/dashboard' : '/approval-pending', { replace: true });
      } else {
        console.log('[AuthPage] No restaurant found in localStorage, navigating to /dashboard');
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isLoggedIn, token, navigate, isLoggingOut, tokenFromUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      console.log('[AuthPage] Login failed: Email or password missing');
      return;
    }

    try {
      const response = await api.post<import('../types/Restaurant').AuthResponse>('/restaurants/login', {
        email,
        password
      });
      console.log('[AuthPage] Full login response:', response);
      console.log('[AuthPage] Login response data:', response.data);
      const { data } = response.data;
      if (!data) {
        toast.error('Login failed: No data received');
        console.error('[AuthPage] Login failed: data is undefined in response');
        return;
      }
      const { token, restaurant } = data;
      if (!restaurant) {
        toast.error('Login failed: No restaurant data received');
        console.error('[AuthPage] Login failed: restaurant is undefined in response');
        return;
      }
      setToken(token);
      setIsLoggedIn(true);
      localStorage.setItem('authToken', token);
      localStorage.setItem('restaurantId', restaurant.id);
      localStorage.setItem('restaurant', JSON.stringify(restaurant));
      window.ReactNativeWebView?.postMessage(
        JSON.stringify({ type: 'LOGIN', token })
      );
      toast.success('Logged in successfully!');
      //navigate(restaurant.approval ? '/dashboard' : '/approval-pending', { replace: true });
      navigate('/dashboard');
    } catch (error) {
      console.error('[AuthPage] Login error:', error);
    }
  };

  // Removed fetch-based uploadSignupBanner function

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantName || !signupEmail || !signupPassword || !mobileNumber || !address || !serving_radius || !selectedAreaId) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      // First create restaurant without banners
      const response = await api.post<import('../types/Restaurant').AuthResponse>('/restaurants', {
        name: restaurantName,
        email: signupEmail,
        password: signupPassword,
        mobile: mobileNumber,
        address: {
          street: address.street,
          landmark: address.landmark,
          area: address.area,
          fullAddress: address.fullAddress,
          city: 'Gandhinagar',
          state: 'Gujarat',
          pincode: '382007'
        },
        cuisines: cuisines.map(c => c.value).join(', '),
        vegNonveg: vegNonVeg,
        hours,
        areaId: selectedAreaId,
        banners: [], // empty banners array
        applicableTaxBracket: 5.0,
        serving_radius: parseInt(serving_radius)
      });

      const { data } = response.data;
      if (!data) {
        toast.error('Signup failed: No data received');
        console.error('[AuthPage] Signup failed: data is undefined in response');
        return;
      }
      const { token, restaurant } = data;
      if (!restaurant) {
        toast.error('Signup failed: No restaurant data received');
        console.error('[AuthPage] Signup failed: restaurant is undefined in response');
        return;
      }

      setToken(token);
      setIsLoggedIn(true);
      localStorage.setItem('authToken', token);
      localStorage.setItem('restaurantId', restaurant.id);
      localStorage.setItem('restaurant', JSON.stringify(restaurant));

      // Then upload banners if any using uploadBannerImageSignup after setting token
      if (banners.length > 0) {
        try {
          const uploadedBannerUrls: string[] = [];
          for (const bannerFile of banners) {
            const bannerUrl = await uploadBannerImageSignup(bannerFile);
            uploadedBannerUrls.push(bannerUrl);
          }
          console.log('[AuthPage] Uploaded banner URLs:', uploadedBannerUrls);
          // Optionally, update restaurant banners in state or backend if needed
        } catch (bannerError) {
          console.error('[AuthPage] Error uploading banners:', bannerError);
          toast.error('Failed to upload one or more banners');
          // Optionally, decide whether to continue or abort signup flow here
        }
      }

      window.ReactNativeWebView?.postMessage(
        JSON.stringify({ type: 'LOGIN', token })
      );
      toast.success('Signed up successfully!');
      // For testing frontend, force approval to true and navigate to dashboard
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Signup failed. Please try again.';
      toast.error(errorMessage);
      console.error('[AuthPage] Signup error:', error);
      console.error('[AuthPage] Signup error response:', error?.response?.data);
    }
  };

  const handleLogout = async () => {
    // Set logout state to prevent auto-login
    setIsLoggingOut(true);
    try {
      await api.post('/restaurants/logout');
      window.ReactNativeWebView?.postMessage(
        JSON.stringify({ type: 'LOGOUT' })
      );
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('[AuthPage] Logout error:', error);
    } finally {
      setToken(null);
      setIsLoggedIn(false);
      setEmail('');
      setPassword('');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('authToken');
      localStorage.removeItem('restaurantId');
      localStorage.removeItem('restaurant');
      localStorage.removeItem('signupFormState');
      window.authToken = undefined;
      navigate('/', { replace: true });
      setIsLoggingOut(false);
    }
  };
  
  const handleLoginFormChange = (field: string, value: string) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
  };

  const handleSignupFormChange = (field: string, value: any) => {
    switch (field) {
      case 'restaurantName': setRestaurantName(value); break;
      case 'signupEmail': setSignupEmail(value); break;
      case 'signupPassword': setSignupPassword(value); break;
      case 'mobileNumber': setMobileNumber(value); break;
      case 'address': setAddress(value); break;
      case 'serving_radius': setserving_radius(value); break;
      case 'cuisines': setCuisines(value); break;
      case 'vegNonVeg': setVegNonVeg(value); break;
      case 'banners': setBanners(value); break;
      case 'hours': setHours(value); break;
      case 'areaId': setSelectedAreaId(value); break;
      case 'selectedAreaId': setSelectedAreaId(value); break;
      case 'selectedAreaCoordinates': setSelectedAreaCoordinates(value); break;
    }
  };

  console.log('[AuthPage] Rendering with isLoggedIn:', isLoggedIn, 'token:', token, 'isLoggingOut:', isLoggingOut);
  return (
    <AuthLayout
      title={isLogin ? 'Welcome Back!' : 'Join Our Network'}
      description={isLogin
        ? 'Access your restaurant dashboard and manage orders efficiently.'
        : 'Partner with us to grow your restaurant business and reach more customers.'}
    >
      <AnimatePresence mode="wait">
        {isLoggedIn ? (
          <motion.div
            key="logged-in"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 text-center"
          >
            <h2 className="text-2xl font-bold text-gray-800">Welcome!</h2>
            <p className="text-gray-600">You are logged in with token: {token}</p>
            <Button
              onClick={handleLogout}
              variant="primary"
              fullWidth
              rightIcon={<ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
            >
              Logout
            </Button>
          </motion.div>
        ) : isLogin ? (
          <LoginForm
            email={email}
            password={password}
            onSubmit={handleLogin}
            onChange={handleLoginFormChange}
          />
        ) : (
            <SignupForm
              restaurantName={restaurantName}
              signupEmail={signupEmail}
              signupPassword={signupPassword}
              mobileNumber={mobileNumber}
              address={address}
              serving_radius={serving_radius}
              cuisines={cuisines}
              vegNonVeg={vegNonVeg}
              banners={banners}
              hours={hours}
              areas={areas}
              selectedAreaId={selectedAreaId}
              selectedAreaCoordinates={selectedAreaCoordinates}
              onSubmit={handleSignup}
              onChange={handleSignupFormChange}
              verificationToken={verificationToken}
            />
        )}
      </AnimatePresence>

      {!isLoggedIn && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsLogin(!isLogin)}
          className="mt-6 text-primary font-medium hover:underline text-center w-full"
        >
          {isLogin ? 'Create an account' : 'Already have an account? Login'}
        </motion.button>
      )}
    </AuthLayout>
  );
};

export default AuthPage;
