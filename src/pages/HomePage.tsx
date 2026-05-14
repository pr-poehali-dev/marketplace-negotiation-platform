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

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <section className="mb-12">
        <div className="relative rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(24,95%,53%) 0%, hsl(330,85%,60%) 50%, hsl(271,76%,60%) 100%)' }}>
          <div className="absolute inset-0">
            <img src={PRODUCTS[0].image} alt="" className="w-full h-full object-cover opacity-10" />
          </div>
          {/* Декоративные кружки */}
          <div className="absolute top-8 right-12 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute bottom-0 right-40 w-48 h-48 bg-white/10 rounded-full translate-y-1/2" />
          <div className="absolute top-0 right-80 w-16 h-16 bg-white/15 rounded-full -translate-y-1/2" />

          <div className="relative z-10 px-8 py-12 md:py-16 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-5 backdrop-blur-sm">
              ✅ Абсолютно бесплатно!
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
              О'kak — торгуйся<br />и побеждай! 🎉
            </h1>
            <p className="text-white/80 mb-8 text-sm leading-relaxed">
              Предлагай свою цену, продавец принимает — и сразу в чат!<br />
              Тысячи товаров. Встроенный торг. Полностью бесплатно.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('catalog')}
                className="px-6 py-3 bg-white text-primary rounded-xl font-black text-sm hover:opacity-90 transition-all active:scale-95 shadow-lg"
              >
                Смотреть каталог
              </button>
              <button
                onClick={() => onNavigate('profile')}
                className="px-6 py-3 bg-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/30 transition-all backdrop-blur-sm"
              >
                Стать продавцом
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Фичи */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {[
          { emoji: '🤝', title: 'Торгуйся', desc: 'Предлагай свою цену продавцу', color: 'bg-orange-50 border-orange-200' },
          { emoji: '✅', title: 'Бесплатно', desc: 'Никаких комиссий навсегда', color: 'bg-green-50 border-green-200' },
          { emoji: '💬', title: 'Чат', desc: 'Прямое общение с продавцом', color: 'bg-blue-50 border-blue-200' },
          { emoji: '🎁', title: 'Бонусы', desc: 'Баллы за каждую покупку', color: 'bg-purple-50 border-purple-200' },
        ].map(feat => (
          <div key={feat.title} className={`border-2 ${feat.color} rounded-2xl p-4 text-center`}>
            <span className="text-2xl block mb-1.5">{feat.emoji}</span>
            <div className="font-bold text-sm mb-0.5">{feat.title}</div>
            <div className="text-xs text-muted-foreground">{feat.desc}</div>
          </div>
        ))}
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
              placeholder="Что ищешь? Можно поторговаться 😄"
              className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all active:scale-95 shadow-md shadow-primary/30"
          >
            Найти
          </button>
        </form>
      </section>

      {/* Categories */}
      <section className="mb-10">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat, i) => {
            const colors = ['bg-orange-100 text-orange-700 border-orange-200', 'bg-blue-100 text-blue-700 border-blue-200', 'bg-green-100 text-green-700 border-green-200', 'bg-pink-100 text-pink-700 border-pink-200', 'bg-purple-100 text-purple-700 border-purple-200', 'bg-yellow-100 text-yellow-700 border-yellow-200', 'bg-red-100 text-red-700 border-red-200', 'bg-teal-100 text-teal-700 border-teal-200'];
            return (
              <button
                key={cat}
                onClick={() => onNavigate('catalog', { category: cat })}
                className={`flex-shrink-0 px-4 py-2 border-2 rounded-full text-sm font-semibold transition-all hover:scale-105 ${colors[i % colors.length]}`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Popular */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black flex items-center gap-2">🔥 Популярное</h2>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-sm text-primary font-semibold hover:underline flex items-center gap-1 transition-colors"
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
          { label: 'Товаров', value: '12 450+', emoji: '📦' },
          { label: 'Продавцов', value: '830', emoji: '🏪' },
          { label: 'Покупателей', value: '45 000+', emoji: '👥' },
          { label: 'Сделок в день', value: '2 300', emoji: '🤝' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border-2 border-border p-5 text-center hover:border-primary/40 transition-colors">
            <div className="text-2xl mb-1">{stat.emoji}</div>
            <div className="text-2xl font-black text-primary mb-0.5">{stat.value}</div>
            <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Торг-баннер */}
      <section className="rounded-3xl p-8 md:p-10 mb-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(211,95%,55%) 0%, hsl(271,76%,60%) 100%)' }}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/4 -translate-y-1/4" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="text-3xl mb-2">🤝</div>
            <h3 className="text-2xl font-black text-white mb-1">Механика торга</h3>
            <p className="text-white/80 text-sm max-w-md">Видишь товар? Предложи свою цену! Продавец принимает или отклоняет. При согласии — сразу переходишь в чат для договорённостей.</p>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="flex-shrink-0 px-8 py-3.5 bg-white text-foreground rounded-xl font-black text-sm hover:opacity-90 transition-all shadow-lg"
          >
            Попробовать торг →
          </button>
        </div>
      </section>

      {/* CTA продавец */}
      <section className="bg-secondary rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-border">
        <div>
          <div className="text-3xl mb-2">🚀</div>
          <h3 className="text-2xl font-black mb-1">Есть что продать?</h3>
          <p className="text-muted-foreground text-sm">Размести объявление бесплатно. Без комиссий. Навсегда.</p>
        </div>
        <button
          onClick={() => onNavigate('profile')}
          className="flex-shrink-0 px-8 py-3.5 bg-primary text-white rounded-xl font-black text-sm hover:opacity-90 transition-all shadow-md shadow-primary/30"
        >
          Разместить товар
        </button>
      </section>
    </main>
  );
}
