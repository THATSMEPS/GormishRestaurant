import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Pencil, MapPin, Phone, Radius, ArrowRight, CheckCircle } from 'lucide-react';
import InputField from '../ui/InputField';
import Button from '../ui/Button';
import CuisineSelector from '../ui/CuisineSelector';
import VegNonVegSelector from '../ui/VegNonVegSelector';
import BannersInput from '../ui/BannersInput';
import OperatingHoursInput from '../ui/OperatingHoursInput';
import api from '../../utils/api';
import Select, { StylesConfig, GroupBase, OptionProps } from 'react-select';
import MapLocationPicker from '../MapLocationPicker';

interface Area {
  id: string;
  name: string;
}

interface SignupFormProps {
  restaurantName: string;
  signupEmail: string;
  signupPassword: string;
  mobileNumber: string;
  address: { street: string; landmark: string; area: string; fullAddress: string }
  serving_radius: string;
  cuisines: { value: string; label: string }[];
  vegNonVeg: string;
  banners: File[];
  hours: Record<string, { open: string; close: string; isOpen: boolean }>;
  areas: Area[];
  selectedAreaId: string;
  selectedAreaCoordinates?: { latitude: number; longitude: number } | null;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: string, value: any) => void;
  verificationToken?: string;
}

const SignupForm: React.FC<SignupFormProps> = ({
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
  areas,
  selectedAreaId,
   selectedAreaCoordinates,
  onSubmit,
  onChange,
  verificationToken
}) => {
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [otp, setOtp] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // New state for selected location
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>('');

  const handleserving_radiusChange = (value: string) => {
    const numericValue = Number(value);
    if (numericValue > 10) {
      alert('Please enter a serving radius up to 10 km only.');
      onChange('serving_radius', '');
    } else {
      onChange('serving_radius', value);
    }
  };

  const handleMobileNumberChange = (value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 10) {
      onChange('mobileNumber', numericValue);
    }
  };

  const handleAreaChange = (option: { value: string; label: string } | null) => {
    onChange('selectedAreaId', option ? option.value : '');
    //new update
    onChange('address', {
      ...address,
      area: option ? option.label : ''
    });
    // Reset selectedLat and selectedLng to null to fallback to selectedAreaCoordinates
    setSelectedLat(null);
    setSelectedLng(null);
  };

    const handleAddressFieldChange = (field: keyof typeof address, value: string) => {
    onChange('address', {
      ...address,
      [field]: value
    });
  };
    //new till here

  useEffect(() => {
    if (verificationToken) {
      // No longer using token verification flow
      setIsEmailVerified(false);
    }
  }, [verificationToken]);

  const handleSendVerificationEmail = async () => {
    if (!signupEmail) {
      alert('Please enter your email before verification.');
      return;
    }
    setIsSendingVerification(true);
    try {
      // Call backend API to send OTP email
      const response = await api.post('/auth/send-verification-email', { email: signupEmail });
      setIsVerificationSent(true);
      alert('Verification email sent with OTP. Please check your inbox.');
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message || 'Failed to send verification email. Please try again.');
      } else {
        alert('Failed to send verification email. Please try again.');
      }
    } finally {
      setIsSendingVerification(false);
    }
  };

  // Handler for location selection from MapLocationPicker
  const handleLocationSelect = (lat: number, lng: number, fullAddress: string) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
    // setSelectedAddress(address);
    // Update the address field in the form
    onChange('address', {
      ...address,
      fullAddress
    })
    // Optionally, you can also update coordinates in form state if needed
    onChange('selectedAreaCoordinates', { latitude: lat,
       longitude: lng });
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      alert('Please enter a valid 6-digit OTP.');
      return;
    }
    setIsVerifyingOtp(true);
    try {
      const response = await api.post('/auth/verify-otp', { email: signupEmail, otp });
      setIsOtpVerified(true);
      setIsEmailVerified(true);
      alert('Email verified successfully. You can now complete signup.');
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message || 'OTP verification failed. Please try again.');
      } else {
        alert('OTP verification failed. Please try again.');
      }
      setIsOtpVerified(false);
      setIsEmailVerified(false);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <motion.form
      key="signup"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={onSubmit}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Sign Up</h2>
        <p className="text-gray-600 mt-2">Create an account to get started</p>
      </div>

      <div className="space-y-4">
        <InputField
          label="Restaurant Name"
          id="restaurantName"
          type="text"
          placeholder="Enter your Restaurant name"
          value={restaurantName}
          onChange={(e) => onChange('restaurantName', e.target.value)}
          required
          icon={<Pencil size={20} />}
        />

        <div className="flex flex-row items-end space-x-2">
          <div className="flex-1">
            <InputField
              label="Email Address"
              id="signupEmail"
              type="email"
              placeholder="Enter your email"
              value={signupEmail}
              onChange={(e) => {
                onChange('signupEmail', e.target.value);
                setIsEmailVerified(false);
                setIsVerificationSent(false);
                setIsOtpVerified(false);
                setOtp('');
              }}
              required
              icon={<Mail size={20} />}
            />
          </div>
          <button
            type="button"
            onClick={handleSendVerificationEmail}
            disabled={isSendingVerification}
            aria-label="Send Verification OTP"
            className={`px-3 py-1 rounded-full text-sm font-semibold focus:outline-none transition-colors ${
              isVerificationSent
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            style={{ cursor: isSendingVerification ? 'not-allowed' : 'pointer' }}
          >
            verify
          </button>
        </div>

        {isVerificationSent && !isOtpVerified && (
          <div className="flex items-center space-x-2">
            <InputField
              label="Enter OTP"
              id="otp"
              type="text"
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
              className="w-32"
            />
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifyingOtp}
              aria-label="Verify OTP"
              className={`px-3 py-1 rounded-full text-sm font-semibold focus:outline-none transition-colors ${
                isVerifyingOtp
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
              style={{ cursor: isVerifyingOtp ? 'not-allowed' : 'pointer' }}
            >
              verify
            </button>
          </div>
        )}

        <InputField
          label="Password"
          id="signupPassword"
          type="password"
          placeholder="Create a password"
          value={signupPassword}
          onChange={(e) => onChange('signupPassword', e.target.value)}
          required
          icon={<Lock size={20} />}
        />

        <InputField
          label="Mobile Number"
          id="mobileNumber"
          type="tel"
          placeholder="Enter your mobile number"
          value={mobileNumber}
          onChange={(e) => handleMobileNumberChange(e.target.value)}
          onKeyDown={(e) => {
            // Allow control keys: backspace, delete, tab, escape, enter, arrows
            if (
              e.key === 'Backspace' ||
              e.key === 'Delete' ||
              e.key === 'Tab' ||
              e.key === 'Escape' ||
              e.key === 'Enter' ||
              e.key === 'ArrowLeft' ||
              e.key === 'ArrowRight' ||
              e.key === 'Home' ||
              e.key === 'End'
            ) {
              return;
            }
            // Prevent non-numeric keys
            if (!/^[0-9]$/.test(e.key)) {
              e.preventDefault();
            }
          }}
          required
          maxLength={10}
          minLength={10}
          icon={<Phone size={20} />}
        />

        <div>
          <label htmlFor="areaId" className="block text-sm font-medium text-gray-700 mb-1">
            Area
          </label>
          <Select
            inputId="areaId"
            options={Array.isArray(areas) ? areas.map(area => ({ value: area.id, label: area.name })) : []}
            value={Array.isArray(areas) ? areas.filter(area => area.id === selectedAreaId).map(area => ({ value: area.id, label: area.name }))[0] : null}
            onChange={handleAreaChange}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Select an area"
            isClearable
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

        <InputField
          label="Street"
          id="street"
          type="text"
          placeholder="Enter street name"
          value={address.street || ''}
          onChange={(e) => handleAddressFieldChange('street', e.target.value)}
          required
          icon={<MapPin size={20} />}
        />

        <InputField
          label="Landmark"
          id="landmark"
          type="text"
          placeholder="Enter nearby landmark"
          value={address.landmark || ''}
          onChange={(e) => handleAddressFieldChange('landmark', e.target.value)}
          required
          icon={<MapPin size={20} />}
        />

        <InputField
          label="Full Address (from Map)"
          id="fullAddress"
          placeholder="Select location on map to fetch address"
          value={address.fullAddress || ''}
          onChange={(e) => handleAddressFieldChange('fullAddress', e.target.value)}
          required
          multiline
          // readOnly
          
        />

        {/* MapLocationPicker component added here */}
        <MapLocationPicker
          // initialLat={selectedLat || (typeof address === 'object' && address.latitude ? address.latitude : 23.237560)}
          // initialLng={selectedLng || (typeof address === 'object' && address.longitude ? address.longitude : 72.647781)}
          // address={typeof address === 'string' ? address : ''}
          // onLocationSelect={handleLocationSelect}
          initialLat={selectedLat || (selectedAreaCoordinates?.latitude || 23.237560)}
          initialLng={selectedLng || (selectedAreaCoordinates?.longitude || 72.647781)}
          address={address.fullAddress || ''}
          onLocationSelect={handleLocationSelect}
          isEditing={true}
        />

        <InputField
          label="Serving Radius"
          id="serving_radius"
          type="number"
          placeholder="Enter your serving radius (10 km max)"
          value={serving_radius}
          onChange={(e) => handleserving_radiusChange(e.target.value)}
          required
          icon={<Radius size={20} />}
          min="1"
          max="10"
        />

        <CuisineSelector selectedCuisines={cuisines} onChange={(value: { value: string; label: string }[]) => onChange('cuisines', value)} />

        <VegNonVegSelector selectedOption={vegNonVeg} onChange={(value: string) => onChange('vegNonVeg', value)} />

        {(() => {
          // Extract Monday hours or default
          const { open, close, isOpen } = hours['Monday'] || { open: '09:00', close: '22:00', isOpen: true };

          // Local handlers to update all days and call onChange
          const handleTimeChange = (type: 'open' | 'close', value: string) => {
            const newHours = { ...hours };
            Object.keys(newHours).forEach(day => {
              newHours[day] = {
                ...newHours[day],
                [type]: value,
              };
            });
            onChange('hours', newHours);
          };

          const toggleDayStatus = () => {
            const newHours = { ...hours };
            Object.keys(newHours).forEach(day => {
              newHours[day] = {
                ...newHours[day],
                isOpen: !newHours[day].isOpen,
              };
            });
            onChange('hours', newHours);
          };

          return (
            <div className="border rounded-md p-4 flex items-center justify-between mb-6">
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
                      className="input-field w-full"
                      required
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
                      className="input-field w-full"
                      required
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
                  className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
                />
              </div>
            </div>
          );
        })()}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Restaurant Image</label>
          <BannersInput banners={banners} onChange={(value: File[]) => onChange('banners', value)} />
        </div>

        <div>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            rightIcon={<ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
            disabled={!isEmailVerified}
            className={`${!isEmailVerified ? 'bg-gray-400 cursor-not-allowed' : ''}`}
          >
            Sign Up
          </Button>
          {!isEmailVerified && (
            <p className="text-sm text-red-600 mt-1">Please verify your email to enable sign up.</p>
          )}
        </div>
      </div>
    </motion.form>
  );
};

export default SignupForm;