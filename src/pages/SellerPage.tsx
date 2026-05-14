import Icon from '@/components/ui/icon';
import ProductCard from '@/components/ProductCard';
import { SELLERS, PRODUCTS, Product } from '@/data/products';

interface SellerPageProps {
  sellerId: number;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onAddToCart: (product: Product) => void;
}

export default function SellerPage({ sellerId, onNavigate, onAddToCart }: SellerPageProps) {
  const seller = SELLERS.find(s => s.id === sellerId) || SELLERS[0];
  const sellerProducts = PRODUCTS.filter(p => p.sellerId === seller.id);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Profile card */}
      <div className="bg-white border border-border rounded-3xl p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 bg-foreground text-background rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {seller.avatar}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">{seller.name}</h1>
            <p className="text-muted-foreground text-sm mb-3">{seller.description}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Icon name="Star" size={14} className="fill-amber-400 text-amber-400" />
                <span className="font-semibold">{seller.rating}</span>
                <span className="text-muted-foreground">рейтинг</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon name="ShoppingBag" size={14} className="text-muted-foreground" />
                <span className="font-semibold">{seller.sales}</span>
                <span className="text-muted-foreground">продаж</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon name="Package" size={14} className="text-muted-foreground" />
                <span className="font-semibold">{seller.products}</span>
                <span className="text-muted-foreground">товаров</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon name="Calendar" size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground">с {seller.since} года</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('chat', { sellerId: String(seller.id) })}
            className="flex-shrink-0 px-5 py-2.5 bg-foreground text-background rounded-xl font-medium text-sm hover:bg-foreground/80 transition-colors flex items-center gap-2"
          >
            <Icon name="MessageCircle" size={16} />
            Написать
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Ответ на запрос', value: '< 2 часов', icon: 'Clock' },
          { label: 'Повторные покупки', value: '68%', icon: 'RefreshCw' },
          { label: 'Положительных', value: '97%', icon: 'ThumbsUp' },
          { label: 'Отправка', value: '1-2 дня', icon: 'Truck' },
        ].map(stat => (
          <div key={stat.label} className="bg-secondary rounded-2xl p-4 text-center">
            <Icon name={stat.icon as Parameters<typeof Icon>[0]['name']} size={18} className="mx-auto mb-2 text-muted-foreground" />
            <div className="font-semibold text-sm">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Products */}
      <h2 className="text-xl font-semibold mb-4">Товары продавца</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sellerProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onNavigate={onNavigate}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </main>
  );
}
