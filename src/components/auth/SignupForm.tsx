import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Pencil, MapPin, Phone, Radius, ArrowRight, Map, CheckCircle } from 'lucide-react';
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
  address: string | Record<string, any>;
  servingRadius: string;
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
  servingRadius,
  cuisines,
  vegNonVeg,
  banners,
  hours,
  areas,
  selectedAreaId,
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

  const handleServingRadiusChange = (value: string) => {
    const numericValue = Number(value);
    if (numericValue > 10) {
      alert('Please enter a serving radius up to 10 km only.');
      onChange('servingRadius', '');
    } else {
      onChange('servingRadius', value);
    }
  };

  const handleMobileNumberChange = (value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 10) {
      onChange('mobileNumber', numericValue);
    }
  };

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
  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
    setSelectedAddress(address);
    // Update the address field in the form
    onChange('address', address);
    // Optionally, you can also update coordinates in form state if needed
    onChange('selectedAreaCoordinates', { latitude: lat, longitude: lng });
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
            className={`p-1 rounded-full focus:outline-none transition-colors ${
              isVerificationSent ? 'text-green-500' : 'text-gray-400 hover:text-gray-600'
            }`}
            style={{ cursor: isSendingVerification ? 'not-allowed' : 'pointer' }}
          >
            <CheckCircle size={20} />
          </button>
        </div>

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
      className={`p-1 rounded-full focus:outline-none transition-colors ${
        isVerifyingOtp ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'
      }`}
      style={{ cursor: isVerifyingOtp ? 'not-allowed' : 'pointer' }}
    >
      <CheckCircle size={20} />
    </button>
  </div>
)}

        <InputField
          label="Mobile Number"
          id="mobileNumber"
          type="tel"
          placeholder="Enter your mobile number"
          value={mobileNumber}
          onChange={(e) => handleMobileNumberChange(e.target.value)}
          required
          maxLength={10}
          minLength={10}
          icon={<Phone size={20} />}
        />

        <InputField
          label="Address"
          id="address"
          placeholder="Enter your Restaurant's Address"
          value={selectedAddress || (typeof address === 'string' ? address : JSON.stringify(address))}
          onChange={(e) => onChange('address', e.target.value)}
          required
          multiline
          icon={<MapPin size={20} />}
          readOnly
        />

        {/* MapLocationPicker component added here */}
        <MapLocationPicker
          initialLat={selectedLat || (typeof address === 'object' && address.latitude ? address.latitude : 23.237560)}
          initialLng={selectedLng || (typeof address === 'object' && address.longitude ? address.longitude : 72.647781)}
          address={typeof address === 'string' ? address : ''}
          onLocationSelect={handleLocationSelect}
        />

        <div> 

          <label htmlFor="areaId" className="block text-sm font-medium text-gray-700 mb-1">
            Area
          </label>
          <div>
            <Select
              inputId="areaId"
              options={Array.isArray(areas) ? areas.map(area => ({ value: area.id, label: area.name })) : []}
              value={Array.isArray(areas) ? areas.filter(area => area.id === selectedAreaId).map(area => ({ value: area.id, label: area.name }))[0] : null}
              onChange={(selectedOption) => onChange('areaId', selectedOption ? selectedOption.value : '')}
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
        </div>

          <InputField
            label="Serving Radius"
            id="servingRadius"
            type="number"
            placeholder="Enter your serving radius (10 km max)"
            value={servingRadius}
            onChange={(e) => handleServingRadiusChange(e.target.value)}
            required
            icon={<Radius size={20} />}
            min="1"
            max="10"
          />

        <CuisineSelector selectedCuisines={cuisines} onChange={(value: { value: string; label: string }[]) => onChange('cuisines', value)} />

        <VegNonVegSelector selectedOption={vegNonVeg} onChange={(value: string) => onChange('vegNonVeg', value)} />

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
