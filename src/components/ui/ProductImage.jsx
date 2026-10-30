import { useEffect, useState } from 'react';
import { ShoppingBasket } from 'lucide-react';

export default function ProductImage({ src, alt, className = '', eager = false }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt ? `${alt} (image not available)` : 'Image not available'}
        className={`flex items-center justify-center bg-cream-100 text-brand-300 ${className}`}
      >
        <ShoppingBasket className="h-1/3 w-1/3" aria-hidden="true" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt || ''}
      width="600"
      height="600"
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`bg-white object-contain ${className}`}
    />
  );
}
