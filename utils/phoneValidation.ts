const FAKE_PATTERNS = [
  /^(\d)\1{9}$/,
  /^1234567890$/,
  /^9876543210$/,
  /^(\d{2})\1{4}$/,
  /^(\d{3})\1{2}\d$/,
  /^(\d{4})\1\d{2}$/,
  /^0{10}$/,
];

function isSequential(num: string): boolean {
  for (let i = 1; i < num.length; i++) {
    if (parseInt(num[i]) !== parseInt(num[i - 1]) + 1) return false;
  }
  return true;
}

function isRepeatedPattern(num: string): boolean {
  for (let len = 1; len <= 5; len++) {
    const pattern = num.slice(0, len);
    if (num.length % len === 0 && pattern.repeat(num.length / len) === num && len < num.length) return true;
  }
  return false;
}

export interface PhoneValidationResult {
  isValid: boolean;
  error: string;
}

export function validateIndianPhoneNumber(phone: string): PhoneValidationResult {
  const clean = phone.replace(/\s/g, "").replace(/^\+91/, "").replace(/^91/, "");

  if (!/^\d+$/.test(clean)) {
    return { isValid: false, error: "Must contain only numbers" };
  }
  if (clean.length !== 10) {
    return { isValid: false, error: "Must be exactly 10 digits" };
  }
  if (!/^[6-9]/.test(clean)) {
    return { isValid: false, error: "Must start with 6, 7, 8, or 9" };
  }
  if (isSequential(clean)) {
    return { isValid: false, error: "Invalid number (sequential digits)" };
  }
  if (isRepeatedPattern(clean)) {
    return { isValid: false, error: "Invalid number (repeated pattern)" };
  }
  for (const pattern of FAKE_PATTERNS) {
    if (pattern.test(clean)) {
      return { isValid: false, error: "Invalid number (fake number detected)" };
    }
  }

  return { isValid: true, error: "" };
}
