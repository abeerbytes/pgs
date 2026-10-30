import { Minus, Plus } from 'lucide-react';

export default function QuantityStepper({ value, min = 1, max = 99, onChange, label = 'Quantity', compact = false }) {
  const size = compact ? 'h-9 w-9' : 'h-11 w-11';
  return (
    <div className="inline-flex items-center rounded-lg border border-ink/20 bg-white" role="group" aria-label={label}>
      <button
        type="button"
        className={`${size} inline-flex items-center justify-center rounded-l-lg text-brand-800 hover:bg-brand-50 disabled:opacity-40`}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className="min-w-[2.5rem] text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={`${size} inline-flex items-center justify-center rounded-r-lg text-brand-800 hover:bg-brand-50 disabled:opacity-40`}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
