import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import Seo from '../components/ui/Seo.jsx';
import ProductGrid from '../components/products/ProductGrid.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { EmptyState, ErrorState, ProductSkeletons } from '../components/ui/States.jsx';
import useProducts from '../hooks/useProducts.js';
import useDebounce from '../hooks/useDebounce.js';
import { useStore } from '../context/StoreContext.jsx';

const PAGE_SIZE = 12;
const SORTS = [
  ['featured', 'Featured'],
  ['newest', 'Newest'],
  ['price_asc', 'Price: low to high'],
  ['price_desc', 'Price: high to low'],
  ['name_asc', 'Name: A to Z'],
];

export default function Shop({ mode = 'all' }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  const { categories } = useStore();

  const category = mode === 'category' ? slug : sp.get('category') || '';
  const q = sp.get('q') || '';
  const brand = sp.get('brand') || '';
  const minPrice = sp.get('min') || '';
  const maxPrice = sp.get('max') || '';
  const inStock = sp.get('inStock') === '1';
  const onSale = mode === 'offers' || sp.get('onSale') === '1';
  const sort = sp.get('sort') || 'featured';
  const page = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1);

  const [search, setSearch] = useState(q);
  const [min, setMin] = useState(minPrice);
  const [max, setMax] = useState(maxPrice);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const debounced = useDebounce(search, 400);

  useEffect(() => { setSearch(q); }, [q]);
  useEffect(() => { setMin(minPrice); setMax(maxPrice); }, [minPrice, maxPrice]);

  const update = (changes) => {
    const next = new URLSearchParams(sp);
    Object.entries(changes).forEach(([k, v]) => {
      if (v === '' || v === null || v === undefined || v === false) next.delete(k);
      else next.set(k, String(v));
    });
    if (!('page' in changes)) next.delete('page');
    setSp(next, { replace: true });
  };

  useEffect(() => {
    if (debounced.trim() !== q.trim()) update({ q: debounced.trim() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const query = useMemo(
    () => ({
      q, category, brand, minPrice, maxPrice,
      inStock: inStock ? '1' : '',
      onSale: onSale ? '1' : '',
      sort, page, pageSize: PAGE_SIZE,
    }),
    [q, category, brand, minPrice, maxPrice, inStock, onSale, sort, page],
  );
  const { status, items, meta, error, reload } = useProducts(query);

  const currentCategory = categories.find((c) => c.slug === category);
  const title =
    mode === 'offers' ? 'Special offers'
    : mode === 'category' ? currentCategory?.name || 'Category'
    : q ? `Results for “${q}”` : 'All products';

  const filtered = Boolean(q || brand || minPrice || maxPrice || inStock || (mode !== 'offers' && onSale) || (mode === 'all' && category));
  const clearAll = () => {
    setSearch('');
    const base = mode === 'category' ? `/category/${slug}` : mode === 'offers' ? '/offers' : '/shop';
    navigate(base);
  };

  const changeCategory = (value) => {
    if (mode === 'category') navigate(value ? `/category/${value}` : '/shop');
    else update({ category: value });
  };

  const applyPrice = (e) => {
    e.preventDefault();
    update({ min: min.replace(/\D/g, ''), max: max.replace(/\D/g, '') });
  };

  const Filters = (
    <div className="space-y-5">
      <div>
        <label htmlFor="f-cat" className="label">Category</label>
        <select id="f-cat" className="input" value={category} onChange={(e) => changeCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
      </div>
      {meta?.brands?.length > 0 && (
        <div>
          <label htmlFor="f-brand" className="label">Brand</label>
          <select id="f-brand" className="input" value={brand} onChange={(e) => update({ brand: e.target.value })}>
            <option value="">All brands</option>
            {meta.brands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      )}
      <form onSubmit={applyPrice}>
        <fieldset>
          <legend className="label">Price (PKR)</legend>
          <div className="flex items-center gap-2">
            <input aria-label="Minimum price" inputMode="numeric" className="input" placeholder="Min" value={min} onChange={(e) => setMin(e.target.value)} />
            <span aria-hidden="true">–</span>
            <input aria-label="Maximum price" inputMode="numeric" className="input" placeholder="Max" value={max} onChange={(e) => setMax(e.target.value)} />
          </div>
          <button type="submit" className="btn-outline mt-2 w-full">Apply price</button>
        </fieldset>
      </form>
      <div className="space-y-2">
        <label className="flex min-h-[44px] items-center gap-3">
          <input type="checkbox" className="h-5 w-5 accent-brand-700" checked={inStock} onChange={(e) => update({ inStock: e.target.checked })} />
          <span className="text-sm font-medium">In stock only</span>
        </label>
        {mode !== 'offers' && (
          <label className="flex min-h-[44px] items-center gap-3">
            <input type="checkbox" className="h-5 w-5 accent-brand-700" checked={onSale} onChange={(e) => update({ onSale: e.target.checked })} />
            <span className="text-sm font-medium">Discounted products</span>
          </label>
        )}
      </div>
      {filtered && <button type="button" onClick={clearAll} className="btn-ghost w-full"><X className="h-4 w-4" aria-hidden="true" /> Clear all filters</button>}
    </div>
  );

  return (
    <div className="container-x py-8">
      <Seo
        title={mode === 'offers' ? 'Special offers' : mode === 'category' ? currentCategory?.name : q ? `Search: ${q}` : 'Shop all products'}
        description={
          mode === 'offers' ? 'Discounted groceries and special offers.'
          : currentCategory?.description || 'Browse groceries by category, brand and price.'
        }
        noindex={Boolean(q || brand || minPrice || maxPrice || page > 1)}
      />

      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-ink/70">
        <ol className="flex flex-wrap items-center gap-1">
          <li><Link to="/" className="hover:underline">Home</Link></li>
          <li aria-hidden="true">/</li>
          {mode === 'category' ? (
            <>
              <li><Link to="/shop" className="hover:underline">Shop</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-semibold text-ink">{currentCategory?.name || 'Category'}</li>
            </>
          ) : (
            <li aria-current="page" className="font-semibold text-ink">{mode === 'offers' ? 'Offers' : 'Shop'}</li>
          )}
        </ol>
      </nav>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-900">{title}</h1>
          {status === 'ready' && (
            <p className="mt-1 text-sm text-ink/70" aria-live="polite">
              {meta.total} product{meta.total === 1 ? '' : 's'}
              {meta.pages > 1 ? ` · page ${meta.page} of ${meta.pages}` : ''}
            </p>
          )}
        </div>
        <div className="flex w-full flex-wrap gap-3 sm:w-auto">
          <div className="relative min-w-[12rem] flex-1 sm:flex-none">
            <label htmlFor="shop-search" className="sr-only">Search in this list</label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/50" aria-hidden="true" />
            <input id="shop-search" type="search" className="input pl-9" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div>
            <label htmlFor="sort" className="sr-only">Sort by</label>
            <select id="sort" className="input" value={sort} onChange={(e) => update({ sort: e.target.value === 'featured' ? '' : e.target.value })}>
              {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <button type="button" className="btn-outline lg:hidden" aria-expanded={filtersOpen} aria-controls="filters" onClick={() => setFiltersOpen((o) => !o)}>
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> Filters
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <aside id="filters" className={`${filtersOpen ? 'block' : 'hidden'} card h-fit p-4 lg:sticky lg:top-28 lg:block`} aria-label="Filters">
          {Filters}
        </aside>

        <section aria-label="Products">
          {status === 'loading' && <ProductSkeletons count={PAGE_SIZE} />}
          {status === 'error' && <ErrorState error={error} onRetry={reload} title="Could not load products" />}
          {status === 'ready' && items.length === 0 && (
            <EmptyState
              title="No products found"
              text={filtered ? 'Try a different search or remove some filters.' : 'Products will appear here once they are added to the product sheet.'}
              actionLabel={filtered ? 'Clear filters' : undefined}
              onAction={filtered ? clearAll : undefined}
            />
          )}
          {status === 'ready' && items.length > 0 && (
            <>
              <ProductGrid products={items} />
              <Pagination
                page={meta.page}
                pages={meta.pages}
                onChange={(n) => { update({ page: n > 1 ? n : '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
