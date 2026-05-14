import Icon from '@/components/ui/icon';
import { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onNavigate, onAddToCart }: ProductCardProps) {
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-border hover:border-foreground/20 hover:shadow-lg transition-all duration-300 animate-fade-in">
      <div
        className="relative aspect-square overflow-hidden cursor-pointer bg-secondary"
        onClick={() => onNavigate('product', { id: String(product.id) })}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {discount && (
          <span className="absolute top-3 left-3 bg-foreground text-background text-xs font-semibold px-2 py-1 rounded-md">
            −{discount}%
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground">Нет в наличии</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <button
            onClick={() => onNavigate('product', { id: String(product.id) })}
            className="text-sm font-medium leading-snug text-left hover:text-muted-foreground transition-colors line-clamp-2"
          >
            {product.name}
          </button>
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <Icon name="Star" size={12} className="fill-amber-400 text-amber-400" />
          <span className="text-xs font-medium">{product.rating}</span>
          <span className="text-xs text-muted-foreground">({product.reviews})</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold">{product.price.toLocaleString('ru')} ₽</span>
            {product.originalPrice && (
              <span className="ml-2 text-xs text-muted-foreground line-through">
                {product.originalPrice.toLocaleString('ru')} ₽
              </span>
            )}
          </div>
          <button
            onClick={() => onAddToCart(product)}
            disabled={!product.inStock}
            className="p-2 rounded-lg bg-foreground text-background hover:bg-foreground/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Icon name="Plus" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
