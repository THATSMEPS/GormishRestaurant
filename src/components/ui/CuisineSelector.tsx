import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { getCuisines, Cuisine } from '../../utils/api';

interface CuisineOption {
  value: string;
  label: string;
}

interface CuisineSelectorProps {
  selectedCuisines: CuisineOption[];
  onChange: (value: CuisineOption[]) => void;
  options?: CuisineOption[];
  isDisabled?: boolean;
}

const CuisineSelector: React.FC<CuisineSelectorProps> = ({ selectedCuisines, onChange, options, isDisabled = false }) => {
  const [cuisineOptions, setCuisineOptions] = useState<CuisineOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchCuisines = async () => {
      setLoading(true);
      try {
        const cuisines: Cuisine[] = await getCuisines();
        const formattedOptions = cuisines.map((cuisine) => ({
          value: cuisine.cuisineName,
          label: cuisine.cuisineName,
        }));
        setCuisineOptions(formattedOptions);
      } catch (error) {
        setCuisineOptions(options && options.length > 0 ? options : []);
      } finally {
        setLoading(false);
      }
    };

    fetchCuisines();
  }, [options]);

  const selectOptions = cuisineOptions.length > 0 ? cuisineOptions : options || [];

  return (
    <div>
      <label className="form-label" htmlFor="cuisines">Cuisines</label>
      <Select
        inputId="cuisines"
        options={selectOptions}
        value={selectedCuisines}
        onChange={(value) => onChange(value ? [...value] : [])}
        isMulti
        className="react-select-container"
        classNamePrefix="react-select"
        placeholder={loading ? 'Loading cuisines...' : 'Select cuisines'}
        isDisabled={loading || isDisabled}
      />
    </div>
  );
};

export default CuisineSelector;
