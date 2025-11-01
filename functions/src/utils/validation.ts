/**
 * Validation Utilities
 */

import { https } from "firebase-functions/v2";

/**
 * Validates required fields in request data
 */
export function validateRequired<T>(
  data: T,
  requiredFields: (keyof T)[]
): void {
  const missingFields = requiredFields.filter((field) => !data[field]);
  
  if (missingFields.length > 0) {
    throw new https.HttpsError(
      "invalid-argument",
      `Missing required fields: ${missingFields.join(", ")}`
    );
  }
}

/**
 * Sanitizes user input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

