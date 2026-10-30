import { formatPKR } from '../../utils/format.js';

export default function Price({ price, originalPrice, size = 'md' }) {
  const hasDiscount = originalPrice && Number(originalPrice) > Number(price);
  const main = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-base' : 'text-lg';
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <span className={`font-display font-bold text-brand-800 ${main}`}>{formatPKR(price)}</span>
      {hasDiscount && (
        <span className="text-sm text-ink/55 line-through">
          <span className="sr-only">Original price </span>
          {formatPKR(originalPrice)}
        </span>
      )}
    </div>
  );
}
