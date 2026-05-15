import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { CATEGORIES } from '@/data/products';
import { useBanner } from '@/context/BannerContext';

interface HomePageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [search, setSearch] = useState('');
  const { banner } = useBanner();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <section className="mb-12">
        <div className="relative rounded-3xl overflow-hidden" style={{ background: banner.gradient }}>
          <div className="absolute top-8 right-12 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute bottom-0 right-40 w-48 h-48 bg-white/10 rounded-full translate-y-1/2" />
          <div className="absolute top-0 right-80 w-16 h-16 bg-white/15 rounded-full -translate-y-1/2" />

          <div className="relative z-10 px-8 py-12 md:py-16 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-5 backdrop-blur-sm">
              {banner.badge}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4" style={{ whiteSpace: 'pre-line' }}>
              {banner.title}
            </h1>
            <p className="text-white/80 mb-8 text-sm leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
              {banner.subtitle}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('catalog')}
                className="btn-3d px-6 py-3 bg-white text-primary rounded-xl font-black text-sm"
                style={{ '--btn-shadow': '0 0% 70%' } as React.CSSProperties}
              >
                {banner.btnPrimary}
              </button>
              <button
                onClick={() => onNavigate('seller-register')}
                className="px-6 py-3 bg-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/30 transition-all backdrop-blur-sm"
              >
                {banner.btnSecondary}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Фичи */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {[
          { emoji: '🤝', title: 'Торгуйся',   desc: 'Предлагай свою цену продавцу', color: 'bg-orange-50 border-orange-200' },
          { emoji: '✅', title: 'Бесплатно',  desc: 'Никаких комиссий навсегда',    color: 'bg-green-50 border-green-200'  },
          { emoji: '💬', title: 'Чат',        desc: 'Прямое общение с продавцом',   color: 'bg-blue-50 border-blue-200'    },
          { emoji: '🎁', title: 'Бонусы',     desc: 'Баллы за каждую покупку',      color: 'bg-purple-50 border-purple-200'},
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
          <button type="submit" className="btn-primary px-6 py-3.5">
            Найти
          </button>
        </form>
      </section>

      {/* Categories */}
      <section className="mb-10">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat, i) => {
            const colors = [
              'bg-orange-100 text-orange-700 border-orange-200',
              'bg-blue-100 text-blue-700 border-blue-200',
              'bg-green-100 text-green-700 border-green-200',
              'bg-pink-100 text-pink-700 border-pink-200',
              'bg-purple-100 text-purple-700 border-purple-200',
              'bg-yellow-100 text-yellow-700 border-yellow-200',
              'bg-red-100 text-red-700 border-red-200',
              'bg-teal-100 text-teal-700 border-teal-200',
            ];
            return (
              <button
                key={cat}
                onClick={() => onNavigate('catalog', { category: cat })}
                className={`btn-3d flex-shrink-0 px-4 py-2 border-2 rounded-full text-sm font-semibold transition-all ${colors[i % colors.length]}`}
                style={{ '--btn-shadow': '0 0% 70%' } as React.CSSProperties}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { label: 'Товаров',      value: '12 450+', emoji: '📦' },
          { label: 'Продавцов',    value: '830',     emoji: '🏪' },
          { label: 'Покупателей',  value: '45 000+', emoji: '👥' },
          { label: 'Сделок в день', value: '2 300',  emoji: '🤝' },
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
            className="btn-3d flex-shrink-0 px-8 py-3.5 bg-white text-foreground rounded-xl font-black text-sm"
            style={{ '--btn-shadow': '0 0% 70%' } as React.CSSProperties}
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
          <p className="text-muted-foreground text-sm max-w-md">Создай магазин бесплатно за 5 минут. Продавай без комиссий. Принимай оффер-цены от покупателей.</p>
        </div>
        <button
          onClick={() => onNavigate('seller-register')}
          className="btn-primary flex-shrink-0 px-8 py-3.5"
        >
          Стать продавцом
        </button>
      </section>
    </main>
  );
}
