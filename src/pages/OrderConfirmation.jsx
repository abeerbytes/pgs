import { Link, useLocation, useParams } from 'react-router-dom';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import Seo from '../components/ui/Seo.jsx';
import { EmptyState } from '../components/ui/States.jsx';
import { OrderSummary } from './Cart.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { dataSource } from '../services/api.js';
import { getOrder } from '../utils/orders.js';
import { buildOrderMessage, buildWhatsAppUrl } from '../utils/whatsapp.js';
import { formatDateTime, formatPKR } from '../utils/format.js';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const { state } = useLocation();
  const { settings } = useStore();
  const order = getOrder(orderId);

  if (!order) {
    return (
      <div className="container-x py-16">
        <Seo title="Order confirmation" noindex />
        <EmptyState
          title="We can't find this order on this device"
          text={`Order details are only kept on the device that placed the order. If you placed order ${orderId}, contact the store and quote this reference.`}
          actionLabel="Contact the store"
          actionTo="/contact"
        />
      </div>
    );
  }

  const url = buildWhatsAppUrl(settings.whatsappNumber, buildOrderMessage(order, settings.storeName));

  return (
    <div className="container-x max-w-3xl py-10">
      <Seo title="Order confirmation" noindex />
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-brand-600" aria-hidden="true" />
        <h1 className="mt-3 text-3xl font-extrabold text-brand-900">{dataSource === 'local' ? 'Your order is ready' : 'Your order is saved'}</h1>
        <p className="mt-2 text-ink/75">
          Order reference <strong className="font-display text-lg text-brand-800">{order.orderId}</strong>
        </p>
      </div>

      <div className="card mt-8 p-5 sm:p-6">
        <h2 className="text-lg font-bold">One more step: send it on WhatsApp</h2>
        <p className="mt-1 text-sm text-ink/75">
          Your order is pending until the store confirms it.{dataSource === 'local' ? ' It has not been saved to a spreadsheet, so the WhatsApp message is the store\'s only copy.' : ''} Opening WhatsApp does not send the message for you. Review it and press send.
        </p>
        {url ? (
          <>
            <a href={url} target="_blank" rel="noreferrer" className="btn-primary mt-4 w-full sm:w-auto">
              <MessageCircle className="h-5 w-5" aria-hidden="true" /> Send order on WhatsApp
            </a>
            {state?.opened === false && (
              <p role="status" className="mt-3 text-sm text-ink/70">Your browser may have blocked WhatsApp from opening automatically. Use the button above.</p>
            )}
          </>
        ) : (
          <p className="mt-3 rounded-lg bg-gold-400/25 p-3 text-sm">
            The store's WhatsApp number has not been set up on this website, so the message can't be prepared. The store can still see your saved order and will use the phone number you gave to reach you.
          </p>
        )}
      </div>

      <div className="card mt-6 p-5 sm:p-6">
        <h2 className="mb-1 text-lg font-bold">Order details</h2>
        <p className="mb-4 text-sm text-ink/60">Placed {formatDateTime(order.createdAt)} · {order.paymentMethod}</p>
        <ul className="mb-4 space-y-2 border-b border-ink/10 pb-4 text-sm">
          {order.items.map((i) => (
            <li key={i.id} className="flex items-baseline gap-2">
              <span>{i.name}{i.unit ? <span className="text-ink/55"> · {i.unit}</span> : null} × {i.qty}</span>
              <span className="leader-dots" aria-hidden="true" />
              <span className="font-semibold tabular-nums">{formatPKR(i.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <OrderSummary subtotal={order.subtotal} savings={order.discount} deliveryFee={order.deliveryFee} total={order.total} />
        <div className="mt-5 border-t border-ink/10 pt-4 text-sm">
          <p className="font-semibold">Delivering to</p>
          <p className="text-ink/80">{order.customer.name} · {order.customer.phone}</p>
          <p className="text-ink/80">{order.customer.address}, {order.customer.area}, {order.customer.city}</p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link to="/shop" className="btn-outline">Continue shopping</Link>
      </div>
    </div>
  );
}
