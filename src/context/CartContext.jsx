import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { formatPKR } from '../utils/format.js';

const KEY = 'pgs_cart_v1';
const MAX_QTY = 99;

const CartContext = createContext(null);

const snapOf = (p) => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  unit: p.unit || '',
  price: Number(p.price),
  originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
  image: p.image || '',
  stock: Number(p.stock) || 0,
});

const maxFor = (snap) => Math.min(MAX_QTY, snap && snap.stock > 0 ? snap.stock : MAX_QTY);
const clamp = (qty, snap) => Math.max(1, Math.min(Math.floor(qty) || 1, maxFor(snap)));

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((i) => i && typeof i.id === 'string' && Number.isInteger(i.qty) && i.qty > 0)
      .map((i) => ({ id: i.id, qty: Math.min(i.qty, MAX_QTY), snap: i.snap || null }));
  } catch {
    return [];
  }
}

function reducer(items, action) {
  switch (action.type) {
    case 'ADD': {
      const snap = snapOf(action.product);
      if (snap.stock <= 0) return items;
      const found = items.find((i) => i.id === snap.id);
      if (found) {
        return items.map((i) => (i.id === snap.id ? { ...i, snap, qty: clamp(i.qty + action.qty, snap) } : i));
      }
      return [...items, { id: snap.id, qty: clamp(action.qty, snap), snap }];
    }
    case 'SET':
      return items.map((i) => (i.id === action.id ? { ...i, qty: clamp(action.qty, i.snap) } : i));
    case 'REMOVE':
      return items.filter((i) => i.id !== action.id);
    case 'CLEAR':
      return [];
    case 'REPLACE':
      return action.items;
    case 'SYNC': {
      const byId = new Map(action.lines.map((l) => [l.id, l]));
      return items
        .map((i) => {
          const l = byId.get(i.id);
          if (!l) return i;
          if (!l.available) return null;
          const snap = snapOf(l);
          return { ...i, snap, qty: clamp(Math.min(i.qty, l.allowedQty || i.qty), snap) };
        })
        .filter(Boolean);
    }
    default:
      return items;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, read);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* storage full or blocked */ }
  }, [items]);

  // Keep several open tabs in step.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== KEY) return;
      dispatch({ type: 'REPLACE', items: read() });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const add = useCallback((product, qty = 1) => dispatch({ type: 'ADD', product, qty }), []);
  const setQty = useCallback((id, qty) => dispatch({ type: 'SET', id, qty }), []);
  const remove = useCallback((id) => dispatch({ type: 'REMOVE', id }), []);
  const clear = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  // Takes the "lines" returned by the backend quote, updates prices/stock in the cart and
  // returns human-readable notices about anything that changed.
  const applyQuote = useCallback((lines) => {
    const notices = [];
    const current = itemsRef.current;
    lines.forEach((l) => {
      const item = current.find((i) => i.id === l.id);
      if (!item) return;
      const name = l.name || item.snap?.name || 'An item';
      if (!l.available) {
        notices.push(`${name} is no longer available and was removed from your cart.`);
        return;
      }
      if (item.qty > l.allowedQty) notices.push(`Only ${l.allowedQty} of ${name} left. Quantity updated.`);
      if (item.snap && Number(item.snap.price) !== Number(l.price)) {
        notices.push(`${name} price changed from ${formatPKR(item.snap.price)} to ${formatPKR(l.price)}.`);
      }
    });
    dispatch({ type: 'SYNC', lines });
    return notices;
  }, []);

  const value = useMemo(() => {
    const itemCount = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + (i.snap ? i.snap.price * i.qty : 0), 0);
    const savings = items.reduce((s, i) => {
      const o = i.snap?.originalPrice;
      return o && o > i.snap.price ? s + (o - i.snap.price) * i.qty : s;
    }, 0);
    return {
      items, itemCount, subtotal, savings, add, setQty, remove, clear, applyQuote,
      getQty: (id) => items.find((i) => i.id === id)?.qty || 0,
    };
  }, [items, add, setQty, remove, clear, applyQuote]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
