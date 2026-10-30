import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import ProductImage from '../ui/ProductImage.jsx';
import Price from '../ui/Price.jsx';
import QuantityStepper from '../ui/QuantityStepper.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { discountPercent } from '../../utils/format.js';

export default function ProductCard({ product }) {
  const { add, setQty, remove, getQty } = useCart();
  const qty = getQty(product.id);
  const out = !product.inStock;
  const pct = discountPercent(product.price, product.originalPrice);
  const max = Math.min(99, product.stock);

  return (
    <article className="card group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <Link to={`/products/${product.slug}`} className="relative block" aria-label={product.name}>
        <ProductImage
          src={product.image}
          alt={product.name}
          className={`aspect-square w-full p-2 ${out ? 'opacity-50' : ''}`}
        />
        {pct > 0 && !out && (
          <span className="absolute left-2 top-2 rounded-md bg-gold-500 px-2 py-1 text-xs font-bold text-ink">
            {pct}% off
          </span>
        )}
        {out && (
          <span className="absolute left-2 top-2 rounded-md bg-ink px-2 py-1 text-xs font-semibold text-white">
            Out of stock
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug sm:text-base">
          <Link to={`/products/${product.slug}`} className="hover:text-brand-700">{product.name}</Link>
        </h3>
        <p className="text-xs text-ink/60">{product.unit || '\u00A0'}</p>
        <Price price={product.price} originalPrice={product.originalPrice} size="sm" />
        {!out && product.stock <= 5 && <p className="text-xs font-medium text-red-700">Only {product.stock} left</p>}
        <div className="mt-auto pt-2">
          {out ? (
            <button type="button" className="btn-outline w-full" disabled>Out of stock</button>
          ) : qty > 0 ? (
            <div className="flex items-center justify-between gap-2">
              <QuantityStepper
                compact
                value={qty}
                max={max}
                onChange={(n) => (n < 1 ? remove(product.id) : setQty(product.id, n))}
                label={`Quantity of ${product.name}`}
              />
              <span className="text-xs font-medium text-brand-700">In cart</span>
            </div>
          ) : (
            <button type="button" className="btn-primary w-full whitespace-nowrap px-2" onClick={() => add(product, 1)}>
              <ShoppingCart className="hidden h-4 w-4 sm:block" aria-hidden="true" /> Add to cart
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
