// Single place that talks to the Google Apps Script Web App.
// POST bodies are sent as text/plain so the browser treats them as "simple" requests
// (no CORS preflight, which Apps Script cannot answer). The script parses the JSON itself.

import { ApiError } from './apiError.js';
import { local } from './localStore.js';

const BASE = (import.meta.env.VITE_GOOGLE_SCRIPT_URL || '').trim();
const TIMEOUT_MS = 25000;

export { ApiError };

export const isApiConfigured = () => Boolean(BASE);
// 'sheets' = live Google Sheet via Apps Script. 'local' = src/data/*.js (used only when no script URL is configured).
export const dataSource = BASE ? 'sheets' : 'local';

async function send(url, init = {}) {
  if (!BASE) {
    throw new ApiError(
      'The store is not connected to its data source yet. Set VITE_GOOGLE_SCRIPT_URL and rebuild the site.',
      'NOT_CONFIGURED',
    );
  }
  const { signal: outer, ...rest } = init;
  const ctrl = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; ctrl.abort(); }, TIMEOUT_MS);
  if (outer) {
    if (outer.aborted) ctrl.abort();
    else outer.addEventListener('abort', () => ctrl.abort(), { once: true });
  }

  let res;
  try {
    res = await fetch(url, { ...rest, signal: ctrl.signal, redirect: 'follow' });
  } catch (err) {
    if (outer?.aborted) throw new DOMException('Aborted', 'AbortError');
    if (timedOut) throw new ApiError('The server took too long to respond. Please try again.', 'TIMEOUT');
    throw new ApiError('Could not reach the store server. Check your internet connection and try again.', 'NETWORK');
  } finally {
    clearTimeout(timer);
  }

  let body;
  try {
    body = JSON.parse(await res.text());
  } catch {
    throw new ApiError('The store server sent an unexpected response. Please try again.', 'BAD_RESPONSE');
  }
  if (!res.ok || !body || body.success !== true) {
    const e = body && body.error ? body.error : {};
    throw new ApiError(e.message || 'Something went wrong. Please try again.', e.code || 'SERVER_ERROR', e.details || null);
  }
  return body.data;
}

const cache = new Map();

async function get(action, params = {}, { signal, ttl = 0 } = {}) {
  const url = new URL(BASE || 'https://invalid.local/');
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  });
  const key = url.toString();
  if (ttl) {
    const hit = cache.get(key);
    if (hit && Date.now() - hit.t < ttl) return hit.data;
  }
  const data = await send(key, { method: 'GET', signal });
  if (ttl) cache.set(key, { t: Date.now(), data });
  return data;
}

function post(action, payload, { signal } = {}) {
  return send(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...payload }),
    signal,
  });
}

export const api = BASE
  ? {
      getSettings: (o) => get('settings', {}, { ttl: 5 * 60 * 1000, ...o }),
      getCategories: (o) => get('categories', {}, { ttl: 5 * 60 * 1000, ...o }),
      getBrands: (o) => get('brands', {}, { ttl: 5 * 60 * 1000, ...o }),
      getProducts: (params, o) => get('products', params, { ttl: 60 * 1000, ...o }),
      getProduct: (slug, o) => get('product', { slug }, { ttl: 60 * 1000, ...o }),
      quote: (payload, o) => post('quote', payload, o),
      createOrder: (payload, o) => post('createOrder', payload, o),
    }
  : {
      getSettings: () => local.settings(),
      getCategories: () => local.categories(),
      getBrands: () => local.brands(),
      getProducts: (params) => local.products(params),
      getProduct: (slug) => local.product(slug),
      quote: (payload) => local.quote(payload),
      createOrder: (payload) => local.createOrder(payload),
    };
