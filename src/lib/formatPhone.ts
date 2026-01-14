/**
 * Formats a phone number string to (XXX) XXX-XXXX format
 * Only handles US phone numbers without country code
 */
export const formatPhoneNumber = (value: string): string => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  
  // Limit to 10 digits
  const truncated = digits.slice(0, 10);
  
  // Format based on length
  if (truncated.length === 0) {
    return '';
  } else if (truncated.length <= 3) {
    return `(${truncated}`;
  } else if (truncated.length <= 6) {
    return `(${truncated.slice(0, 3)}) ${truncated.slice(3)}`;
  } else {
    return `(${truncated.slice(0, 3)}) ${truncated.slice(3, 6)}-${truncated.slice(6)}`;
  }
};

/**
 * Strips formatting from a phone number, returning just digits
 */
export const stripPhoneFormatting = (value: string): string => {
  return value.replace(/\D/g, '');
};
