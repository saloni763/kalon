/**
 * Validation utility functions for form inputs
 * Centralized validation logic for the entire app
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates email address
 * @param email - Email string to validate
 * @returns ValidationResult with isValid and optional error message
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

/**
 * Validates mobile number (10 digits)
 * @param mobileNumber - Mobile number string to validate
 * @param countryCode - Optional country code for context
 * @returns ValidationResult with isValid and optional error message
 */
export const validateMobileNumber = (mobileNumber: string, countryCode?: string): ValidationResult => {
  if (!mobileNumber || mobileNumber.trim().length === 0) {
    return { isValid: false, error: 'Mobile number is required' };
  }

  // Remove all non-digit characters
  const cleaned = mobileNumber.replace(/\D/g, '');

  if (cleaned.length === 0) {
    return { isValid: false, error: 'Mobile number is required' };
  }

  if (cleaned.length !== 10) {
    return { isValid: false, error: 'Enter 10 digits' };
  }

  // Check if all digits are the same (e.g., 1111111111)
  if (/^(\d)\1{9}$/.test(cleaned)) {
    return { isValid: false, error: 'Please enter a valid mobile number' };
  }

  return { isValid: true };
};

/**
 * Validates password
 * @param password - Password string to validate
 * @param minLength - Minimum length (default: 8)
 * @param requireUppercase - Require uppercase letter (default: false)
 * @param requireLowercase - Require lowercase letter (default: false)
 * @param requireNumber - Require number (default: false)
 * @param requireSpecialChar - Require special character (default: false)
 * @returns ValidationResult with isValid and optional error message
 */
export const validatePassword = (
  password: string,
  options?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumber?: boolean;
    requireSpecialChar?: boolean;
  }
): ValidationResult => {
  const {
    minLength = 8,
    requireUppercase = false,
    requireLowercase = false,
    requireNumber = false,
    requireSpecialChar = false,
  } = options || {};

  if (!password || password.length === 0) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < minLength) {
    return { isValid: false, error: `Password must be at least ${minLength} characters` };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (requireNumber && !/\d/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character' };
  }

  return { isValid: true };
};

/**
 * Validates email or phone number (10 digits)
 * @param input - Email or phone number string to validate
 * @returns ValidationResult with isValid and optional error message
 */
export const validateEmailOrPhone = (input: string): ValidationResult => {
  if (!input || input.trim().length === 0) {
    return { isValid: false, error: 'Email or phone number is required' };
  }

  // Check if it's a valid email
  const emailResult = validateEmail(input);
  if (emailResult.isValid) {
    return { isValid: true };
  }

  // Check if it's a valid 10-digit phone number
  const phoneResult = validateMobileNumber(input);
  if (phoneResult.isValid) {
    return { isValid: true };
  }

  return { isValid: false, error: 'Please enter a valid email or 10-digit phone number' };
};

/**
 * Validates name (full name)
 * @param name - Name string to validate
 * @param minLength - Minimum length (default: 2)
 * @param maxLength - Maximum length (default: 50)
 * @returns ValidationResult with isValid and optional error message
 */
export const validateName = (
  name: string,
  minLength: number = 2,
  maxLength: number = 50
): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Name is required' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < minLength) {
    return { isValid: false, error: `Name must be at least ${minLength} characters` };
  }

  if (trimmedName.length > maxLength) {
    return { isValid: false, error: `Name must be less than ${maxLength} characters` };
  }

  // Check if name contains only letters, spaces, hyphens, and apostrophes
  if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { isValid: true };
};

/**
 * Validates date of birth
 * @param dateOfBirth - Date string in YYYY-MM-DD format
 * @param minAge - Minimum age in years (default: 13)
 * @param maxAge - Maximum age in years (default: 120)
 * @returns ValidationResult with isValid and optional error message
 */
export const validateDateOfBirth = (
  dateOfBirth: string,
  minAge: number = 13,
  maxAge: number = 120
): ValidationResult => {
  if (!dateOfBirth || dateOfBirth.trim().length === 0) {
    return { isValid: false, error: 'Date of birth is required' };
  }

  // Parse the date
  const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = dateOfBirth.match(dateRegex);

  if (!match) {
    return { isValid: false, error: 'Please enter a valid date (YYYY-MM-DD)' };
  }

  const [, year, month, day] = match.map(Number);
  const birthDate = new Date(year, month - 1, day);

  // Check if date is valid
  if (
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day
  ) {
    return { isValid: false, error: 'Please enter a valid date' };
  }

  // Calculate age
  const today = new Date();
  const age = today.getFullYear() - year - (today.getMonth() < month - 1 || (today.getMonth() === month - 1 && today.getDate() < day) ? 1 : 0);

  if (age < minAge) {
    return { isValid: false, error: `You must be at least ${minAge} years old` };
  }

  if (age > maxAge) {
    return { isValid: false, error: 'Please enter a valid date of birth' };
  }

  // Check if date is in the future
  if (birthDate > today) {
    return { isValid: false, error: 'Date of birth cannot be in the future' };
  }

  return { isValid: true };
};

/**
 * Validates year
 * @param year - Year string to validate
 * @param minYear - Minimum year (default: 1950)
 * @param maxYear - Maximum year (default: current year)
 * @returns ValidationResult with isValid and optional error message
 */
export const validateYear = (
  year: string,
  minYear: number = 1950,
  maxYear?: number
): ValidationResult => {
  if (!year || year.trim().length === 0) {
    return { isValid: false, error: 'Year is required' };
  }

  if (!/^\d{4}$/.test(year.trim())) {
    return { isValid: false, error: 'Please enter a valid 4-digit year' };
  }

  const yearNum = Number(year);
  const currentYear = maxYear || new Date().getFullYear();

  if (yearNum < minYear || yearNum > currentYear) {
    return { isValid: false, error: `Year must be between ${minYear} and ${currentYear}` };
  }

  return { isValid: true };
};

/**
 * Validates that end year is after start year
 * @param startYear - Start year string
 * @param endYear - End year string
 * @returns ValidationResult with isValid and optional error message
 */
export const validateYearRange = (startYear: string, endYear: string): ValidationResult => {
  const startResult = validateYear(startYear);
  if (!startResult.isValid) {
    return startResult;
  }

  const endResult = validateYear(endYear);
  if (!endResult.isValid) {
    return endResult;
  }

  if (Number(endYear) < Number(startYear)) {
    return { isValid: false, error: 'End year must be after start year' };
  }

  return { isValid: true };
};

/**
 * Validates that end date is after start date
 * @param startDate - Start date string in YYYY-MM-DD format
 * @param endDate - End date string in YYYY-MM-DD format
 * @returns ValidationResult with isValid and optional error message
 */
export const validateDateRange = (startDate: string, endDate: string): ValidationResult => {
  const startResult = validateDateOfBirth(startDate, 0, 200);
  if (!startResult.isValid) {
    return { isValid: false, error: 'Please enter a valid start date' };
  }

  const endResult = validateDateOfBirth(endDate, 0, 200);
  if (!endResult.isValid) {
    return { isValid: false, error: 'Please enter a valid end date' };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) {
    return { isValid: false, error: 'End date must be after start date' };
  }

  return { isValid: true };
};

/**
 * Validates required field
 * @param value - Value to validate
 * @param fieldName - Name of the field for error message
 * @returns ValidationResult with isValid and optional error message
 */
export const validateRequired = (value: string, fieldName: string = 'Field'): ValidationResult => {
  if (!value || value.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true };
};

/**
 * Validates text length
 * @param text - Text to validate
 * @param minLength - Minimum length
 * @param maxLength - Maximum length
 * @param fieldName - Name of the field for error message
 * @returns ValidationResult with isValid and optional error message
 */
export const validateTextLength = (
  text: string,
  minLength: number,
  maxLength: number,
  fieldName: string = 'Field'
): ValidationResult => {
  if (!text || text.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const trimmedText = text.trim();

  if (trimmedText.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }

  if (trimmedText.length > maxLength) {
    return { isValid: false, error: `${fieldName} must be less than ${maxLength} characters` };
  }

  return { isValid: true };
};

/**
 * Helper function to clean mobile number (remove non-digits)
 * @param mobileNumber - Mobile number string
 * @returns Cleaned mobile number with only digits
 */
export const cleanMobileNumber = (mobileNumber: string): string => {
  return mobileNumber.replace(/\D/g, '');
};

/**
 * Helper function to format mobile number (adds spaces for readability)
 * @param mobileNumber - Mobile number string
 * @returns Formatted mobile number
 */
export const formatMobileNumber = (mobileNumber: string): string => {
  const cleaned = cleanMobileNumber(mobileNumber);
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`;
};
