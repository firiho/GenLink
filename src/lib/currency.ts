/**
 * Centralized Currency Configuration
 *
 * Single source of truth for all currency-related constants,
 * formatting, and utilities used across the platform.
 */

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'ZAR' | 'RWF' | 'KES' | 'NGN' | 'GHS' | 'UGX' | 'TZS';

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  locale: string;
  /** Number of decimal places (0 for currencies like RWF, UGX, TZS) */
  decimals: number;
}

/**
 * All supported currencies on the platform.
 * Add new currencies here — they'll automatically appear in all dropdowns and formatters.
 */
export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', name: 'US Dollar',           symbol: '$',   locale: 'en-US',   decimals: 2 },
  EUR: { code: 'EUR', name: 'Euro',                symbol: '€',   locale: 'de-DE',   decimals: 2 },
  GBP: { code: 'GBP', name: 'British Pound',       symbol: '£',   locale: 'en-GB',   decimals: 2 },
  ZAR: { code: 'ZAR', name: 'South African Rand',  symbol: 'R',   locale: 'en-ZA',   decimals: 2 },
  RWF: { code: 'RWF', name: 'Rwandan Franc',       symbol: 'RWF', locale: 'rw-RW',   decimals: 0 },
  KES: { code: 'KES', name: 'Kenyan Shilling',     symbol: 'KSh', locale: 'en-KE',   decimals: 2 },
  NGN: { code: 'NGN', name: 'Nigerian Naira',      symbol: '₦',   locale: 'en-NG',   decimals: 2 },
  GHS: { code: 'GHS', name: 'Ghanaian Cedi',       symbol: 'GH₵', locale: 'en-GH',   decimals: 2 },
  UGX: { code: 'UGX', name: 'Ugandan Shilling',    symbol: 'USh', locale: 'en-UG',   decimals: 0 },
  TZS: { code: 'TZS', name: 'Tanzanian Shilling',  symbol: 'TSh', locale: 'en-TZ',   decimals: 0 },
};

/** Default currency used when none is specified */
export const DEFAULT_CURRENCY: CurrencyCode = 'USD';

/** Ordered list for dropdown selectors */
export const CURRENCY_OPTIONS: CurrencyConfig[] = Object.values(SUPPORTED_CURRENCIES);

// ---------------------------------------------------------------------------
// Exchange rates (approximate, relative to 1 USD)
// Update these periodically to keep conversions reasonable.
// ---------------------------------------------------------------------------

/**
 * How many units of each currency equal 1 USD.
 * e.g. 1 USD ≈ 1,400 RWF, 1 USD ≈ 18.5 ZAR, etc.
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
 * Convert an amount from one currency to USD.
 * Useful for normalizing values across currencies (e.g. filtering).
 */
export function convertToUSD(amount: number, fromCurrency: string = DEFAULT_CURRENCY): number {
  const rate = EXCHANGE_RATES_TO_USD[fromCurrency as CurrencyCode] ?? 1;
  return amount / rate;
}

/**
 * Convert a USD amount to another currency.
 */
export function convertFromUSD(amountUSD: number, toCurrency: string = DEFAULT_CURRENCY): number {
  const rate = EXCHANGE_RATES_TO_USD[toCurrency as CurrencyCode] ?? 1;
  return amountUSD * rate;
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

/**
 * Format a numeric amount as a currency string.
 *
 * @param amount   - The numeric value to format
 * @param currency - ISO 4217 currency code (defaults to DEFAULT_CURRENCY)
 * @returns Formatted string, e.g. "$1,234.56" or "FRw 1,234"
 */
export function formatCurrency(amount: number, currency: string = DEFAULT_CURRENCY): string {
  const config = SUPPORTED_CURRENCIES[currency as CurrencyCode];
  const locale = config?.locale ?? 'en-US';
  const decimals = config?.decimals ?? 2;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Compact currency format for stats / dashboard cards.
 * e.g. "$1.2k", "$3.4M", "R 15k"
 *
 * @param amount   - The numeric value
 * @param currency - ISO 4217 currency code (defaults to DEFAULT_CURRENCY)
 */
export function formatCompactCurrency(amount: number, currency: string = DEFAULT_CURRENCY): string {
  const config = SUPPORTED_CURRENCIES[currency as CurrencyCode];
  const symbol = config?.symbol ?? '$';

  if (amount >= 1_000_000) {
    return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${symbol}${(amount / 1_000).toFixed(1)}k`;
  }
  return `${symbol}${amount.toLocaleString()}`;
}

/**
 * Get just the symbol for a currency code.
 * Useful for input field prefixes.
 */
export function getCurrencySymbol(currency: string = DEFAULT_CURRENCY): string {
  return SUPPORTED_CURRENCIES[currency as CurrencyCode]?.symbol ?? '$';
}

/**
 * Get the appropriate `padding-left` style for an input
 * that uses the currency symbol as an inline prefix.
 *
 * Single-char symbols ($, €, £, ₦, R) → narrow padding
 * Multi-char symbols (FRw, KSh, GH₵, USh, TSh) → wider padding
 */
export function getCurrencyInputPadding(currency: string = DEFAULT_CURRENCY): string {
  const symbol = getCurrencySymbol(currency);
  if (symbol.length <= 1) return 'pl-8';    // 2rem – fits $ € £ ₦
  if (symbol.length <= 2) return 'pl-10';   // 2.5rem – fits GH₵, R (ZAR shows as R)
  return 'pl-14';                            // 3.5rem – fits FRw, KSh, USh, TSh
}

/**
 * Validate whether a string is a supported currency code.
 */
export function isSupportedCurrency(code: string): code is CurrencyCode {
  return code in SUPPORTED_CURRENCIES;
}
