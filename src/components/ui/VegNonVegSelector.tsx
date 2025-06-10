import React from 'react';
import Select from 'react-select';

const vegNonVegOptions = [
  { value: 'veg', label: 'Veg' },
  { value: 'non-veg', label: 'Non-Veg' },
  { value: 'both', label: 'Both' },
];

interface VegNonVegSelectorProps {
  selectedOption: string;
  onChange: (value: string) => void;
}

const VegNonVegSelector: React.FC<VegNonVegSelectorProps> = ({ selectedOption, onChange }) => {
  const selected = vegNonVegOptions.find(option => option.value === selectedOption) || null;

  return (
    <div>
      <label className="form-label" htmlFor="vegNonVeg">Veg / Non-Veg</label>
      <Select
        inputId="vegNonVeg"
        options={vegNonVegOptions}
        value={selected}
        onChange={(option) => onChange(option ? option.value : '')}
        isClearable={false}
        className="react-select-container"
        classNamePrefix="react-select"
        placeholder="Select option"
      />
    </div>
  );
};

export default VegNonVegSelector;
