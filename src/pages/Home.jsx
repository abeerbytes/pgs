import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgePercent, Check, MessageCircle, ShieldCheck, ShoppingBag, Store, Truck } from 'lucide-react';
import Seo from '../components/ui/Seo.jsx';
import ProductGrid from '../components/products/ProductGrid.jsx';
import ProductImage from '../components/ui/ProductImage.jsx';
import { ErrorState, ProductSkeletons } from '../components/ui/States.jsx';
import useProducts from '../hooks/useProducts.js';
import { useStore } from '../context/StoreContext.jsx';
import { DEFAULT_BENEFITS } from '../config/store.js';
import { categoryIcon } from '../utils/categoryIcon.js';
import { formatPKR } from '../utils/format.js';
import { cleanWhatsAppNumber } from '../utils/whatsapp.js';

const BENEFIT_ICONS = [Store, BadgePercent, MessageCircle, Truck];

function SectionHead({ title, eyebrow, to, linkLabel = 'View all' }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-gold-600">{eyebrow}</p>}
        <h2 className="text-2xl font-extrabold text-brand-900 sm:text-3xl">{title}</h2>
      </div>
      {to && (
        <Link to={to} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
          {linkLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

function ProductSection({ title, eyebrow, to, query }) {
  const { status, items, error, reload } = useProducts(query);
  if (status === 'ready' && items.length === 0) return null;
  return (
    <section className="container-x mt-16" aria-label={title}>
      <SectionHead title={title} eyebrow={eyebrow} to={to} />
      {status === 'loading' && <ProductSkeletons count={4} />}
      {status === 'error' && <ErrorState error={error} onRetry={reload} title={`Could not load ${title.toLowerCase()}`} />}
      {status === 'ready' && <ProductGrid products={items} className="grid-cols-2 lg:grid-cols-4" />}
    </section>
  );
}

function parseBenefits(raw) {
  if (!raw) return DEFAULT_BENEFITS;
  try {
    const arr = JSON.parse(raw);
    const ok = Array.isArray(arr) ? arr.filter((b) => b && b.title) : [];
    return ok.length ? ok : DEFAULT_BENEFITS;
  } catch {
    return DEFAULT_BENEFITS;
  }
}

export default function Home() {
  const { settings, categories, brands, status: storeStatus, error: storeError, reload } = useStore();
  const featuredQuery = useMemo(() => ({ featured: '1', pageSize: 8, sort: 'featured' }), []);
  const bestQuery = useMemo(() => ({ bestSeller: '1', pageSize: 8, sort: 'featured' }), []);
  const newQuery = useMemo(() => ({ pageSize: 4, sort: 'newest', inStock: '1' }), []);
  const featured = useProducts(featuredQuery);
  const sale = useProducts(useMemo(() => ({ onSale: '1', pageSize: 1 }), []));

  const promoActive =
    settings.promoBannerTitle &&
    (!settings.promoBannerExpires || new Date(settings.promoBannerExpires).getTime() >= Date.now() - 86400000);
  const wa = cleanWhatsAppNumber(settings.whatsappNumber);
  const benefits = parseBenefits(settings.whyChooseUs);
  const tiles = featured.status === 'ready' ? featured.items.slice(0, 4) : [];
  const tissue = categories.find((c) => /tissue|paper/i.test(c.name));
  const hasSale = sale.status === 'ready' && sale.items.length > 0;

  return (
    <>
      <Seo description={`Shop everyday essentials from ${settings.storeName}. Browse products, add to cart and send your order on WhatsApp.`} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-800 text-white">
        <svg className="pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] text-gold-500/20" viewBox="0 0 100 100" fill="none" aria-hidden="true">
          <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.6" />
          <circle cx="50" cy="50" r="36" stroke="currentColor" strokeWidth="0.6" />
          <circle cx="50" cy="50" r="24" stroke="currentColor" strokeWidth="0.6" />
        </svg>
        <div className="container-x relative grid items-center gap-10 py-12 md:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-gold-400/50 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
              <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" /> {settings.storeName}
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              Everyday essentials, ordered in minutes.
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/80 sm:text-lg">
              Browse the shelves, fill your cart and send your order to the store on WhatsApp. Clear prices in PKR, with discounts shown against the original price.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-gold px-7">Shop now</Link>
              <a href="#categories" className="btn border border-white/35 px-7 text-white hover:bg-white/10">Explore categories</a>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
              {['Order on WhatsApp', 'Cash on delivery', 'Prices in PKR'].map((t) => (
                <li key={t} className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-gold-400" aria-hidden="true" />{t}</li>
              ))}
            </ul>
          </div>

          <div aria-label="Featured products">
            {featured.status === 'loading' && (
              <div className="grid grid-cols-2 gap-3" aria-busy="true">
                {[1, 2, 3, 4].map((i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-white/10" />)}
              </div>
            )}
            {featured.status === 'error' && <p className="rounded-xl bg-white/10 p-4 text-sm">{featured.error?.message}</p>}
            {featured.status === 'ready' && tiles.length === 0 && (
              <p className="rounded-xl bg-white/10 p-4 text-sm text-white/80">Featured products show here once they are marked as featured.</p>
            )}
            {tiles.length > 0 && (
              <ul className="grid grid-cols-2 gap-3 sm:gap-4">
                {tiles.map((p, i) => (
                  <li key={p.id} className={i % 2 === 1 ? 'sm:translate-y-6' : ''}>
                    <Link to={`/products/${p.slug}`} className="group block overflow-hidden rounded-2xl bg-white text-ink shadow-xl ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-1">
                      <ProductImage src={p.image} alt={p.name} eager={i < 2} className="aspect-square w-full p-2" />
                      <div className="border-t border-ink/5 p-3">
                        <p className="line-clamp-1 text-sm font-semibold">{p.name}</p>
                        <p className="font-display text-base font-bold text-brand-700">{formatPKR(p.price)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="container-x mt-16 scroll-mt-24" aria-label="Categories">
        <SectionHead eyebrow="Browse" title="Shop by category" to="/shop" linkLabel="All products" />
        {storeStatus === 'error' && <ErrorState error={storeError} onRetry={reload} title="Could not load categories" />}
        {storeStatus === 'loading' && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-cream-200" />)}
          </div>
        )}
        {categories.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {categories.map((c) => {
              const Icon = categoryIcon(c.name);
              return (
                <li key={c.id}>
                  <Link to={`/category/${c.slug}`} className="card group flex h-full flex-col items-center gap-3 p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md">
                    {c.image ? (
                      <img src={c.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-16 w-16 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-white">
                        <Icon className="h-8 w-8" aria-hidden="true" />
                      </span>
                    )}
                    <span className="text-sm font-semibold leading-snug">{c.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <ProductSection eyebrow="Hand-picked" title="Featured products" to="/shop?sort=featured" query={featuredQuery} />

      {/* Promo banners */}
      {(hasSale || tissue || promoActive) && (
        <section className="container-x mt-16" aria-label="Promotions">
          <div className="grid gap-4 md:grid-cols-2">
            {promoActive ? (
              <div className="flex flex-col justify-between gap-4 rounded-2xl bg-gold-400/25 p-6 sm:p-8 md:col-span-2 md:flex-row md:items-center">
                <div>
                  <h2 className="text-2xl font-extrabold text-brand-900">{settings.promoBannerTitle}</h2>
                  {settings.promoBannerText && <p className="mt-1 max-w-2xl text-ink/80">{settings.promoBannerText}</p>}
                </div>
                <Link to={settings.promoBannerLink || '/offers'} className="btn-primary shrink-0">See the offer</Link>
              </div>
            ) : (
              <>
                {hasSale && (
                  <Link to="/offers" className="group relative overflow-hidden rounded-2xl bg-gold-500 p-6 text-ink sm:p-8">
                    <p className="text-xs font-bold uppercase tracking-[0.18em]">Special offers</p>
                    <h2 className="mt-2 max-w-xs text-2xl font-extrabold sm:text-3xl">Discounted products, marked down from the original price</h2>
                    <span className="mt-5 inline-flex items-center gap-2 font-semibold">See offers <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
                    <BadgePercent className="absolute -bottom-4 -right-4 h-32 w-32 text-ink/10" aria-hidden="true" />
                  </Link>
                )}
                {tissue && (
                  <Link to={`/category/${tissue.slug}`} className="group relative overflow-hidden rounded-2xl bg-brand-900 p-6 text-white sm:p-8">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-400">{tissue.name}</p>
                    <h2 className="mt-2 max-w-xs text-2xl font-extrabold sm:text-3xl">Soft, hygienic tissue boxes for every home</h2>
                    <span className="mt-5 inline-flex items-center gap-2 font-semibold text-gold-400">Shop {tissue.name.toLowerCase()} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
                    <ShieldCheck className="absolute -bottom-4 -right-4 h-32 w-32 text-white/10" aria-hidden="true" />
                  </Link>
                )}
              </>
            )}
          </div>
        </section>
      )}

      <ProductSection eyebrow="Popular picks" title="Best sellers" to="/shop?sort=featured" query={bestQuery} />
      <ProductSection eyebrow="Just in" title="New arrivals" to="/shop?sort=newest" query={newQuery} />

      <section className="container-x mt-16" aria-label="Why shop with us">
        <SectionHead eyebrow="Why PGS" title={`Why shop with ${settings.storeName}`} />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => {
            const Icon = BENEFIT_ICONS[i % BENEFIT_ICONS.length];
            return (
              <li key={b.title} className="card p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <h3 className="mt-3 text-lg font-bold text-brand-800">{b.title}</h3>
                {b.text && <p className="mt-1 text-sm text-ink/75">{b.text}</p>}
              </li>
            );
          })}
        </ul>
      </section>

      {brands.length > 0 && (
        <section className="container-x mt-16" aria-label="Brands">
          <SectionHead eyebrow="On our shelves" title="Brands" />
          <ul className="flex flex-wrap gap-3">
            {brands.map((b) => (
              <li key={b.id}>
                <Link to={`/shop?brand=${encodeURIComponent(b.name)}`} className="card flex h-14 items-center gap-2 px-5 font-semibold hover:border-brand-300 hover:shadow-md">
                  {b.logo && <img src={b.logo} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-8 w-8 object-contain" />}
                  {b.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="container-x mt-16" aria-label="Get help">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-brand-800 p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="text-2xl font-extrabold">Can't find something?</h2>
            <p className="mt-1 text-white/80">Ask the store about product availability or help with an order.</p>
          </div>
          {wa ? (
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="btn-gold shrink-0">
              <MessageCircle className="h-5 w-5" aria-hidden="true" /> Message on WhatsApp
            </a>
          ) : (
            <Link to="/contact" className="btn-gold shrink-0">Contact the store</Link>
          )}
        </div>
      </section>
    </>
  );
}
