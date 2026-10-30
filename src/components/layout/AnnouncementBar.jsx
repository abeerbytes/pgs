import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext.jsx';

export default function AnnouncementBar() {
  const { settings } = useStore();
  const text = settings.announcementText;
  if (!text) return null;
  const link = settings.announcementLink;
  const inner = <span>{text}</span>;
  return (
    <div className="bg-brand-900 text-center text-xs text-cream-100 sm:text-sm">
      <div className="container-x py-2">
        {link ? (
          /^https?:\/\//.test(link)
            ? <a href={link} className="underline-offset-2 hover:underline" target="_blank" rel="noreferrer">{inner}</a>
            : <Link to={link} className="underline-offset-2 hover:underline">{inner}</Link>
        ) : inner}
      </div>
    </div>
  );
}
