import { formatPKR } from './format.js';

export function cleanWhatsAppNumber(n) {
  return String(n || '').replace(/[^\d]/g, '');
}

export function formatWhatsAppNumber(number) {
  const n = cleanWhatsAppNumber(number);
  if (n.length === 12 && n.startsWith('92')) return `+92 ${n.slice(2, 5)} ${n.slice(5)}`;
  return n ? `+${n}` : '';
}

export function buildOrderMessage(order, storeName) {
  const lines = [];
  lines.push(`*New order - ${storeName}*`);
  lines.push(`Order ID: ${order.orderId}`);
  lines.push('');
  lines.push('*Customer*');
  lines.push(`Name: ${order.customer.name}`);
  lines.push(`Phone: ${order.customer.phone}`);
  lines.push(`Address: ${order.customer.address}, ${order.customer.area}, ${order.customer.city}`);
  lines.push('');
  lines.push('*Items*');
  order.items.forEach((it, i) => {
    const unit = it.unit ? ` (${it.unit})` : '';
    lines.push(`${i + 1}. ${it.name}${unit} x ${it.qty} @ ${formatPKR(it.price)} = ${formatPKR(it.lineTotal)}`);
  });
  lines.push('');
  lines.push(`Subtotal: ${formatPKR(order.subtotal)}`);
  lines.push(`Delivery: ${order.deliveryFee > 0 ? formatPKR(order.deliveryFee) : 'Free'}`);
  lines.push(`*Total: ${formatPKR(order.total)}*`);
  lines.push(`Payment: ${order.paymentMethod}`);
  if (order.customer.notes) {
    lines.push('');
    lines.push(`Notes: ${order.customer.notes}`);
  }
  return lines.join('\n');
}

export function buildWhatsAppUrl(number, text) {
  const n = cleanWhatsAppNumber(number);
  if (!n) return '';
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}
