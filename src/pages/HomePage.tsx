import { useState } from 'react';
import Icon from '@/components/ui/icon';
import ProductCard from '@/components/ProductCard';
import { PRODUCTS, CATEGORIES, Product } from '@/data/products';

interface HomePageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onAddToCart: (product: Product) => void;
}

export default function HomePage({ onNavigate, onAddToCart }: HomePageProps) {
  const [search, setSearch] = useState('');

  const popular = PRODUCTS.slice(0, 4);
  const featured = PRODUCTS[0];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <section className="mb-12">
        <div className="relative bg-foreground rounded-3xl overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={featured.image}
              alt=""
              className="w-full h-full object-cover opacity-20"
            />
          </div>
          <div className="relative z-10 px-8 py-12 md:py-16 max-w-xl">
            <span className="inline-block text-xs font-semibold text-background/60 uppercase tracking-widest mb-4">
              Маркетплейс
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-background leading-tight mb-4">
              Покупай и продавай<br />с удовольствием
            </h1>
            <p className="text-background/70 mb-8 text-sm leading-relaxed">
              Тысячи товаров от проверенных продавцов. Встроенный чат для переговоров, безопасные сделки.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => onNavigate('catalog')}
                className="px-6 py-3 bg-background text-foreground rounded-xl font-semibold text-sm hover:bg-background/90 transition-colors"
              >
                Смотреть каталог
              </button>
              <button
                onClick={() => onNavigate('profile')}
                className="px-6 py-3 bg-white/10 text-background rounded-xl font-semibold text-sm hover:bg-white/20 transition-colors"
              >
                Стать продавцом
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="mb-10">
        <form
          onSubmit={e => { e.preventDefault(); onNavigate('catalog', { search }); }}
          className="flex gap-3"
        >
          <div className="flex-1 relative">
            <Icon name="Search" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Что ищешь?"
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 bg-foreground text-background rounded-xl font-medium text-sm hover:bg-foreground/80 transition-colors"
          >
            Найти
          </button>
        </form>
      </section>

      {/* Categories */}
      <section className="mb-10">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => onNavigate('catalog', { category: cat })}
              className="flex-shrink-0 px-4 py-2 bg-white border border-border rounded-full text-sm hover:border-foreground hover:bg-secondary transition-all"
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Popular */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Популярное</h2>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            Все товары <Icon name="ArrowRight" size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {popular.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={onNavigate}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { label: 'Товаров', value: '12 450+' },
          { label: 'Продавцов', value: '830' },
          { label: 'Покупателей', value: '45 000+' },
          { label: 'Сделок в день', value: '2 300' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-border p-6 text-center">
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="bg-secondary rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold mb-2">Есть что продать?</h3>
          <p className="text-muted-foreground text-sm">Разместите объявление бесплатно и начните получать заказы сегодня</p>
        </div>
        <button
          onClick={() => onNavigate('profile')}
          className="flex-shrink-0 px-8 py-3.5 bg-foreground text-background rounded-xl font-semibold text-sm hover:bg-foreground/80 transition-colors"
        >
          Разместить товар
        </button>
      </section>
    </main>
  );
}
