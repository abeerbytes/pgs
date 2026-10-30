import { Link } from 'react-router-dom';
import Seo from '../components/ui/Seo.jsx';

export default function NotFound({ title = 'Page not found', text = 'The page you are looking for does not exist or has moved.' }) {
  return (
    <div className="container-x py-20 text-center">
      <Seo title={title} noindex />
      <p className="font-display text-7xl font-extrabold text-brand-200" aria-hidden="true">404</p>
      <h1 className="mt-2 text-3xl font-extrabold text-brand-900">{title}</h1>
      <p className="mx-auto mt-3 max-w-md text-ink/70">{text}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/shop" className="btn-primary">Browse products</Link>
        <Link to="/" className="btn-outline">Go to home</Link>
      </div>
    </div>
  );
}
