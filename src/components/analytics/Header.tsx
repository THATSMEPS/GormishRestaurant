import React from 'react';
import Select from 'react-select';

interface DateRangeOption {
  value: string;
  label: string;
}

interface HeaderProps {
  selectedRange: DateRangeOption;
  onRangeChange: (value: DateRangeOption) => void;
  isLoading: boolean;
}

const Header: React.FC<HeaderProps> = ({ selectedRange, onRangeChange, isLoading }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Analytics Dashboard</h1>
        <Select
          value={selectedRange}
          onChange={(value) => onRangeChange(value as DateRangeOption)}
          options={[
            { value: '7', label: 'Last 7 Days' },
            { value: '30', label: 'Last 30 Days' },
            { value: '90', label: 'Last 90 Days' },
            { value: '365', label: 'Last Year' },
            { value: 'all', label: 'All Time' },
          ]}
          className="w-full max-w-[200px] sm:w-48"
          isSearchable={false}
          isDisabled={isLoading}
        />
      </div>
    </div>
  );
};

export default Header;
