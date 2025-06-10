import React from 'react';
import Select from 'react-select';

const cuisineOptions = [
  { value: 'Indian', label: 'Indian' },
  { value: 'Chinese', label: 'Chinese' },
  { value: 'Italian', label: 'Italian' },
  { value: 'Mexican', label: 'Mexican' },
  { value: 'Thai', label: 'Thai' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'French', label: 'French' },
  { value: 'Mediterranean', label: 'Mediterranean' },
  { value: 'American', label: 'American' },
  { value: 'Other', label: 'Other' },
];

interface CuisineSelectorProps {
  selectedCuisines: { value: string; label: string }[];
  onChange: (value: { value: string; label: string }[]) => void;
}

const CuisineSelector: React.FC<CuisineSelectorProps> = ({ selectedCuisines, onChange }) => {
  return (
    <div>
      <label className="form-label" htmlFor="cuisines">Cuisines</label>
      <Select
        inputId="cuisines"
        options={cuisineOptions}
        value={selectedCuisines}
        onChange={(value) => onChange(value ? [...value] : [])}
        isMulti
        className="react-select-container"
        classNamePrefix="react-select"
        placeholder="Select cuisines"
      />
    </div>
  );
};

export default CuisineSelector;
