
import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  required?: boolean;
  disabled?: boolean;
  optionalLabel?: string;
  className?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  options = [], // Default to an empty array
  required = false,
  disabled = false,
  optionalLabel = '', // Changed from '(opcional)'
  className = '',
}) => {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-base font-semibold text-gray-700">
        {label}
        {required ? <span className="text-red-500 ml-1">*</span> : <span className="text-gray-500 text-xs ml-1">{optionalLabel}</span>}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`mt-1 block w-full px-3 py-2 bg-white border border-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      >
        {options.map(option => (
          <option key={option.value} value={option.value} disabled={option.value === '' && required}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
