import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Seo from '../components/ui/Seo.jsx';
import { EmptyState } from '../components/ui/States.jsx';
import { OrderSummary } from './Cart.jsx';
import { api, ApiError, dataSource } from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { estimateDelivery, formatPKR, newRequestId } from '../utils/format.js';
import { normalizePkPhone, validateCheckout } from '../utils/validation.js';
import { buildOrderMessage, buildWhatsAppUrl } from '../utils/whatsapp.js';
import { saveOrder } from '../utils/orders.js';

const EMPTY = { name: '', phone: '', email: '', city: '', area: '', address: '', notes: '' };

function Field({ id, label, error, required, children, hint }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}{required && <span className="text-red-700"> *</span>}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink/55">{hint}</p>}
      {error && <p id={`${id}-error`} className="field-error">{error}</p>}
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, applyQuote, clear, subtotal, savings } = useCart();
  const { settings } = useStore();
  const [form, setForm] = useState(EMPTY);
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState(null);
  const [notices, setNotices] = useState([]);
  const [quoteNonce, setQuoteNonce] = useState(0);
  const requestId = useRef(newRequestId());
  const submitted = useRef(false);

  const cities = settings.supportedCities || [];
  const itemsKey = items.map((i) => `${i.id}:${i.qty}`).join(',');

  // Ask the server for the real totals whenever the cart or the city changes.
  useEffect(() => {
    if (!items.length || submitted.current) return undefined;
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      api.quote({ items: items.map((i) => ({ id: i.id, qty: i.qty })), city: form.city.trim() }, { signal: ctrl.signal })
        .then((q) => {
          const n = applyQuote(q.lines);
          if (n.length) setNotices((prev) => [...new Set([...prev, ...n])]);
          setQuote(q);
          setQuoteError(null);
        })
        .catch((e) => { if (e.name !== 'AbortError') setQuoteError(e); });
    }, 250);
    return () => { clearTimeout(t); ctrl.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey, form.city, quoteNonce]);

  if (submitted.current) return null;

  if (items.length === 0) {
    return (
      <div className="container-x py-16">
        <Seo title="Checkout" noindex />
        <EmptyState title="Your cart is empty" text="Add products to your cart before checking out." actionLabel="Browse products" actionTo="/shop" />
      </div>
    );
  }

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  const deliveryFee = quote ? quote.deliveryFee : estimateDelivery(subtotal, settings);
  const shownSubtotal = quote ? quote.subtotal : subtotal;
  const shownSavings = quote ? quote.savings : savings;
  const total = quote ? quote.total : shownSubtotal + deliveryFee;
  const minOrder = Number(settings.minOrderAmount) || 0;
  const belowMin = minOrder > 0 && shownSubtotal < minOrder;
  const hasIssues = Boolean(quote && quote.issues && quote.issues.length);
  const codOff = settings.codEnabled === false;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitError(null);
    const v = validateCheckout(form, { supportedCities: cities });
    setErrors(v);
    if (Object.keys(v).length) {
      const first = Object.keys(v)[0];
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    if (belowMin) { setSubmitError(new ApiError(`The minimum order is ${formatPKR(minOrder)}.`, 'MIN_ORDER')); return; }
    if (codOff) { setSubmitError(new ApiError('No payment method is available right now. Please contact the store.', 'PAYMENT_UNAVAILABLE')); return; }

    setSubmitting(true);
    try {
      const { order } = await api.createOrder({
        requestId: requestId.current,
        website: honeypot,
        customer: {
          name: form.name.trim(),
          phone: normalizePkPhone(form.phone),
          email: form.email.trim(),
          city: form.city.trim(),
          area: form.area.trim(),
          address: form.address.trim(),
          notes: form.notes.trim(),
        },
        items: items.map((i) => ({ id: i.id, qty: i.qty })),
        paymentMethod: 'Cash on Delivery',
      });

      // Only now that the order is saved do we open WhatsApp.
      saveOrder(order);
      let opened = false;
      const url = buildWhatsAppUrl(settings.whatsappNumber, buildOrderMessage(order, settings.storeName));
      if (url) {
        try {
          const w = window.open(url, '_blank');
          if (w) { w.opener = null; opened = true; }
        } catch { opened = false; }
      }
      submitted.current = true;
      navigate(`/order-confirmation/${encodeURIComponent(order.orderId)}`, { replace: true, state: { opened } });
      clear();
    } catch (err) {
      if (err.code === 'VALIDATION' && err.details?.fields) {
        setErrors(err.details.fields);
      }
      if (err.code === 'STOCK_UNAVAILABLE') setQuoteNonce((n) => n + 1);
      setSubmitError(err);
      setSubmitting(false);
      document.getElementById('submit-error')?.focus();
    }
  };

  const inputCls = (k) => `input ${errors[k] ? 'input-error' : ''}`;
  const aria = (k) => ({ 'aria-invalid': errors[k] ? 'true' : undefined, 'aria-describedby': errors[k] ? `f-${k}-error` : undefined });

  return (
    <div className="container-x py-8">
      <Seo title="Checkout" noindex />
      <h1 className="mb-6 text-3xl font-extrabold text-brand-900">Checkout</h1>

      <form onSubmit={onSubmit} noValidate className="grid gap-8 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-6">
          <section className="card p-5 sm:p-6" aria-labelledby="h-contact">
            <h2 id="h-contact" className="mb-4 text-lg font-bold">Your details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="f-name" label="Full name" required error={errors.name}>
                <input id="f-name" className={inputCls('name')} value={form.name} onChange={set('name')} autoComplete="name" maxLength={80} {...aria('name')} />
              </Field>
              <Field id="f-phone" label="Phone number" required error={errors.phone} hint="Mobile number, e.g. 0300 1234567">
                <input id="f-phone" type="tel" inputMode="tel" className={inputCls('phone')} value={form.phone} onChange={set('phone')} autoComplete="tel" maxLength={20} {...aria('phone')} />
              </Field>
              <Field id="f-email" label="Email (optional)" error={errors.email}>
                <input id="f-email" type="email" className={inputCls('email')} value={form.email} onChange={set('email')} autoComplete="email" maxLength={120} {...aria('email')} />
              </Field>
              <Field id="f-city" label="City" required error={errors.city}>
                {cities.length > 0 ? (
                  <select id="f-city" className={inputCls('city')} value={form.city} onChange={set('city')} {...aria('city')}>
                    <option value="">Select your city</option>
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <input id="f-city" className={inputCls('city')} value={form.city} onChange={set('city')} autoComplete="address-level2" maxLength={60} {...aria('city')} />
                )}
              </Field>
              <Field id="f-area" label="Area or neighbourhood" required error={errors.area}>
                <input id="f-area" className={inputCls('area')} value={form.area} onChange={set('area')} maxLength={80} {...aria('area')} />
              </Field>
              <div className="sm:col-span-2">
                <Field id="f-address" label="Complete delivery address" required error={errors.address}>
                  <textarea id="f-address" rows={3} className={inputCls('address')} value={form.address} onChange={set('address')} autoComplete="street-address" maxLength={300} {...aria('address')} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field id="f-notes" label="Order notes (optional)" error={errors.notes}>
                  <textarea id="f-notes" rows={2} className={inputCls('notes')} value={form.notes} onChange={set('notes')} maxLength={500} {...aria('notes')} />
                </Field>
              </div>
              {/* Honeypot: hidden from people, filled in by simple bots */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>Website<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} /></label>
              </div>
            </div>
          </section>

          <section className="card p-5 sm:p-6" aria-labelledby="h-pay">
            <h2 id="h-pay" className="mb-3 text-lg font-bold">Payment method</h2>
            {codOff ? (
              <p className="text-sm text-red-800">Cash on delivery is not available right now. Please contact the store.</p>
            ) : (
              <label className="flex items-start gap-3 rounded-lg border-2 border-brand-600 bg-brand-50 p-4">
                <input type="radio" name="pay" checked readOnly className="mt-1 h-4 w-4 accent-brand-700" />
                <span>
                  <span className="block font-semibold">Cash on delivery</span>
                  <span className="text-sm text-ink/70">Pay the rider when your order arrives. No online payment is taken on this website.</span>
                </span>
              </label>
            )}
          </section>
        </div>

        <aside className="card h-fit p-5 lg:sticky lg:top-28" aria-label="Order summary">
          <h2 className="mb-4 text-lg font-bold">Order summary</h2>
          <ul className="mb-4 space-y-2 border-b border-ink/10 pb-4 text-sm">
            {items.map((i) => (
              <li key={i.id} className="flex items-baseline gap-2">
                <span className="min-w-0">{i.snap.name}{i.snap.unit ? <span className="text-ink/55"> · {i.snap.unit}</span> : null} × {i.qty}</span>
                <span className="leader-dots" aria-hidden="true" />
                <span className="font-semibold tabular-nums">{formatPKR(i.snap.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <OrderSummary subtotal={shownSubtotal} savings={shownSavings} deliveryFee={deliveryFee} total={total} estimate={!quote} />
          <p className="mt-3 text-xs text-ink/60">Prices, stock and delivery are checked again by the store when you place the order.</p>

          {notices.length > 0 && (
            <ul role="alert" className="mt-3 space-y-1 rounded-lg bg-gold-400/25 p-3 text-sm">{notices.map((n) => <li key={n}>{n}</li>)}</ul>
          )}
          {quote && quote.cityOk === false && <p role="alert" className="mt-3 text-sm text-red-800">We do not deliver to this city yet.</p>}
          {belowMin && <p role="alert" className="mt-3 text-sm text-red-800">Minimum order is {formatPKR(minOrder)}.</p>}
          {quoteError && <p role="alert" className="mt-3 text-sm text-red-800">{quoteError.message}</p>}

          {submitError && (
            <div id="submit-error" tabIndex={-1} role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-900">
              <p className="font-semibold">Your order was not placed.</p>
              <p>{submitError.message}</p>
              {submitError.details?.issues?.length > 0 && (
                <ul className="mt-1 list-disc pl-5">{submitError.details.issues.map((i) => <li key={i.id}>{i.message}</li>)}</ul>
              )}
              {['NETWORK', 'TIMEOUT', 'BAD_RESPONSE'].includes(submitError.code) && (
                <p className="mt-1">If you tap “Place order” again, we make sure it is not saved twice.</p>
              )}
            </div>
          )}

          <button type="submit" className="btn-primary mt-4 w-full" disabled={submitting || hasIssues || belowMin || codOff}>
            {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Placing order…</>) : 'Place order'}
          </button>
          {dataSource === 'local' && (
            <p className="mt-3 rounded-lg bg-gold-400/25 p-3 text-xs">No Google Sheet is connected yet, so this order is sent through WhatsApp only and is not saved to a spreadsheet.</p>
          )}
          <p className="mt-2 text-center text-xs text-ink/60">
            Next, WhatsApp opens with your order ready to send. <Link to="/cart" className="underline">Edit cart</Link>
          </p>
        </aside>
      </form>
    </div>
  );
}
