import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Select, { SingleValue, MultiValue } from 'react-select';
import CuisineSelector from '../components/ui/CuisineSelector';
import { Store, Mail, MapPin, Clock, Image as ImageIcon, Sun, Check, LogOut, Edit2, Moon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { Restaurant, Address } from '../types/Restaurant';
import { uploadBannerImage } from '../utils/api';
import MapLocationPicker from '../components/MapLocationPicker';

interface ProfileProps {
  restaurant: Restaurant;
}

interface SelectOption {
  value: string;
  label: string;
}

const selectStyles = {
  control: (base: any) => ({
    ...base,
    minHeight: '42px',
    backgroundColor: 'white',
    borderColor: '#E5E7EB',
    '&:hover': {
      borderColor: '#6552FF',
    },
    boxShadow: 'none',
    '&:focus-within': {
      borderColor: '#6552FF',
      boxShadow: '0 0 0 2px rgba(101, 82, 255, 0.1)',
    },
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected ? '#6552FF' : state.isFocused ? '#F3F4F6' : 'white',
    color: state.isSelected ? 'white' : '#111827',
    '&:active': {
      backgroundColor: '#6552FF',
    },
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: '#FFF',
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: '#6552FF',
    fontWeight: 500,
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: '#6552FF',
    '&:hover': {
      backgroundColor: '#6552FF',
      color: 'white',
    },
  }),
};

const Profile: React.FC<ProfileProps> = ({ restaurant }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Store image files selected for upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  // Normalize cuisines to array if it's a string
  const normalizedCuisines = Array.isArray(restaurant.cuisines)
    ? restaurant.cuisines
    : restaurant.cuisines
    ? [restaurant.cuisines]
    : [];

  const [cuisineOptions, setCuisineOptions] = useState<SelectOption[]>(
    normalizedCuisines.map(c => ({ value: c, label: c }))
  );
  const [restaurantTypes, setRestaurantTypes] = useState<SelectOption[]>([]);

  const [selectedLat, setSelectedLat] = React.useState<number | null>(null);
  const [selectedLng, setSelectedLng] = React.useState<number | null>(null);
  const [selectedAreaCoordinates, setSelectedAreaCoordinates] = React.useState<{ latitude: number; longitude: number } | null>(null);

  // New state for area options
  const [areaOptions, setAreaOptions] = React.useState<{ value: string; label: string }[]>([]);

  const defaultTimes = {
    open: '09:00',
    close: '22:00',
    isOpen: true,
  };

  const [operatingHours, setOperatingHours] = useState<Record<string, { open: string; close: string; isOpen: boolean }>>(
    restaurant.hours || {
      Monday: { ...defaultTimes },
      Tuesday: { ...defaultTimes },
      Wednesday: { ...defaultTimes },
      Thursday: { ...defaultTimes },
      Friday: { ...defaultTimes },
      Saturday: { ...defaultTimes },
      Sunday: { ...defaultTimes },
    }
  );

  const [profileData, setProfileData] = useState<{
    restaurantName: string;
    email: string;
    description: string;
    address: Address;
    serving_radius: number;
    cuisineTypes: { value: string; label: string }[];
    restaurantType: { value: string; label: string } | null;
    phone: string;
    website: string;
    gstNumber: string;
    fssaiNumber: string;
    banners: string[];
    hours: Record<string, { open: string; close: string; isOpen: boolean }>;
    vegNonveg: 'veg' | 'nonveg' | 'both';
    areaId: string;
  }>({
    restaurantName: restaurant.name || '',
    email: restaurant.email || '',
    description: restaurant.description || '',
    address: restaurant.address || { area: '', street: '', landmark: '', fullAddress: '' },
    serving_radius: restaurant.serving_radius || 5,
    cuisineTypes: normalizedCuisines.map(c => ({ value: c, label: c })),
    restaurantType: restaurant.restaurantType ? { value: restaurant.restaurantType, label: restaurant.restaurantType } : null,
    phone: restaurant.mobile || '',
    website: restaurant.website || '',
    gstNumber: restaurant.gstNumber || '',
    fssaiNumber: restaurant.fssaiNumber || '',
    banners: restaurant.banners || [],
    hours: restaurant.hours || {},
    vegNonveg: restaurant.vegNonveg || 'both',
    areaId: restaurant.areaId || '',
  });

  // Load latest restaurant data from API once, then fallback to localStorage
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const response = await api.get(`/restaurants/${restaurant.id}`);
        const data = response.data;
        if (data && data.id === restaurant.id) {
          localStorage.setItem('restaurant', JSON.stringify(data));
          
          // Properly handle cuisines from API response
          let normalizedCuisines: string[] = [];
          if (data.cuisines) {
            if (Array.isArray(data.cuisines)) {
              normalizedCuisines = data.cuisines;
            } else if (typeof data.cuisines === 'string') {
              // Split comma-separated string and trim whitespace
              normalizedCuisines = (data.cuisines as string).split(',').map((c: string) => c.trim()).filter((c: string) => c.length > 0);
            }
          }
          
          setProfileData({
            restaurantName: data.name || '',
            email: data.email || '',
            description: data.description || '',
            address: data.address || { street: '', area: '', landmark: '', fullAddress: '', city: '', state: '', pincode: '' },
            serving_radius: data.serving_radius || 5,
            cuisineTypes: normalizedCuisines.map((c: string) => ({ value: c, label: c })),
            restaurantType: data.restaurantType ? { value: data.restaurantType, label: data.restaurantType } : null,
            phone: data.mobile || '',
            website: data.website || '',
            gstNumber: data.gstNumber || '',
            fssaiNumber: data.fssaiNumber || '',
            banners: data.banners || [],
            hours: data.hours || {},
            vegNonveg: data.vegNonveg || 'both',
            areaId: data.areaId || '',
          });
          setOperatingHours(data.hours || {
            Monday: { ...defaultTimes },
            Tuesday: { ...defaultTimes },
            Wednesday: { ...defaultTimes },
            Thursday: { ...defaultTimes },
            Friday: { ...defaultTimes },
            Saturday: { ...defaultTimes },
            Sunday: { ...defaultTimes },
          });
        }
      } catch (error) {
        // If API call fails, fallback to localStorage
        const storedRestaurant = localStorage.getItem('restaurant');
        if (storedRestaurant) {
          try {
            const parsed = JSON.parse(storedRestaurant);
            if (parsed && parsed.id === restaurant.id) {
              // Properly handle cuisines from stored data
              let normalizedCuisinesStored: string[] = [];
              if (parsed.cuisines) {
                if (Array.isArray(parsed.cuisines)) {
                  normalizedCuisinesStored = parsed.cuisines;
                } else if (typeof parsed.cuisines === 'string') {
                  // Split comma-separated string and trim whitespace
                  normalizedCuisinesStored = (parsed.cuisines as string).split(',').map((c: string) => c.trim()).filter((c: string) => c.length > 0);
                }
              }
              
              setProfileData({
                restaurantName: parsed.name || '',
                email: parsed.email || '',
                description: parsed.description || '',
                address: parsed.address || { street: '', area: '', landmark: '', fullAddress: '', city: '', state: '', pincode: '' },
                serving_radius: parsed.serving_radius || 5,
                cuisineTypes: normalizedCuisinesStored.map((c: string) => ({ value: c, label: c })),
                restaurantType: parsed.restaurantType ? { value: parsed.restaurantType, label: parsed.restaurantType } : null,
                phone: parsed.mobile || '',
                website: parsed.website || '',
                gstNumber: parsed.gstNumber || '',
                fssaiNumber: parsed.fssaiNumber || '',
                banners: parsed.banners || [],
                hours: parsed.hours || {},
                vegNonveg: parsed.vegNonveg || 'both',
                areaId: parsed.areaId || '',
              });
              setOperatingHours(parsed.hours || {
                Monday: { ...defaultTimes },
                Tuesday: { ...defaultTimes },
                Wednesday: { ...defaultTimes },
                Thursday: { ...defaultTimes },
                Friday: { ...defaultTimes },
                Saturday: { ...defaultTimes },
                Sunday: { ...defaultTimes },
              });
            }
          } catch (e) {
            // ignore JSON parse errors
          }
        }
      }
    };

    fetchRestaurantData();
  }, [restaurant.id]);

  // Fetch area options
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await api.get('/areas');
        const mappedAreas = response.data.data.map((area: any) => ({
          value: area.areaName,
          label: area.areaName,
        }));
        setAreaOptions(mappedAreas);
      } catch (error) {
        console.error('Failed to fetch area options:', error);
      }
    };
    fetchAreas();
  }, []);

  // // Fetch restaurant types (to avoid empty restaurantTypes array)
  // useEffect(() => {
  //   const fetchRestaurantTypes = async () => {
  //     try {
  //       // Replace with your actual API endpoint for restaurant types
  //       const response = await api.get('/restaurant-types');
  //       const types = response.data.data.map((type: string) => ({
  //         value: type,
  //         label: type,
  //       }));
  //       setRestaurantTypes(types);
  //     } catch (error) {
  //       // Fallback to a static list if API fails
  //       const fallbackTypes = [
  //         { value: 'Fine Dining', label: 'Fine Dining' },
  //         { value: 'Casual Dining', label: 'Casual Dining' },
  //         { value: 'Fast Food', label: 'Fast Food' },
  //         { value: 'Cafe', label: 'Cafe' },
  //       ];
  //       setRestaurantTypes(fallbackTypes);
  //       console.error('Failed to fetch restaurant types:', error);
  //     }
  //   };
  //   fetchRestaurantTypes();
  // }, []);

  // Prevent back navigation after logout
  useEffect(() => {
    window.history.pushState(null, '', window.location.pathname);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTimeChange = (type: 'open' | 'close', value: string) => {
    setOperatingHours(prev => {
      const newHours = { ...prev };
      Object.keys(newHours).forEach(day => {
        newHours[day] = {
          ...newHours[day],
          [type]: value,
        };
      });
      return newHours;
    });
  };

  const toggleDayStatus = () => {
    setOperatingHours(prev => {
      const newHours = { ...prev };
      Object.keys(newHours).forEach(day => {
        newHours[day] = {
          ...newHours[day],
          isOpen: !newHours[day].isOpen,
        };
      });
      return newHours;
    });
  };

  const copyTimesToAll = (fromDay: string) => {
    const sourceTime = operatingHours[fromDay];
    setOperatingHours(prev => {
      const newHours = { ...prev };
      Object.keys(newHours).forEach(day => {
        if (day !== fromDay) {
          newHours[day] = { ...sourceTime };
        }
      });
      return newHours;
    });
    toast.success('Operating hours copied to all days');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!profileData.address || !profileData.cuisineTypes.length || !Object.keys(operatingHours).length) {
        throw new Error('Address, cuisines, and operating hours are required');
      }

      const addressObj = {
        street: profileData.address.street,
        area: profileData.address.area,
        landmark: profileData.address.landmark,
        fullAddress: profileData.address.fullAddress,
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380000',
      };

      const payload = {
        name: profileData.restaurantName,
        email: profileData.email,
        mobile: profileData.phone,
        description: profileData.description,
        address: addressObj,
        cuisines: profileData.cuisineTypes.map(c => c.value.trim()).join(', '),
        restaurantType: profileData.restaurantType ? profileData.restaurantType.value : null,
        website: profileData.website,
        gstNumber: profileData.gstNumber,
        fssaiNumber: profileData.fssaiNumber,
        hours: operatingHours,
        vegNonveg: profileData.vegNonveg,
        serving_radius: profileData.serving_radius,
        areaId: profileData.areaId,
      };

      const response = await api.patch<Restaurant>(`/restaurants/${restaurant.id}`, payload);

      // Properly handle cuisines from API response
      let normalizedCuisinesResponse: string[] = [];
      if (response.data.cuisines) {
        if (Array.isArray(response.data.cuisines)) {
          normalizedCuisinesResponse = response.data.cuisines;
        } else if (typeof response.data.cuisines === 'string') {
          // Split comma-separated string and trim whitespace
          normalizedCuisinesResponse = (response.data.cuisines as string).split(',').map((c: string) => c.trim()).filter((c: string) => c.length > 0);
        }
      }
      
      const data = response.data;
      setProfileData({
        restaurantName: data.name || '',
        email: data.email || '',
        description: data.description || '',
        address: data.address || { street: '', area: '', landmark: '', fullAddress: '', city: '', state: '', pincode: '' },
        serving_radius: data.serving_radius || 5,
        cuisineTypes: normalizedCuisinesResponse.map((c: string) => ({ value: c, label: c })),
        restaurantType: data.restaurantType ? { value: data.restaurantType, label: data.restaurantType } : null,
        phone: data.mobile || '',
        website: data.website || '',
        gstNumber: data.gstNumber || '',
        fssaiNumber: data.fssaiNumber || '',
        banners: data.banners || [],
        hours: data.hours || {},
        vegNonveg: data.vegNonveg || 'both',
        areaId: data.areaId || '',
      });
      setOperatingHours(response.data.hours || operatingHours);
      localStorage.setItem('restaurant', JSON.stringify(response.data));
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setIsEditingImage(false);
      setImageFiles([]);
    } catch (err) {
      // Error handled by Axios interceptor
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/restaurants/logout');
      window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'LOGOUT' }));
      toast.success('Logged out successfully!');
    } catch (err) {
      console.error('[Profile] Logout error:', err);
    } finally {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('authToken');
      localStorage.removeItem('restaurant');
      localStorage.removeItem('restaurantId');
      window.authToken = undefined;
      navigate('/', { replace: true });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setImageFiles(newFiles);
      const objectUrls = newFiles.map(file => URL.createObjectURL(file));
      setProfileData({ ...profileData, banners: objectUrls });
    }
  };

  const triggerFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveImage = async () => {
    if (imageFiles.length === 0) {
      toast.error('Please select an image to upload.');
      return;
    }
    setIsSaving(true);
    try {
      const bannerUrl = await uploadBannerImage(restaurant.id, imageFiles[0]);
      setProfileData(prev => ({
        ...prev,
        banners: [bannerUrl],
        image: bannerUrl,
      }));
      localStorage.setItem('restaurant', JSON.stringify({
        ...profileData,
        banners: [bannerUrl],
        image: bannerUrl,
      }));
      toast.success('Image saved successfully!');
      setIsEditingImage(false);
      setImageFiles([]);
    } catch (error) {
      toast.error('Failed to save image. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto pb-24 md:pb-12"
    >
      {/* Header Section */}
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6 mb-6 relative"
      >
        <div className="flex flex-col items-start gap-4">
          <div className="flex w-full justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{profileData.restaurantName}</h1>
              <p className="text-gray-600">Manage your restaurant details and settings</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 transition-colors"
              title="Logout"
            >
              <LogOut size={24} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Restaurant Image */}
        {/* 
          Added padding (p-6) to this container to match the width of section boxes below.
          Wrapped image in a div with overflow-hidden and rounded-lg to maintain rounded corners and prevent image overflow.
          To adjust width in future:
            - Modify or remove the p-6 padding class here to increase/decrease padding around image.
            - Adjust max width of the main container (max-w-4xl) at the top-level motion.div to control overall page width.
        */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-xl shadow-sm p-6 overflow-hidden"
        >
          <div className="relative h-48 sm:h-64 overflow-hidden rounded-lg">
            <img
              src={(profileData?.banners) ? profileData.banners[0] : 'https://placehold.co/600x400'}
              alt="Restaurant"
              className="w-full h-full object-cover"
            />
            {isEditingImage ? (
              <>
                <button
                  onClick={triggerFileInputClick}
                  className="absolute bottom-4 right-32 bg-primary text-white p-2 rounded-full hover:bg-primary-dark"
                  title="Change Banner Image"
                >
                  <ImageIcon size={20} />
                </button>
                <button
                  onClick={handleSaveImage}
                  disabled={isSaving}
                  className={`absolute bottom-4 right-20 bg-primary text-white p-2 rounded-full hover:bg-primary-dark ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Save Banner Image"
                >
                  <Check size={20} />
                </button>
                <button
                  onClick={() => setIsEditingImage(false)}
                  className="absolute bottom-4 right-8 bg-gray-500 text-white p-2 rounded-full hover:bg-gray-600"
                  title="Cancel"
                >
                  ✕
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </>
            ) : (
              <button
                onClick={() => setIsEditingImage(true)}
                className="absolute bottom-4 right-4 bg-primary text-white p-2 rounded-full hover:bg-primary-dark"
                title="Edit Banner Image"
              >
                <Edit2 size={20} />
              </button>
            )}
          </div>
        </motion.div>

        {/* Basic Information */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Basic Information</h2>
            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className={`text-primary hover:text-primary-dark transition-colors ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}`}
              disabled={isSaving}
              title={isEditing ? 'Save Changes' : 'Edit Profile'}
            >
              {isEditing ? <Check size={20} /> : <Edit2 size={20} />}
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="form-label" htmlFor="restaurantName">
                Restaurant Name
              </label>
              <div className="input-group">
                <Store className="input-group-icon" size={20} />
                <input
                  id="restaurantName"
                  type="text"
                  className="input-field"
                  value={profileData.restaurantName}
                  onChange={e => setProfileData({ ...profileData, restaurantName: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <div className="input-group">
                <Mail className="input-group-icon" size={20} />
                <input
                  id="email"
                  type="email"
                  className="input-field"
                  value={profileData.email}
                  disabled
                />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="description">
                Restaurant Description
              </label>
              <textarea
                id="description"
                className="input-field min-h-[100px]"
                value={profileData.description}
                onChange={e => setProfileData({ ...profileData, description: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="form-label" htmlFor="area">
                Area
              </label>
              <div className="input-group">
                <MapPin className="input-group-icon" size={20} />
                <Select
                  inputId="area"
                  options={areaOptions}
                  value={profileData.address.area ? { value: profileData.address.area, label: profileData.address.area } : null}
                  onChange={(option) => {
                    const area = option ? option.label : '';
                    setProfileData({ ...profileData, address: { ...profileData.address, area } });
                  }}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select an area"
                  isClearable
                  isDisabled={!isEditing}
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: '42px',
                      backgroundColor: 'white',
                      borderColor: '#E5E7EB',
                      '&:hover': {
                        borderColor: '#6552FF',
                      },
                      boxShadow: 'none',
                      '&:focus-within': {
                        borderColor: '#6552FF',
                        boxShadow: '0 0 0 2px rgba(101, 82, 255, 0.1)',
                      },
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected ? '#6552FF' : state.isFocused ? '#F3F4F6' : 'white',
                      color: state.isSelected ? 'white' : '#111827',
                      '&:active': {
                        backgroundColor: '#6552FF',
                      },
                    }),
                  }}
                />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="street">
                Street
              </label>
              <div className="input-group">
                <MapPin className="input-group-icon" size={20} />
                <input
                  id="street"
                  type="text"
                  className="input-field"
                  value={profileData.address.street || ''}
                  onChange={e => setProfileData({ ...profileData, address: { ...profileData.address, street: e.target.value } })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="landmark">
                Landmark
              </label>
              <div className="input-group">
                <MapPin className="input-group-icon" size={20} />
                <input
                  id="landmark"
                  type="text"
                  className="input-field"
                  value={profileData.address.landmark || ''}
                  onChange={e => setProfileData({ ...profileData, address: { ...profileData.address, landmark: e.target.value } })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="fullAddress">
                Address
              </label>
              <div className="input-group">
                <textarea
                  id="fullAddress"
                  className="input-field min-h-[80px]"
                  value={profileData.address.fullAddress || ''}
                  onChange={e => setProfileData({ ...profileData, address: { ...profileData.address, fullAddress: e.target.value } })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <MapLocationPicker
              initialLat={selectedLat || (selectedAreaCoordinates?.latitude || 23.237560)}
              initialLng={selectedLng || (selectedAreaCoordinates?.longitude || 72.647781)}
              address={profileData.address.fullAddress || ''}
              onLocationSelect={(lat, lng, fullAddress) => {
                setSelectedLat(lat);
                setSelectedLng(lng);
                setProfileData({ ...profileData, address: { ...profileData.address, fullAddress } });
              }}
              onAreaSelect={(bounds) => {
                const center = bounds.getCenter();
                setSelectedAreaCoordinates({
                  latitude: center.lat,
                  longitude: center.lng,
                });
              }}
              isEditing={isEditing}
            />

            <div>
              <label className="form-label" htmlFor="serving_radius">
                Serving Radius (km)
              </label>
              <div className="input-group">
                <Clock className="input-group-icon" size={20} />
                <input
                  id="serving_radius"
                  type="number"
                  className="input-field"
                  value={profileData.serving_radius}
                  min={1}
                  max={100}
                  onChange={e => setProfileData({ ...profileData, serving_radius: Number(e.target.value) })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="phone">
                Phone
              </label>
              <div className="input-group">
                <input
                  id="phone"
                  type="text"
                  className="input-field"
                  value={profileData.phone}
                  onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="website">
                Website
              </label>
              <div className="input-group">
                <input
                  id="website"
                  type="text"
                  className="input-field"
                  value={profileData.website}
                  onChange={e => setProfileData({ ...profileData, website: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="gstNumber">
                GST Number
              </label>
              <div className="input-group">
                <input
                  id="gstNumber"
                  type="text"
                  className="input-field"
                  value={profileData.gstNumber}
                  onChange={e => setProfileData({ ...profileData, gstNumber: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="fssaiNumber">
                FSSAI Number
              </label>
              <div className="input-group">
                <input
                  id="fssaiNumber"
                  type="text"
                  className="input-field"
                  value={profileData.fssaiNumber}
                  onChange={e => setProfileData({ ...profileData, fssaiNumber: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="vegNonveg">
                Veg/Non-Veg
              </label>
              <select
                id="vegNonveg"
                className="input-field"
                value={profileData.vegNonveg}
                onChange={e => setProfileData({ ...profileData, vegNonveg: e.target.value as 'veg' | 'nonveg' | 'both' })}
                disabled={!isEditing}
              >
                <option value="veg">Veg</option>
                <option value="nonveg">Non-Veg</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Restaurant Type & Cuisine */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Restaurant Type & Cuisine</h2>
          <div className="space-y-4">
            <div>
              <CuisineSelector
                selectedCuisines={profileData.cuisineTypes}
                onChange={(value) => setProfileData({ ...profileData, cuisineTypes: value })}
                isDisabled={!isEditing}
              />
            </div>
          </div>
        </motion.div>

        {/* Operating Hours */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="space-y-6">
            {(() => {
              const { open, close, isOpen } = operatingHours['Monday'] || { open: '09:00', close: '22:00', isOpen: true };
              return (
                <div className="border rounded-md p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-2">Daily Hours</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="daily-open" className="block text-sm font-medium text-gray-700 mb-1">
                          Opening Time
                        </label>
                        <input
                          id="daily-open"
                          type="time"
                          value={open}
                          onChange={e => handleTimeChange('open', e.target.value)}
                          disabled={!isEditing}
                          className="input-field w-full"
                        />
                      </div>
                      <div>
                        <label htmlFor="daily-close" className="block text-sm font-medium text-gray-700 mb-1">
                          Closing Time
                        </label>
                        <input
                          id="daily-close"
                          type="time"
                          value={close}
                          onChange={e => handleTimeChange('close', e.target.value)}
                          disabled={!isEditing}
                          className="input-field w-full"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center ml-4">
                    <label htmlFor="daily-isOpen" className="mr-2 text-sm font-medium text-gray-700">
                      {isOpen ? 'Open' : 'Closed'}
                    </label>
                    <input
                      id="daily-isOpen"
                      type="checkbox"
                      checked={isOpen}
                      onChange={toggleDayStatus}
                      disabled={!isEditing}
                      className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;