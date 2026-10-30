import { AlertTriangle, PackageSearch } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ProductSkeletons({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4" aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card animate-pulse overflow-hidden">
          <div className="aspect-square bg-cream-200" />
          <div className="space-y-2 p-3">
            <div className="h-4 w-4/5 rounded bg-cream-200" />
            <div className="h-3 w-1/3 rounded bg-cream-200" />
            <div className="h-5 w-1/2 rounded bg-cream-200" />
            <div className="h-10 rounded bg-cream-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, text, actionLabel, actionTo, onAction }) {
  return (
    <div className="card mx-auto flex max-w-lg flex-col items-center px-6 py-12 text-center">
      <PackageSearch className="h-10 w-10 text-brand-400" aria-hidden="true" />
      <h2 className="mt-4 text-xl font-bold">{title}</h2>
      {text && <p className="mt-2 text-ink/70">{text}</p>}
      {actionTo && <Link to={actionTo} className="btn-primary mt-6">{actionLabel}</Link>}
      {onAction && <button type="button" onClick={onAction} className="btn-primary mt-6">{actionLabel}</button>}
    </div>
  );
}

export function ErrorState({ error, onRetry, title = 'We could not load this' }) {
  return (
    <div role="alert" className="card mx-auto flex max-w-lg flex-col items-center border-red-200 bg-red-50/60 px-6 py-10 text-center">
      <AlertTriangle className="h-9 w-9 text-red-700" aria-hidden="true" />
      <h2 className="mt-3 text-lg font-bold text-red-900">{title}</h2>
      <p className="mt-2 text-red-900/80">{error?.message || 'Something went wrong. Please try again.'}</p>
      {onRetry && <button type="button" onClick={onRetry} className="btn-outline mt-5">Try again</button>}
    </div>
  );
}

export function PageSpinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-700" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
