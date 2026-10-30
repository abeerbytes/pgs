import { Link } from 'react-router-dom';
import { Clock, Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import Logo from './Logo.jsx';
import { useStore } from '../../context/StoreContext.jsx';
import { cleanWhatsAppNumber, formatWhatsAppNumber } from '../../utils/whatsapp.js';

export default function Footer() {
  const { settings, categories } = useStore();
  const whatsapp = cleanWhatsAppNumber(settings.whatsappNumber);
  const year = new Date().getFullYear();
  const linkCls = 'text-cream-100/80 hover:text-white hover:underline';

  return (
    <footer className="mt-20 bg-brand-900 text-cream-100">
      <div className="container-x grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo onDark />
          <p className="mt-4 max-w-xs text-sm text-cream-100/80">
            {settings.tagline || 'Everyday groceries, delivered to your door.'}
          </p>
          <div className="mt-4 flex gap-2">
            {settings.facebookUrl && (
              <a href={settings.facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20">
                <Facebook className="h-5 w-5" aria-hidden="true" />
              </a>
            )}
            {settings.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20">
                <Instagram className="h-5 w-5" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold">Contact</h2>
          <ul className="mt-3 space-y-2 text-sm text-cream-100/80">
            {settings.contactPhone && <li className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><a href={`tel:${settings.contactPhone.replace(/\s/g, '')}`} className={linkCls}>{settings.contactPhone}</a></li>}
            {settings.contactEmail && <li className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><a href={`mailto:${settings.contactEmail}`} className={linkCls}>{settings.contactEmail}</a></li>}
            {settings.address && <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span>{settings.address}</span></li>}
            {settings.businessHours && <li className="flex gap-2"><Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span>{settings.businessHours}</span></li>}
            {whatsapp && <li className="flex gap-2"><MessageCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className={linkCls}>WhatsApp: {formatWhatsAppNumber(whatsapp)}</a></li>}
            {!settings.contactPhone && !settings.contactEmail && !settings.address && !settings.businessHours && !whatsapp && (
              <li><Link to="/contact" className={linkCls}>Contact page</Link></li>
            )}
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold">Shop by category</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {categories.slice(0, 8).map((c) => (
              <li key={c.id}><Link to={`/category/${c.slug}`} className={linkCls}>{c.name}</Link></li>
            ))}
            <li><Link to="/shop" className={linkCls}>All products</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold">Help</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/delivery-policy" className={linkCls}>Delivery policy</Link></li>
            <li><Link to="/return-policy" className={linkCls}>Return policy</Link></li>
            <li><Link to="/privacy-policy" className={linkCls}>Privacy policy</Link></li>
            <li><Link to="/terms" className={linkCls}>Terms and conditions</Link></li>
            <li><Link to="/about" className={linkCls}>About us</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="container-x py-4 text-sm text-cream-100/70">© {year} {settings.storeName}. All rights reserved.</p>
      </div>
    </footer>
  );
}
