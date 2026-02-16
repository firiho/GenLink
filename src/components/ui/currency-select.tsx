/**
 * CurrencySelect — reusable currency picker backed by the centralized currency config.
 *
 * Usage:
 *   <CurrencySelect value={currency} onChange={setCurrency} />
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CURRENCY_OPTIONS, SUPPORTED_CURRENCIES, DEFAULT_CURRENCY, type CurrencyCode } from '@/lib/currency';

interface CurrencySelectProps {
  value?: string;
  onChange: (value: CurrencyCode) => void;
  className?: string;
  disabled?: boolean;
}

export function CurrencySelect({
  value = DEFAULT_CURRENCY,
  onChange,
  className,
  disabled = false,
}: CurrencySelectProps) {
  const selected = SUPPORTED_CURRENCIES[value as CurrencyCode];

  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as CurrencyCode)}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <span className="truncate">
          {selected ? selected.code : <SelectValue placeholder="Currency" />}
        </span>
      </SelectTrigger>
      <SelectContent>
        {CURRENCY_OPTIONS.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            <span className="inline-flex items-center gap-2">
              <span className="font-mono text-xs w-8 shrink-0 text-muted-foreground">{c.symbol}</span>
              <span>{c.code}</span>
              <span className="text-muted-foreground text-xs">— {c.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
