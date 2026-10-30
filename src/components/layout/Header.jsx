import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, Menu, MessageCircle, Search, ShoppingCart, X } from 'lucide-react';
import Logo from './Logo.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useStore } from '../../context/StoreContext.jsx';
import { cleanWhatsAppNumber } from '../../utils/whatsapp.js';

const navCls = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${isActive ? 'bg-brand-50 text-brand-800' : 'text-ink/80 hover:bg-brand-50 hover:text-brand-800'}`;

function SearchBox({ className = '', onDone }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const [q, setQ] = useState(pathname === '/shop' ? params.get('q') || '' : '');

  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/shop?q=${encodeURIComponent(term)}` : '/shop');
    onDone?.();
  };
  return (
    <form onSubmit={submit} role="search" className={`relative ${className}`}>
      <label htmlFor="site-search" className="sr-only">Search products</label>
      <input
        id="site-search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search products…"
        className="input pr-11"
        autoComplete="off"
      />
      <button type="submit" className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-brand-700 hover:bg-brand-50" aria-label="Search">
        <Search className="h-5 w-5" aria-hidden="true" />
      </button>
    </form>
  );
}

export default function Header() {
  const { itemCount } = useCart();
  const { categories, settings } = useStore();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef(null);
  const wa = cleanWhatsAppNumber(settings.whatsappNumber);

  useEffect(() => { setMenuOpen(false); setCatOpen(false); }, [pathname]);

  useEffect(() => {
    if (!catOpen) return undefined;
    const onDown = (e) => { if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setCatOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [catOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-white/95 shadow-sm backdrop-blur">
      <div className="container-x flex items-center gap-3 py-3">
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-brand-50 lg:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>

        <Logo />

        <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Main">
          <NavLink to="/" end className={navCls}>Home</NavLink>
          <NavLink to="/shop" className={navCls}>Shop</NavLink>
          <div className="relative" ref={catRef}>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-ink/80 hover:bg-brand-50 hover:text-brand-800"
              aria-expanded={catOpen}
              aria-haspopup="true"
              onClick={() => setCatOpen((o) => !o)}
            >
              Categories <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
            {catOpen && (
              <ul className="card absolute left-0 top-full mt-2 max-h-80 w-64 overflow-auto py-2 shadow-lg">
                {categories.length === 0 && <li className="px-4 py-2 text-sm text-ink/60">No categories yet</li>}
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link to={`/category/${c.slug}`} className="block px-4 py-2 text-sm hover:bg-brand-50">{c.name}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <NavLink to="/offers" className={navCls}>Offers</NavLink>
          <NavLink to="/about" className={navCls}>About Us</NavLink>
          <NavLink to="/contact" className={navCls}>Contact Us</NavLink>
        </nav>

        <SearchBox className="ml-auto hidden max-w-sm flex-1 md:block lg:ml-4" />

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          {wa && (
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noreferrer"
              className="hidden h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-brand-800 hover:bg-brand-50 xl:inline-flex"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" /> WhatsApp
            </a>
          )}
          <Link to="/cart" className="relative flex h-11 w-11 items-center justify-center rounded-lg hover:bg-brand-50" aria-label={`Shopping cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}>
            <ShoppingCart className="h-6 w-6 text-brand-800" aria-hidden="true" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gold-500 px-1 text-xs font-bold text-ink">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="container-x pb-3 md:hidden">
        <SearchBox />
      </div>

      {menuOpen && (
        <nav id="mobile-menu" className="max-h-[70vh] overflow-y-auto border-t border-ink/10 bg-white lg:hidden" aria-label="Mobile">
          <ul className="container-x grid gap-1 py-3">
            {[['/', 'Home'], ['/shop', 'Shop'], ['/offers', 'Offers'], ['/about', 'About Us'], ['/contact', 'Contact Us']].map(([to, label]) => (
              <li key={to}><NavLink to={to} end={to === '/'} className={navCls}>{label}</NavLink></li>
            ))}
            {categories.length > 0 && (
              <li className="mt-2">
                <p className="px-3 pb-1 text-sm font-bold text-brand-800">Categories</p>
                <ul className="grid grid-cols-2 gap-1">
                  {categories.map((c) => (
                    <li key={c.id}><Link to={`/category/${c.slug}`} className="block rounded-lg px-3 py-2 text-sm hover:bg-brand-50">{c.name}</Link></li>
                  ))}
                </ul>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
