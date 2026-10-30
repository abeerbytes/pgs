// Keeps the last few placed orders on this device so the confirmation page survives a refresh.
// The backend deliberately has no public "look up an order" endpoint.
const KEY = 'pgs_orders_v1';

function readAll() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '{}');
    return v && typeof v === 'object' ? v : {};
  } catch {
    return {};
  }
}

export function saveOrder(order) {
  try {
    const all = readAll();
    all[order.orderId] = order;
    const keep = Object.values(all)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(keep.map((o) => [o.orderId, o]))));
  } catch { /* storage unavailable */ }
}

export function getOrder(orderId) {
  return readAll()[orderId] || null;
}
