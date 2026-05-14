import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { PRODUCTS, REVIEWS, SELLERS, Product } from '@/data/products';

interface ProductPageProps {
  productId: number;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductPage({ productId, onNavigate, onAddToCart }: ProductPageProps) {
  const product = PRODUCTS.find(p => p.id === productId) || PRODUCTS[0];
  const seller = SELLERS.find(s => s.id === product.sellerId) || SELLERS[0];
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews'>('desc');

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <button onClick={() => onNavigate('home')} className="hover:text-foreground transition-colors">Главная</button>
        <Icon name="ChevronRight" size={14} />
        <button onClick={() => onNavigate('catalog')} className="hover:text-foreground transition-colors">Каталог</button>
        <Icon name="ChevronRight" size={14} />
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 mb-12">
        {/* Image */}
        <div className="bg-secondary rounded-3xl overflow-hidden aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-start gap-3 mb-2">
            <span className="text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
              {product.category}
            </span>
            {!product.inStock && (
              <span className="text-xs font-medium text-destructive bg-destructive/10 px-2.5 py-1 rounded-full">
                Нет в наличии
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => (
                <Icon
                  key={i}
                  name="Star"
                  size={14}
                  className={i <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-border fill-border'}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-muted-foreground">({product.reviews} отзывов)</span>
          </div>

          <div className="mb-6">
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold">{product.price.toLocaleString('ru')} ₽</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through mb-1">
                  {product.originalPrice.toLocaleString('ru')} ₽
                </span>
              )}
            </div>
            {product.originalPrice && (
              <span className="text-sm text-green-600 font-medium">
                Экономия: {(product.originalPrice - product.price).toLocaleString('ru')} ₽
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {product.tags.map(tag => (
              <span key={tag} className="text-xs bg-secondary px-2.5 py-1 rounded-full text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>

          {/* Quantity + add */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2.5 hover:bg-secondary transition-colors"
              >
                <Icon name="Minus" size={14} />
              </button>
              <span className="px-4 py-2.5 text-sm font-medium min-w-[3rem] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2.5 hover:bg-secondary transition-colors"
              >
                <Icon name="Plus" size={14} />
              </button>
            </div>
            <button
              onClick={() => onAddToCart(product)}
              disabled={!product.inStock}
              className="flex-1 py-3 bg-foreground text-background rounded-xl font-semibold text-sm hover:bg-foreground/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="ShoppingBag" size={16} />
              {product.inStock ? 'В корзину' : 'Нет в наличии'}
            </button>
          </div>

          <button
            onClick={() => onNavigate('chat', { sellerId: String(product.sellerId) })}
            className="py-3 border border-border rounded-xl font-medium text-sm hover:bg-secondary transition-colors flex items-center justify-center gap-2 mb-8"
          >
            <Icon name="MessageCircle" size={16} />
            Написать продавцу
          </button>

          {/* Seller */}
          <div
            className="flex items-center gap-3 p-4 border border-border rounded-2xl cursor-pointer hover:bg-secondary transition-colors"
            onClick={() => onNavigate('seller', { id: String(seller.id) })}
          >
            <div className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              {seller.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{seller.name}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Icon name="Star" size={10} className="fill-amber-400 text-amber-400" />
                {seller.rating} · {seller.sales} продаж
              </div>
            </div>
            <Icon name="ChevronRight" size={16} className="text-muted-foreground flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6 flex gap-6">
        {(['desc', 'reviews'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'desc' ? 'Описание' : `Отзывы (${product.reviews})`}
          </button>
        ))}
      </div>

      {activeTab === 'desc' && (
        <div className="animate-fade-in max-w-2xl">
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4 animate-fade-in max-w-2xl">
          {REVIEWS.map(review => (
            <div key={review.id} className="bg-white border border-border rounded-2xl p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {review.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{review.author}</span>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {[1,2,3,4,5].map(i => (
                      <Icon
                        key={i}
                        name="Star"
                        size={11}
                        className={i <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-border fill-border'}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
