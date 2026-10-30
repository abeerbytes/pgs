import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext.jsx';

// Uses the supplied PGS logo file unchanged (only its empty margin was trimmed). Never recoloured.
// `onDark` puts it on a white rounded tile so its navy/black artwork stays readable on a dark footer.
export default function Logo({ onDark = false, className = '' }) {
  const { settings } = useStore();
  const src = settings.logoUrl || '/pgs-logo.png';
  const img = (
    <img
      src={src}
      alt={`${settings.storeName} logo`}
      width="1111"
      height="477"
      decoding="async"
      className={`h-11 w-auto sm:h-14 ${onDark ? '' : 'mix-blend-multiply'} ${className}`}
    />
  );
  return (
    <Link to="/" className="inline-flex shrink-0 items-center" aria-label={`${settings.storeName} home`}>
      {onDark ? <span className="rounded-xl bg-white px-3 py-2">{img}</span> : img}
    </Link>
  );
}
