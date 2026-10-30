import { Link } from 'react-router-dom';
import Seo from '../components/ui/Seo.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { splitParagraphs } from '../utils/format.js';

export default function About() {
  const { settings } = useStore();
  const custom = splitParagraphs(settings.aboutText);
  return (
    <div className="container-x max-w-3xl py-10">
      <Seo title="About us" description={`About ${settings.storeName}`} />
      <h1 className="text-3xl font-extrabold text-brand-900">About {settings.storeName}</h1>
      <div className="mt-5 space-y-4 text-lg text-ink/85">
        {custom.length ? custom.map((p, i) => <p key={i}>{p}</p>) : (
          <>
            <p>{settings.storeName} is a grocery store. This website lets you browse the shelves, see prices in PKR and send your order to the store on WhatsApp.</p>
            <p>After you place an order, the store reviews it, confirms availability and arranges delivery. Everything else about us, including our story and team, is added by the store owner in the Settings sheet (key: aboutText).</p>
          </>
        )}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/shop" className="btn-primary">Start shopping</Link>
        <Link to="/contact" className="btn-outline">Contact us</Link>
      </div>
    </div>
  );
}
