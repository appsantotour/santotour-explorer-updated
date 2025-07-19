

export const applyCpfMask = (value: string): string => {
  const nums = value.replace(/\D/g, '');
  if (nums.length === 0) return '';
  let maskedValue = nums;
  if (nums.length > 3) maskedValue = nums.replace(/(\d{3})(\d)/, '$1.$2');
  if (nums.length > 6) maskedValue = nums.replace(/(\d{3})(\d{3})(\d)/, '$1.$2.$3');
  if (nums.length > 9) maskedValue = nums.replace(/(\d{3})(\d{3})(\d{3})(\d)/, '$1.$2.$3-$4');
  return maskedValue.slice(0, 14); // Max length 000.000.000-00
};

export const applyPhoneMask = (value: string): string => {
  const nums = value.replace(/\D/g, '');
  if (nums.length === 0) return '';
  
  if (nums.length <= 2) return `(${nums}`;
  if (nums.length <= 6) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
  
  // Handles 10-digit (XX) XXXX-XXXX or 11-digit (XX) XXXXX-XXXX
  if (nums.length <= 10) { // (00) 0000-0000
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6, 10)}`;
  } else { // (00) 00000-0000
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7, 11)}`;
  }
};

export const applyDateMask = (value: string): string => {
  const nums = value.replace(/\D/g, '');
  if (nums.length === 0) return '';
  let maskedValue = nums;
  if (nums.length > 2) maskedValue = nums.replace(/(\d{2})(\d)/, '$1/$2');
  if (nums.length > 4) maskedValue = nums.replace(/(\d{2})(\d{2})(\d)/, '$1/$2/$3');
  return maskedValue.slice(0, 10); // Max length dd/mm/aaaa
};

export const applyIntegerMask = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const applyCurrencyMask = (value: string): string => {
  let rawValue = value.replace(/\D/g, '');

  if (rawValue === '') return '';

  // Remove leading zeros, unless it's the only digit or part of "0,xx"
  if (rawValue.length > 1 && rawValue.startsWith('0')) {
    rawValue = rawValue.replace(/^0+(?=\d)/, '');
  }
  
  let intPart;
  let decPart;

  if (rawValue.length === 0) { 
    return '0,00';
  } else if (rawValue.length === 1) { 
    decPart = `0${rawValue}`;
    intPart = '0';
  } else if (rawValue.length === 2) { 
    decPart = rawValue;
    intPart = '0';
  } else { 
    decPart = rawValue.slice(-2);
    intPart = rawValue.slice(0, -2);
  }

  intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Thousand separator

  return `${intPart},${decPart}`;
};


/**
 * Formats a number to a BRL currency string (e.g., 1234.56 to "1.234,56").
 * This version manually constructs the string to avoid locale inconsistencies.
 * @param num The number to format.
 * @returns The BRL formatted currency string, or "0,00" for invalid/null input.
 */
export const formatNumberToBRLCurrency = (num?: number | null): string => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0,00'; // Default for null, undefined, or NaN inputs
  }
  
  // Work with cents to avoid floating point issues and ensure two decimal places
  const cents = Math.round(num * 100);
  const absoluteCents = Math.abs(cents);

  const intPartNum = Math.floor(absoluteCents / 100);
  const decPartNum = absoluteCents % 100;

  let intPartStr = intPartNum.toString();
  const decPartStr = decPartNum.toString().padStart(2, '0');

  // Add thousand separators to the integer part
  intPartStr = intPartStr.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  const sign = num < 0 ? "-" : "";

  return `${sign}${intPartStr},${decPartStr}`;
};

/**
 * Parses a BRL currency string (e.g., "1.234,56") to a number.
 * @param maskedValue The BRL formatted currency string.
 * @returns The parsed number, or null if parsing fails.
 */
export const parseBRLCurrency = (maskedValue?: string | null): number | null => {
  if (!maskedValue) return null;
  // Remove thousand separators (dots), then replace decimal comma with a dot
  const numericString = maskedValue.replace(/\./g, '').replace(',', '.');
  const val = parseFloat(numericString);
  return isNaN(val) ? null : val;
};
