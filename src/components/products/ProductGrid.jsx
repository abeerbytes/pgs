import ProductCard from './ProductCard.jsx';

export default function ProductGrid({ products, className = 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4' }) {
  return (
    <div className={`grid gap-3 sm:gap-4 ${className}`}>
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
