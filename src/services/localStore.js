// "Local mode" data source: reads src/data/products.js and settings.js.
// It mirrors what the Google Apps Script API returns, so the pages do not care which one is used.
// It is used ONLY when VITE_GOOGLE_SCRIPT_URL is not set. It is never a silent fallback after a failed request.
import { CATEGORIES, PRODUCTS } from '../data/products.js';
import { SETTINGS } from '../data/settings.js';
import { ApiError } from './apiError.js';
import { normalizePkPhone, validateCheckout } from '../utils/validation.js';

const MAX_QTY = 99;
const slugify = (s) => String(s || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const round2 = (n) => Math.round(n * 100) / 100;

const catById = new Map(CATEGORIES.filter((c) => c.isActive !== false).map((c) => [c.id, c]));

const all = (() => {
  const seen = new Set();
  const slugs = new Set();
  const out = [];
  PRODUCTS.forEach((p) => {
    if (!p || !p.id || !p.name || !Number.isFinite(Number(p.price)) || seen.has(p.id)) return;
    seen.add(p.id);
    let slug = slugify(p.slug || p.name) || slugify(p.id);
    if (slugs.has(slug)) slug = `${slug}-${slugify(p.id)}`;
    slugs.add(slug);
    const cat = catById.get(p.categoryId);
    const price = round2(Number(p.price));
    const orig = Number(p.originalPrice);
    const images = (p.images || []).filter(Boolean);
    out.push({
      id: String(p.id), sku: p.sku || '', name: p.name, slug,
      description: p.description || '',
      categoryId: cat ? cat.id : p.categoryId || '', categorySlug: cat ? cat.slug : '', categoryName: cat ? cat.name : '',
      brand: p.brand || '', price, originalPrice: orig > price ? round2(orig) : null,
      unit: p.unit || '', stock: Math.max(0, Math.floor(Number(p.stock) || 0)),
      images, image: images[0] || '',
      isFeatured: !!p.isFeatured, isBestSeller: !!p.isBestSeller, isActive: p.isActive !== false,
      createdAt: p.createdAt || '',
    });
  });
  return out;
})();
const byId = new Map(all.map((p) => [p.id, p]));

const pub = (p) => ({
  ...p,
  discountPercent: p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0,
  inStock: p.stock > 0,
});

export const local = {
  settings: async () => ({ ...SETTINGS, whatsappNumber: String(SETTINGS.whatsappNumber || '').replace(/\D/g, '') }),

  categories: async () => {
    const counts = {};
    all.forEach((p) => { if (p.isActive) counts[p.categoryId] = (counts[p.categoryId] || 0) + 1; });
    return CATEGORIES.filter((c) => c.isActive !== false)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map((c) => ({ id: c.id, name: c.name, slug: c.slug, description: c.description || '', image: c.image || '', productCount: counts[c.id] || 0 }));
  },

  brands: async () => {
    const names = [...new Set(all.filter((p) => p.isActive && p.brand).map((p) => p.brand))].sort();
    return names.map((name) => ({ id: slugify(name), name, slug: slugify(name), logo: '' }));
  },

  products: async (p = {}) => {
    const q = String(p.q || '').trim().toLowerCase();
    const tokens = q ? q.split(/\s+/) : [];
    const cat = String(p.category || '').trim().toLowerCase();
    const brand = String(p.brand || '').trim().toLowerCase();
    const min = parseFloat(p.minPrice);
    const max = parseFloat(p.maxPrice);

    const base = all.filter((x) => {
      if (!x.isActive) return false;
      if (p.exclude && x.id === String(p.exclude)) return false;
      if (cat && x.categorySlug.toLowerCase() !== cat && x.categoryId.toLowerCase() !== cat) return false;
      if (tokens.length) {
        const hay = `${x.name} ${x.sku} ${x.brand} ${x.categoryName}`.toLowerCase();
        if (!tokens.every((t) => hay.includes(t))) return false;
      }
      return true;
    });
    const brands = [...new Set(base.filter((x) => x.brand).map((x) => x.brand))].sort();

    const list = base.filter((x) => {
      if (brand && x.brand.toLowerCase() !== brand) return false;
      if (!Number.isNaN(min) && x.price < min) return false;
      if (!Number.isNaN(max) && max > 0 && x.price > max) return false;
      if (String(p.inStock) === '1' && x.stock <= 0) return false;
      if (String(p.onSale) === '1' && !x.originalPrice) return false;
      if (String(p.featured) === '1' && !x.isFeatured) return false;
      if (String(p.bestSeller) === '1' && !x.isBestSeller) return false;
      return true;
    });

    const byName = (a, b) => a.name.localeCompare(b.name);
    const sort = p.sort || 'featured';
    list.sort((a, b) => {
      switch (sort) {
        case 'price_asc': return a.price - b.price || byName(a, b);
        case 'price_desc': return b.price - a.price || byName(a, b);
        case 'name_asc': return byName(a, b);
        case 'newest': return (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0) || byName(a, b);
        default: return (b.isFeatured - a.isFeatured) || ((b.stock > 0) - (a.stock > 0)) || (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0) || byName(a, b);
      }
    });

    const pageSize = Math.min(48, Math.max(1, parseInt(p.pageSize, 10) || 12));
    const total = list.length;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(pages, Math.max(1, parseInt(p.page, 10) || 1));
    return { items: list.slice((page - 1) * pageSize, page * pageSize).map(pub), meta: { total, page, pageSize, pages, brands } };
  },

  product: async (slug) => {
    const s = String(slug || '').toLowerCase();
    const p = all.find((x) => x.isActive && x.slug === s);
    if (!p) throw new ApiError('Product not found.', 'NOT_FOUND');
    return pub(p);
  },

  quote: async ({ items = [], city = '' } = {}) => {
    const lines = [];
    const issues = [];
    let subtotal = 0;
    let savings = 0;
    items.forEach((it) => {
      const p = byId.get(String(it.id));
      const qty = Math.floor(Number(it.qty));
      if (!p || !p.isActive) {
        lines.push({ id: String(it.id), name: p ? p.name : '', available: false, allowedQty: 0, qty, price: 0, stock: 0 });
        issues.push({ id: String(it.id), name: p ? p.name : 'An item', code: 'UNAVAILABLE', message: `${p ? p.name : 'An item in your cart'} is no longer available.` });
        return;
      }
      const allowed = Math.min(qty, p.stock);
      if (p.stock <= 0) issues.push({ id: p.id, name: p.name, code: 'OUT_OF_STOCK', message: `${p.name} is out of stock.` });
      else if (qty > p.stock) issues.push({ id: p.id, name: p.name, code: 'INSUFFICIENT_STOCK', message: `Only ${p.stock} of ${p.name} left.` });
      const lineTotal = round2(p.price * allowed);
      subtotal += lineTotal;
      if (p.originalPrice) savings += (p.originalPrice - p.price) * allowed;
      lines.push({ id: p.id, sku: p.sku, slug: p.slug, name: p.name, unit: p.unit, price: p.price, originalPrice: p.originalPrice, image: p.image, stock: p.stock, qty, allowedQty: allowed, available: p.stock > 0, lineTotal });
    });
    subtotal = round2(subtotal);
    const fee = Number(SETTINGS.deliveryFee) || 0;
    const free = Number(SETTINGS.freeDeliveryThreshold) || 0;
    const deliveryFee = subtotal === 0 ? 0 : free > 0 && subtotal >= free ? 0 : fee;
    const c = String(city).trim().toLowerCase();
    const cities = SETTINGS.supportedCities || [];
    const cityOk = !cities.length || !c || cities.some((x) => x.toLowerCase() === c);
    const minOrderAmount = Number(SETTINGS.minOrderAmount) || 0;
    return {
      lines, issues, subtotal, savings: round2(savings), deliveryFee, total: round2(subtotal + deliveryFee),
      minOrderAmount, belowMinimum: minOrderAmount > 0 && subtotal < minOrderAmount, freeDeliveryThreshold: free, cityOk,
    };
  },

  createOrder: async (payload) => {
    const c = payload.customer || {};
    const errors = validateCheckout(
      { name: c.name || '', phone: c.phone || '', email: c.email || '', city: c.city || '', area: c.area || '', address: c.address || '', notes: c.notes || '' },
      { supportedCities: SETTINGS.supportedCities || [] },
    );
    if (Object.keys(errors).length) throw new ApiError('Please check the highlighted details and try again.', 'VALIDATION', { fields: errors });
    const items = (payload.items || []).map((i) => ({ id: String(i.id), qty: Math.floor(Number(i.qty)) }));
    if (!items.length || items.some((i) => !(i.qty >= 1 && i.qty <= MAX_QTY))) throw new ApiError('Your cart has an invalid quantity.', 'VALIDATION', { fields: { items: 'Invalid cart.' } });
    const q = await local.quote({ items, city: c.city });
    if (!q.cityOk) throw new ApiError(`We do not deliver to ${c.city} yet.`, 'CITY_NOT_SUPPORTED');
    if (q.issues.length) throw new ApiError('Some items in your cart changed. Please review your cart.', 'STOCK_UNAVAILABLE', { issues: q.issues });
    if (q.belowMinimum) throw new ApiError(`The minimum order is Rs ${q.minOrderAmount}.`, 'MIN_ORDER');

    const now = new Date();
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let suffix = '';
    for (let i = 0; i < 5; i += 1) suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
    const ymd = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    return {
      duplicate: false,
      order: {
        orderId: `PGS-${ymd}-${suffix}`, createdAt: now.toISOString(), orderStatus: 'Pending', whatsappStatus: 'Pending',
        customer: { ...c, phone: normalizePkPhone(c.phone) },
        items: q.lines.map((l) => ({ id: l.id, sku: l.sku, name: l.name, unit: l.unit, price: l.price, originalPrice: l.originalPrice, qty: l.allowedQty, lineTotal: l.lineTotal })),
        subtotal: q.subtotal, discount: q.savings, deliveryFee: q.deliveryFee, total: q.total, paymentMethod: 'Cash on Delivery',
      },
    };
  },
};
