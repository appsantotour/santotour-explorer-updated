// src/utils/dateUtils.ts

/**
 * Converts a date string from DD/MM/AAAA format to YYYY-MM-DD format for Supabase.
 * @param dateString The date string in DD/MM/AAAA format.
 * @returns The date string in YYYY-MM-DD format, or null if input is invalid.
 */
export const convertDateToSupabaseFormat = (dateString: string | undefined | null): string | null => {
  if (!dateString) return null;
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (day > 0 && day <= 31 && month > 0 && month <= 12 && year > 1000 && year < 3000) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  // Check if already YYYY-MM-DD (e.g. from type="date" input)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  return null; 
};

/**
 * Converts a date string from YYYY-MM-DD format (from Supabase or type="date" input) to DD/MM/AAAA format for display.
 * @param dateString The date string in YYYY-MM-DD format.
 * @returns The date string in DD/MM/AAAA format, or an empty string if input is invalid.
 */
export const convertDateFromSupabaseFormat = (dateString: string | undefined | null): string => {
  if (!dateString) return '';
  // Check if it's already in DD/MM/AAAA (e.g., user manually typed it, or it was already converted)
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return dateString;
  }
  const parts = dateString.split('-'); // Expects YYYY-MM-DD
  if (parts.length === 3) {
    // parts[0] = YYYY, parts[1] = MM, parts[2] = DD
    return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
  }
  return ''; // Return empty if format is not YYYY-MM-DD
};


/**
 * Formats a date string (presumed to be in YYYY-MM-DD from Supabase or date input) to DD/MM/AAAA for display.
 * This is an alias for convertDateFromSupabaseFormat for clarity in certain contexts.
 * @param dateString The date string, typically YYYY-MM-DD.
 * @returns Formatted date string DD/MM/AAAA or empty string.
 */
export const formatDateForDisplayDDMMYYYY = (dateString: string | undefined | null): string => {
  return convertDateFromSupabaseFormat(dateString);
};

/**
 * Gets today's date in YYYY-MM-DD format.
 * @returns Today's date as a string in YYYY-MM-DD format.
 */
export const getTodayInSupabaseFormat = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parses a date string in DD/MM/AAAA format into a Date object.
 * @param dateString The date string in DD/MM/AAAA format.
 * @returns A Date object or null if the string is invalid.
 */
export const parseUIDateToDate = (dateString: string | undefined | null): Date | null => {
  if (!dateString) return null;
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
    const year = parseInt(parts[2], 10);
    if (day > 0 && day <= 31 && month >= 0 && month < 12 && year > 1000 && year < 3000) {
      const date = new Date(year, month, day);
      // Extra validation to ensure the date wasn't, e.g., Feb 30th rolled over to March
      if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
        return date;
      }
    }
  }
  return null;
};
