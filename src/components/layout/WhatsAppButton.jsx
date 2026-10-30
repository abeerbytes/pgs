import { MessageCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';
import { cleanWhatsAppNumber } from '../../utils/whatsapp.js';

export default function WhatsAppButton() {
  const { settings } = useStore();
  const n = cleanWhatsAppNumber(settings.whatsappNumber);
  if (!n) return null;
  const text = encodeURIComponent(`Hello ${settings.storeName}, I need help with an order.`);
  return (
    <a
      href={`https://wa.me/${n}?text=${text}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-4 right-4 z-30 inline-flex h-14 items-center gap-2 rounded-full bg-[#1fa855] px-4 font-semibold text-white shadow-lg hover:bg-[#188a45]"
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" aria-hidden="true" />
      <span className="hidden sm:inline">Chat on WhatsApp</span>
    </a>
  );
}
