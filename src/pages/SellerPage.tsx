import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import ProductCard from '@/components/ProductCard';
import { productsApi, sellersApi, Product, SellerProfile } from '@/api/products';

interface SellerPageProps {
  sellerId: number;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onAddToCart: (product: Product) => void;
}

export default function SellerPage({ sellerId, onNavigate, onAddToCart }: SellerPageProps) {
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      sellersApi.get(sellerId),
      productsApi.list({ seller_id: sellerId }),
    ]).then(([sellerRes, prodRes]) => {
      setSeller(sellerRes);
      setProducts(prodRes.products);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [sellerId]);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
        <div className="bg-white border border-border rounded-3xl p-8 mb-8">
          <div className="flex gap-6">
            <div className="w-20 h-20 bg-secondary rounded-2xl flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-secondary rounded w-1/3" />
              <div className="h-4 bg-secondary rounded w-2/3" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!seller) {
    return (
      <main className="max-w-xl mx-auto px-4 py-20 text-center">
        <Icon name="Store" size={48} className="mx-auto mb-4 text-muted-foreground/40" />
        <h2 className="text-xl font-bold mb-2">Магазин не найден</h2>
        <button onClick={() => onNavigate('catalog')} className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all">
          В каталог
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Profile card */}
      <div className="bg-white border border-border rounded-3xl p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 bg-foreground text-background rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0 overflow-hidden">
            {seller.logo
              ? <img src={seller.logo} alt={seller.shop_name} className="w-full h-full object-cover" />
              : seller.shop_name.slice(0, 2).toUpperCase()
            }
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">{seller.shop_name}</h1>
            <p className="text-muted-foreground text-sm mb-3">{seller.description}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Icon name="ShoppingBag" size={14} className="text-muted-foreground" />
                <span className="font-semibold">{seller.total_sales}</span>
                <span className="text-muted-foreground">продаж</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon name="Package" size={14} className="text-muted-foreground" />
                <span className="font-semibold">{seller.products_count}</span>
                <span className="text-muted-foreground">товаров</span>
              </div>
              {seller.city && (
                <div className="flex items-center gap-1.5">
                  <Icon name="MapPin" size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">{seller.city}</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => onNavigate('chat')}
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
      <h2 className="text-xl font-semibold mb-4">Товары магазина</h2>
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={onNavigate}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Icon name="Package" size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">У этого магазина пока нет товаров</p>
        </div>
      )}
    </main>
  );
}
