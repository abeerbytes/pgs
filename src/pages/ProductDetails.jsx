import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ShoppingCart, Truck, Undo2, Zap } from 'lucide-react';
import Seo from '../components/ui/Seo.jsx';
import ProductImage from '../components/ui/ProductImage.jsx';
import Price from '../components/ui/Price.jsx';
import QuantityStepper from '../components/ui/QuantityStepper.jsx';
import ProductGrid from '../components/products/ProductGrid.jsx';
import { ErrorState, PageSpinner } from '../components/ui/States.jsx';
import NotFound from './NotFound.jsx';
import { api } from '../services/api.js';
import useProducts from '../hooks/useProducts.js';
import { useCart } from '../context/CartContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { discountPercent, formatPKR } from '../utils/format.js';

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { settings } = useStore();
  const [state, setState] = useState({ status: 'loading', product: null, error: null });
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const [added, setAdded] = useState(false);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    setState({ status: 'loading', product: null, error: null });
    setQty(1); setActive(0); setAdded(false);
    api.getProduct(slug, { signal: ctrl.signal })
      .then((product) => setState({ status: 'ready', product, error: null }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState({ status: error.code === 'NOT_FOUND' ? 'notfound' : 'error', product: null, error });
      });
    return () => ctrl.abort();
  }, [slug, nonce]);

  const product = state.product;
  const relatedQuery = useMemo(
    () => ({ category: product?.categorySlug, exclude: product?.id, pageSize: 4, sort: 'featured' }),
    [product],
  );
  const related = useProducts(relatedQuery, Boolean(product?.categorySlug));

  const jsonLd = useMemo(() => {
    if (!product) return undefined;
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      sku: product.sku || undefined,
      description: product.description || undefined,
      image: product.images?.length ? product.images : undefined,
      brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'PKR',
        price: product.price,
        availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
    };
  }, [product]);

  if (state.status === 'loading') return <PageSpinner />;
  if (state.status === 'notfound') return <NotFound title="Product not found" text="This product may have been removed or is no longer available." />;
  if (state.status === 'error') {
    return <div className="container-x py-12"><ErrorState error={state.error} onRetry={() => setNonce((n) => n + 1)} title="Could not load this product" /></div>;
  }

  const max = Math.min(99, product.stock);
  const pct = discountPercent(product.price, product.originalPrice);
  const images = product.images?.length ? product.images : [''];
  const related4 = related.status === 'ready' ? related.items.filter((p) => p.id !== product.id).slice(0, 4) : [];
  const fee = Number(settings.deliveryFee) || 0;
  const free = Number(settings.freeDeliveryThreshold) || 0;

  const addToCart = () => { add(product, qty); setAdded(true); };

  return (
    <div className="container-x py-8">
      <Seo
        title={product.name}
        description={product.description ? product.description.slice(0, 155) : `Buy ${product.name} online from ${settings.storeName}.`}
        image={images[0] || undefined}
        jsonLd={jsonLd}
      />

      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-ink/70">
        <ol className="flex flex-wrap items-center gap-1">
          <li><Link to="/" className="hover:underline">Home</Link></li>
          <li aria-hidden="true">/</li>
          {product.categorySlug && (
            <>
              <li><Link to={`/category/${product.categorySlug}`} className="hover:underline">{product.categoryName}</Link></li>
              <li aria-hidden="true">/</li>
            </>
          )}
          <li aria-current="page" className="font-semibold text-ink">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="relative overflow-hidden rounded-xl border border-ink/10 bg-white">
            <ProductImage src={images[active]} alt={product.name} eager className="aspect-square w-full" />
            {pct > 0 && product.inStock && (
              <span className="absolute left-3 top-3 rounded-md bg-gold-500 px-2.5 py-1 text-sm font-bold">{pct}% off</span>
            )}
          </div>
          {images.length > 1 && (
            <ul className="mt-3 flex gap-2 overflow-x-auto" aria-label="Product images">
              {images.map((src, i) => (
                <li key={src + i}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Show image ${i + 1}`}
                    aria-current={i === active}
                    className={`block overflow-hidden rounded-lg border-2 ${i === active ? 'border-brand-700' : 'border-transparent'}`}
                  >
                    <ProductImage src={src} alt="" className="h-16 w-16" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          {product.brand && <p className="text-sm font-semibold text-brand-600">{product.brand}</p>}
          <h1 className="mt-1 text-3xl font-extrabold text-brand-900">{product.name}</h1>
          <p className="mt-1 text-ink/65">
            {[product.unit, product.categoryName, product.sku && `SKU ${product.sku}`].filter(Boolean).join(' · ')}
          </p>

          <div className="mt-5"><Price price={product.price} originalPrice={product.originalPrice} size="lg" /></div>
          {pct > 0 && <p className="mt-1 text-sm font-medium text-brand-700">You save {formatPKR(product.originalPrice - product.price)} ({pct}%)</p>}

          <p className={`mt-4 text-sm font-semibold ${product.inStock ? 'text-brand-700' : 'text-red-700'}`}>
            {!product.inStock ? 'Out of stock' : product.stock <= 5 ? `Only ${product.stock} left in stock` : 'In stock'}
          </p>

          {product.description && <p className="mt-5 max-w-prose whitespace-pre-line text-ink/80">{product.description}</p>}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {product.inStock ? (
              <>
                <QuantityStepper value={qty} max={max} onChange={(n) => setQty(Math.max(1, Math.min(max, n)))} label={`Quantity of ${product.name}`} />
                <button type="button" className="btn-primary px-6" onClick={addToCart}>
                  <ShoppingCart className="h-4 w-4" aria-hidden="true" /> Add to cart
                </button>
                <button type="button" className="btn-gold px-6" onClick={() => { add(product, qty); navigate('/checkout'); }}>
                  <Zap className="h-4 w-4" aria-hidden="true" /> Buy now
                </button>
              </>
            ) : (
              <button type="button" className="btn-outline" disabled>Out of stock</button>
            )}
          </div>
          {added && (
            <p role="status" className="mt-3 text-sm font-medium text-brand-700">
              Added to your cart. <Link to="/cart" className="underline">View cart</Link>
            </p>
          )}

          <ul className="mt-8 space-y-3 rounded-xl bg-cream-100 p-4 text-sm">
            <li className="flex gap-3">
              <Truck className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" aria-hidden="true" />
              <span>
                {fee > 0 ? `Delivery fee ${formatPKR(fee)}` : 'Delivery fee confirmed at checkout'}
                {free > 0 ? `, free on orders of ${formatPKR(free)} or more` : ''}.{' '}
                <Link to="/delivery-policy" className="font-semibold underline">Delivery policy</Link>
              </span>
            </li>
            <li className="flex gap-3">
              <Undo2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" aria-hidden="true" />
              <span>Problem with an item? <Link to="/return-policy" className="font-semibold underline">Read the return policy</Link>.</span>
            </li>
          </ul>
        </div>
      </div>

      {related4.length > 0 && (
        <section className="mt-14" aria-label="Related products">
          <h2 className="mb-5 text-2xl font-extrabold text-brand-900">You may also need</h2>
          <ProductGrid products={related4} className="grid-cols-2 lg:grid-cols-4" />
        </section>
      )}
    </div>
  );
}
