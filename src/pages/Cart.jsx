import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBasket, Trash2 } from 'lucide-react';
import Seo from '../components/ui/Seo.jsx';
import ProductImage from '../components/ui/ProductImage.jsx';
import QuantityStepper from '../components/ui/QuantityStepper.jsx';
import Price from '../components/ui/Price.jsx';
import { EmptyState } from '../components/ui/States.jsx';
import { api } from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { estimateDelivery, formatPKR } from '../utils/format.js';

export function OrderSummary({ subtotal, savings, deliveryFee, total, estimate = false }) {
  return (
    <dl className="space-y-3 text-sm">
      <div className="flex items-baseline gap-2"><dt>Subtotal</dt><span className="leader-dots" aria-hidden="true" /><dd className="font-semibold tabular-nums">{formatPKR(subtotal)}</dd></div>
      {savings > 0 && (
        <div className="flex items-baseline gap-2 text-brand-700"><dt>Included savings</dt><span className="leader-dots" aria-hidden="true" /><dd className="font-semibold tabular-nums">{formatPKR(savings)}</dd></div>
      )}
      <div className="flex items-baseline gap-2"><dt>Delivery{estimate ? ' (estimate)' : ''}</dt><span className="leader-dots" aria-hidden="true" /><dd className="font-semibold tabular-nums">{deliveryFee > 0 ? formatPKR(deliveryFee) : 'Free'}</dd></div>
      <div className="flex items-baseline gap-2 border-t border-ink/15 pt-3 text-base"><dt className="font-bold">Total</dt><span className="leader-dots" aria-hidden="true" /><dd className="font-display text-xl font-extrabold tabular-nums text-brand-800">{formatPKR(total)}</dd></div>
    </dl>
  );
}

export default function Cart() {
  const { items, subtotal, savings, setQty, remove, clear, applyQuote } = useCart();
  const { settings } = useStore();
  const [sync, setSync] = useState({ status: 'idle', notices: [], error: null });

  // Re-check prices and stock with the server once when the cart opens.
  useEffect(() => {
    if (!items.length) return undefined;
    const ctrl = new AbortController();
    setSync({ status: 'loading', notices: [], error: null });
    api.quote({ items: items.map((i) => ({ id: i.id, qty: i.qty })) }, { signal: ctrl.signal })
      .then((q) => setSync({ status: 'ready', notices: applyQuote(q.lines), error: null }))
      .catch((error) => { if (error.name !== 'AbortError') setSync({ status: 'error', notices: [], error }); });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deliveryFee = estimateDelivery(subtotal, settings);
  const total = subtotal + deliveryFee;
  const minOrder = Number(settings.minOrderAmount) || 0;
  const belowMin = minOrder > 0 && subtotal < minOrder;

  if (items.length === 0) {
    return (
      <div className="container-x py-16">
        <Seo title="Your cart" noindex />
        <EmptyState title="Your cart is empty" text="Add a few products and they will show up here." actionLabel="Start shopping" actionTo="/shop" />
      </div>
    );
  }

  return (
    <div className="container-x py-8">
      <Seo title="Your cart" noindex />
      <div className="mb-6 flex items-end justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-brand-900">Your cart</h1>
        <button type="button" onClick={() => { if (window.confirm('Remove all items from your cart?')) clear(); }} className="btn-ghost text-red-700 hover:bg-red-50">
          <Trash2 className="h-4 w-4" aria-hidden="true" /> Clear cart
        </button>
      </div>

      {sync.status === 'loading' && <p className="mb-4 text-sm text-ink/60" role="status">Checking latest prices and stock…</p>}
      {sync.status === 'error' && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-900">
          Could not refresh prices and stock ({sync.error.message}) Prices are re-checked again when you place the order.
        </p>
      )}
      {sync.notices.length > 0 && (
        <ul role="alert" className="mb-4 space-y-1 rounded-lg bg-gold-400/25 p-3 text-sm">
          {sync.notices.map((n) => <li key={n}>{n}</li>)}
        </ul>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <ul className="space-y-3">
          {items.map(({ id, qty, snap }) => (
            <li key={id} className="card flex gap-4 p-3 sm:p-4">
              <Link to={`/products/${snap.slug}`} className="shrink-0" aria-label={snap.name}>
                <ProductImage src={snap.image} alt={snap.name} className="h-20 w-20 rounded-lg sm:h-24 sm:w-24" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-sans text-base font-semibold leading-snug"><Link to={`/products/${snap.slug}`} className="hover:text-brand-700">{snap.name}</Link></h2>
                    {snap.unit && <p className="text-sm text-ink/60">{snap.unit}</p>}
                  </div>
                  <button type="button" onClick={() => remove(id)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-ink/60 hover:bg-red-50 hover:text-red-700" aria-label={`Remove ${snap.name}`}>
                    <Trash2 className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                  <QuantityStepper value={qty} max={Math.min(99, snap.stock || 99)} onChange={(n) => setQty(id, n)} label={`Quantity of ${snap.name}`} compact />
                  <div className="text-right">
                    <Price price={snap.price * qty} originalPrice={snap.originalPrice ? snap.originalPrice * qty : null} size="sm" />
                    {qty > 1 && <p className="text-xs text-ink/55">{formatPKR(snap.price)} each</p>}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="card h-fit p-5 lg:sticky lg:top-28" aria-label="Order summary">
          <h2 className="mb-4 text-lg font-bold">Order summary</h2>
          <OrderSummary subtotal={subtotal} savings={savings} deliveryFee={deliveryFee} total={total} estimate />
          <p className="mt-3 text-xs text-ink/60">The final delivery fee and total are confirmed by the store when you place the order.</p>
          {belowMin && (
            <p role="alert" className="mt-3 rounded-lg bg-gold-400/25 p-3 text-sm">
              Minimum order is {formatPKR(minOrder)}. Add {formatPKR(minOrder - subtotal)} more to check out.
            </p>
          )}
          {belowMin ? (
            <button type="button" className="btn-primary mt-4 w-full" disabled>Proceed to checkout</button>
          ) : (
            <Link to="/checkout" className="btn-primary mt-4 w-full">Proceed to checkout</Link>
          )}
          <Link to="/shop" className="btn-ghost mt-2 w-full"><ShoppingBasket className="h-4 w-4" aria-hidden="true" /> Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
