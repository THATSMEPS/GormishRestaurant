import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface OperatingHoursInputProps {
  hours: Record<string, { open: string; close: string; isOpen: boolean }>;
  onChange: (hours: Record<string, { open: string; close: string; isOpen: boolean }>) => void;
}

const OperatingHoursInput: React.FC<OperatingHoursInputProps> = ({ hours, onChange }) => {
  const handleTimeChange = (day: string, type: 'open' | 'close', value: string) => {
    onChange({
      ...hours,
      [day]: {
        ...hours[day],
        [type]: value,
      },
    });
  };

  const toggleDayStatus = (day: string) => {
    onChange({
      ...hours,
      [day]: {
        ...hours[day],
        isOpen: !hours[day].isOpen,
      },
    });
  };

  return (
    <div>
      <label className="form-label">Operating Hours</label>
      <div className="grid grid-cols-7 gap-4">
        {Object.keys(hours).map((day) => {
          const { open, close, isOpen } = hours[day];
          return (
            <div key={day} className="flex flex-col items-center">
              <span className="text-sm text-gray-500">{day}</span>
              <input
                type="time"
                value={open}
                onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
                className="input-field w-full"
                disabled={!isOpen}
              />
              <input
                type="time"
                value={close}
                onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
                className="input-field w-full"
                disabled={!isOpen}
              />
              <button
                type="button"
                onClick={() => toggleDayStatus(day)}
                className={`mt-2 px-3 py-1 rounded-md text-sm font-semibold transition-all flex items-center justify-center ${
                  isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}
              >
                {isOpen ? <Sun size={16} className="mr-1" /> : <Moon size={16} className="mr-1" />}
                {isOpen ? 'Open' : 'Closed'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OperatingHoursInput;
