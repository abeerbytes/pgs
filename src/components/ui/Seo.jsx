import { useEffect } from 'react';
import { STORE } from '../../config/store.js';
import { useStore } from '../../context/StoreContext.jsx';

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content || '');
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!href) { if (el) el.remove(); return; }
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export default function Seo({ title, description, image, path, noindex = false, jsonLd }) {
  const { settings } = useStore();
  const siteName = settings.storeName || STORE.name;

  useEffect(() => {
    const fullTitle = title ? `${title} | ${siteName}` : `${siteName} | Online Grocery Shopping`;
    const desc = description || settings.tagline || STORE.tagline;
    const base = STORE.siteUrl || window.location.origin;
    const url = base + (path ?? window.location.pathname);
    document.title = fullTitle;
    setMeta('name', 'description', desc);
    setMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow');
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:site_name', siteName);
    setMeta('property', 'og:image', image || settings.logoUrl || '');
    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    setCanonical(noindex ? '' : url);

    let script;
    if (jsonLd) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.seo = 'true';
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
    return () => { if (script) script.remove(); };
  }, [title, description, image, path, noindex, siteName, settings.tagline, settings.logoUrl, jsonLd]);

  return null;
}
