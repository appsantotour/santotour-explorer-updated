

import React from 'react';

interface CheckboxFieldProps {
  id: string;
  name: string;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  id,
  name,
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 text-indigo-600 border-gray-800 rounded focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <label htmlFor={id} className={`ml-2 block text-base font-semibold text-gray-700 ${disabled ? 'text-gray-400' : ''}`}>
        {label}
      </label>
    </div>
  );
};

export default CheckboxField;