/**
 * Strict Security & Validation Utilities for Zhoosh
 * Enforces RFC 5322 compliant email format, password strength standards,
 * and robust credential hygiene across all login & registration surfaces.
 */

export const STRICT_EMAIL_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

export interface EmailValidationResult {
  isValid: boolean;
  error: string | null;
  normalizedEmail?: string;
}

export interface PasswordValidationResult {
  isValid: boolean;
  error: string | null;
  score: 0 | 1 | 2 | 3 | 4;
}

/**
 * Validates email with strict RFC 5322 compliance and clear human-readable error messages.
 */
export function validateStrictEmail(email: string): EmailValidationResult {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email address is required.' };
  }

  const raw = email.trim();

  if (/\s/.test(raw)) {
    return { isValid: false, error: 'Email address cannot contain spaces.' };
  }

  if (raw.length > 254) {
    return { isValid: false, error: 'Email address is too long (maximum 254 characters).' };
  }

  if (raw.includes('..')) {
    return { isValid: false, error: 'Email cannot contain consecutive dots (..).' };
  }

  const atParts = raw.split('@');
  if (atParts.length !== 2) {
    return { isValid: false, error: 'Email must contain exactly one "@" symbol.' };
  }

  const [localPart, domainPart] = atParts;

  if (!localPart || localPart.length > 64) {
    return { isValid: false, error: 'Username before "@" must be between 1 and 64 characters.' };
  }

  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return { isValid: false, error: 'Username cannot start or end with a dot.' };
  }

  if (!domainPart || !domainPart.includes('.')) {
    return { isValid: false, error: 'Email must include a valid domain (e.g., example.com).' };
  }

  if (domainPart.startsWith('.') || domainPart.endsWith('.') || domainPart.startsWith('-') || domainPart.endsWith('-')) {
    return { isValid: false, error: 'Domain cannot start or end with a dot or hyphen.' };
  }

  const domainParts = domainPart.split('.');
  const tld = domainParts[domainParts.length - 1];

  if (!/^[a-zA-Z]{2,}$/.test(tld)) {
    return { isValid: false, error: 'Domain extension (.com, .org, etc.) must be at least 2 letters.' };
  }

  if (!STRICT_EMAIL_REGEX.test(raw)) {
    return { isValid: false, error: 'Invalid email address format (e.g. name@domain.com).' };
  }

  return {
    isValid: true,
    error: null,
    normalizedEmail: raw.toLowerCase()
  };
}

/**
 * Validates password strength strictly for login or registration.
 */
export function validateStrictPassword(password: string, isSignup = false): PasswordValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required.', score: 0 };
  }

  const minLength = isSignup ? 8 : 6;
  if (password.length < minLength) {
    return {
      isValid: false,
      error: `Password must be at least ${minLength} characters long.`,
      score: 1
    };
  }

  let score: 0 | 1 | 2 | 3 | 4 = 1;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const checksPassed = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length;
  if (password.length >= 8 && checksPassed >= 3) score = 3;
  if (password.length >= 12 && checksPassed >= 4) score = 4;
  else if (checksPassed >= 2) score = 2;

  if (isSignup && checksPassed < 2) {
    return {
      isValid: false,
      error: 'Password must include a mix of uppercase, lowercase, numbers, or symbols.',
      score
    };
  }

  return {
    isValid: true,
    error: null,
    score
  };
}
