import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import Seo from '../components/ui/Seo.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { cleanWhatsAppNumber, formatWhatsAppNumber } from '../utils/whatsapp.js';

function Row({ icon: Icon, label, children }) {
  return (
    <li className="flex gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><Icon className="h-5 w-5" aria-hidden="true" /></span>
      <div><p className="text-sm font-semibold text-ink/60">{label}</p><div className="text-base">{children}</div></div>
    </li>
  );
}

export default function Contact() {
  const { settings } = useStore();
  const wa = cleanWhatsAppNumber(settings.whatsappNumber);
  const any = wa || settings.contactPhone || settings.contactEmail || settings.address || settings.businessHours;
  return (
    <div className="container-x max-w-3xl py-10">
      <Seo title="Contact us" description={`Contact ${settings.storeName}`} />
      <h1 className="text-3xl font-extrabold text-brand-900">Contact us</h1>
      <p className="mt-3 text-ink/75">Questions about an order or product availability? Reach the store using any of these.</p>
      {any ? (
        <ul className="card mt-6 space-y-5 p-6">
          {wa && <Row icon={MessageCircle} label="WhatsApp"><a className="font-semibold text-brand-700 underline" href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">{formatWhatsAppNumber(wa)}</a></Row>}
          {settings.contactPhone && <Row icon={Phone} label="Phone"><a className="font-semibold text-brand-700 underline" href={`tel:${settings.contactPhone.replace(/\s/g, '')}`}>{settings.contactPhone}</a></Row>}
          {settings.contactEmail && <Row icon={Mail} label="Email"><a className="font-semibold text-brand-700 underline" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a></Row>}
          {settings.address && <Row icon={MapPin} label="Address">{settings.address}</Row>}
          {settings.businessHours && <Row icon={Clock} label="Business hours">{settings.businessHours}</Row>}
        </ul>
      ) : (
        <p className="card mt-6 p-6 text-ink/75">Contact details have not been added yet. The store owner can add them in the Settings sheet (whatsappNumber, contactPhone, contactEmail, address, businessHours).</p>
      )}
    </div>
  );
}
