const pkr = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  maximumFractionDigits: 0,
});

export function formatPKR(value) {
  const n = Number(value);
  return pkr.format(Number.isFinite(n) ? n : 0);
}

export function discountPercent(price, originalPrice) {
  const p = Number(price);
  const o = Number(originalPrice);
  if (!Number.isFinite(p) || !Number.isFinite(o) || o <= p || o <= 0) return 0;
  return Math.round(((o - p) / o) * 100);
}

export function estimateDelivery(subtotal, settings) {
  if (!subtotal) return 0;
  const fee = Number(settings?.deliveryFee) || 0;
  const free = Number(settings?.freeDeliveryThreshold) || 0;
  if (free > 0 && subtotal >= free) return 0;
  return fee;
}

export function splitParagraphs(text) {
  return String(text || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function formatDateTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' });
}

export function newRequestId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'r-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}
