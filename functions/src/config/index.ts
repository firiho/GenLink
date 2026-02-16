/**
 * Configuration and Constants
 */

export const config = {
  // Region configuration - South Africa
  region: "africa-south1" as const,
  
  // Firestore collections
  collections: {
    users: "users",
    profiles: "profiles",
    organizations: "organizations",
    challenges: "challenges",
    teams: "teams",
    submissions: "submissions",
  },
};

/**
 * Supported currency codes.
 * Keep in sync with the frontend list in src/lib/currency.ts.
 */
export const SUPPORTED_CURRENCY_CODES = [
  "USD", "EUR", "GBP", "ZAR", "RWF", "KES", "NGN", "GHS", "UGX", "TZS",
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCY_CODES)[number];

export const DEFAULT_CURRENCY: CurrencyCode = "USD";

/**
 * Validate that a currency code is supported, falling back to the default.
 */
export function resolveCurrency(code: string | undefined | null): CurrencyCode {
  if (code && (SUPPORTED_CURRENCY_CODES as readonly string[]).includes(code)) {
    return code as CurrencyCode;
  }
  return DEFAULT_CURRENCY;
}

/**
 * Approximate exchange rates: how many units of each currency equal 1 USD.
 * Keep in sync with the frontend rates in src/lib/currency.ts.
 */
export const EXCHANGE_RATES_TO_USD: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  ZAR: 18.5,
  RWF: 1_400,
  KES: 154,
  NGN: 1_600,
  GHS: 16,
  UGX: 3_750,
  TZS: 2_650,
};

/**
 * Convert an amount from any supported currency to USD.
 */
export function convertToUSD(amount: number, fromCurrency: string | undefined | null): number {
  const code = resolveCurrency(fromCurrency);
  const rate = EXCHANGE_RATES_TO_USD[code];
  return amount / rate;
}

