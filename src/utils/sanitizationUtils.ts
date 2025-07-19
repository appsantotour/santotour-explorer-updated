// src/utils/sanitizationUtils.ts

/**
 * Sanitizes string data by trimming whitespace and escaping commas
 * @param value The string value to sanitize
 * @returns The sanitized string value
 */
export const sanitizeString = (value: string | null | undefined): string | null => {
  if (value === null || value === undefined) return null;
  
  // Trim whitespace from start and end
  let sanitized = value.trim();
  
  // If empty after trimming, return null
  if (sanitized === '') return null;
  
  // Escape commas by wrapping the entire string in quotes if it contains commas
  if (sanitized.includes(',')) {
    sanitized = `'${sanitized}'`;
  }
  
  return sanitized;
};

/**
 * Sanitizes an object by applying sanitizeString to all string properties
 * @param obj The object to sanitize
 * @returns The sanitized object
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      (sanitized as any)[key] = sanitizeString(sanitized[key]);
    }
  }
  
  return sanitized;
};

/**
 * Sanitizes form data before submission to Supabase
 * Excludes certain fields that should not be sanitized (like IDs, booleans, numbers)
 * @param formData The form data to sanitize
 * @param excludeFields Array of field names to exclude from sanitization
 * @returns The sanitized form data
 */
export const sanitizeFormData = <T extends Record<string, any>>(
  formData: T, 
  excludeFields: string[] = ['id', 'ativo', 'created_at', 'updated_at']
): T => {
  const sanitized = { ...formData };
  
  for (const key in sanitized) {
    // Skip excluded fields and non-string values
    if (excludeFields.includes(key) || typeof sanitized[key] !== 'string') {
      continue;
    }
    
    (sanitized as any)[key] = sanitizeString(sanitized[key]);
  }
  
  return sanitized;
};