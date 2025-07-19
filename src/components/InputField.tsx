
import React from 'react';
import { applyCpfMask, applyPhoneMask, applyDateMask, applyIntegerMask, applyCurrencyMask } from '../utils/maskUtils';
import { MaskType } from '../types';

interface InputFieldProps {
  // ...existentes
  autoFocus?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;

  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  maxLength?: number;
  required?: boolean;
  placeholder?: string;
  maskType?: MaskType;
  isTextArea?: boolean;
  rows?: number;
  optionalLabel?: string;
  className?: string;
  readOnly?: boolean;
  disabled?: boolean; // Added disabled prop
  step?: string; // For type="number"
  inputMode?: 'numeric' | 'decimal' | 'text' | 'tel' | 'email' | 'url' | 'search' | undefined; // For mobile keyboards
  error?: string | null;
  inputClassName?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  type = 'text',
  maxLength,
  required = false,
  placeholder,
  maskType,
  isTextArea = false,
  rows = 3,
  optionalLabel = '',
  className = '',
  readOnly = false,
  disabled = false, // Initialize disabled prop
  step,
  inputMode,
  error,
  inputClassName = '',
  autoFocus,
  inputRef,
  onKeyDown,
  onBlur,
}) => {
  const commonProps = {
    id,
    name,
    value,
    maxLength,
    required,
    placeholder,
    readOnly,
    disabled, // Pass disabled to the input element
    className: `mt-1 block w-full px-3 py-2 bg-white border ${error ? 'border-red-500' : 'border-gray-800'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ${readOnly && !disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${inputClassName}`,
    'aria-required': required,
    'aria-invalid': error ? true : false,
    'aria-describedby': error ? `${id}-error` : undefined,
  };

  if(inputMode) {
    (commonProps as any).inputMode = inputMode;
  }
  if(type === 'number' && step) {
    (commonProps as any).step = step;
  }


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let { value: eventValue } = e.target;
    if (maskType) {
      if (maskType === 'cpf') eventValue = applyCpfMask(eventValue);
      else if (maskType === 'phone') eventValue = applyPhoneMask(eventValue);
      else if (maskType === 'date') eventValue = applyDateMask(eventValue);
      else if (maskType === 'integer') eventValue = applyIntegerMask(eventValue);
      else if (maskType === 'currency') eventValue = applyCurrencyMask(eventValue);
    }

    const modifiedEvent = {
      ...e,
      target: {
        ...e.target,
        name: name,
        value: eventValue,
      },
    } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
    onChange(modifiedEvent);
  };

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-base font-semibold text-gray-700">
        {label}
        {required ? <span className="text-red-500 ml-1">*</span> : (optionalLabel ? <span className="text-gray-500 text-xs ml-1">{optionalLabel}</span> : null)}
      </label>
      {isTextArea ? (
        <textarea
          {...commonProps}
          rows={rows}
          onChange={handleChange}
        />
      ) : (
        <input
          {...commonProps}
          type={type}
          onChange={handleChange}
          {...(typeof autoFocus !== 'undefined' ? { autoFocus } : {})}
          {...(inputRef ? { ref: inputRef } : {})}
          {...(onKeyDown ? { onKeyDown } : {})}
          {...(onBlur ? { onBlur } : {})}
        />
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
