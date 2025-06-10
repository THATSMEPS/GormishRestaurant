import React, { useEffect, useState } from 'react';
import { Sun } from 'lucide-react';
import api from '../../utils/api';

interface OnlineToggleProps {
  restaurantId: string;
}

const OnlineToggle: React.FC<OnlineToggleProps> = ({ restaurantId }) => {
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current open status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/restaurants/me`);
        console.log('Fetch /restaurants/me response:', res);
        setIsOnline(res.data.data.isOpen);
        setError(null);
      } catch (err) {
        console.log('Error fetching restaurant status:', err);
        setError('Failed to fetch restaurant status');
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [restaurantId]);

  // Handle toggle change
  const handleToggle = async (checked: boolean) => {
    setIsOnline(checked);
    try {
      await api.put(`/restaurants/${restaurantId}/openstatus`, { isOpen: checked });
      setError(null);
    } catch (err) {
      setError('Failed to update restaurant status');
      // Revert toggle on error
      setIsOnline(!checked);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={isOnline}
        onChange={(e) => handleToggle(e.target.checked)}
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      <span className="ms-3 text-sm font-medium truncate">
        {isOnline ? 'Online' : 'Offline'}
      </span>
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </label>
  );
};

export default OnlineToggle;
