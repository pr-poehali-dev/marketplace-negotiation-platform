import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { CATEGORIES, PRODUCTS, SELLERS } from '@/data/products';
import { useBanner } from '@/context/BannerContext';
import { useLeads, LeadType } from '@/context/LeadsContext';

interface HomePageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const FEATURE_INFO: Record<string, { title: string; body: string; emoji: string }> = {
  'Торгуйся': {
    emoji: '🤝',
    title: 'Как работает торг?',
    body: 'Видишь товар по слишком высокой цене? Нажми «Предложить цену» и введи свою сумму. Продавец получит уведомление и сможет принять, отклонить или предложить встречную цену. Если договорились — переходите в чат для оформления сделки.',
  },
  'Бесплатно': {
    emoji: '✅',
    title: 'Что бесплатно?',
    body: 'Платформа О\'kak полностью бесплатна как для покупателей, так и для продавцов. Никаких комиссий с продаж, никаких скрытых платежей, никакой ежемесячной оплаты. Зарабатываете вы — не мы.',
  },
  'Чат': {
    emoji: '💬',
    title: 'Встроенный чат',
    body: 'После согласования цены вы автоматически переходите в защищённый чат с продавцом. Обсуждайте детали доставки, уточняйте характеристики товара, договаривайтесь об условиях — всё в одном месте без сторонних мессенджеров.',
  },
  'Бонусы': {
    emoji: '🎁',
    title: 'Бонусная программа',
    body: 'За каждую совершённую покупку вам начисляются бонусные баллы. 1 балл = 1 рубль. Накопленные баллы можно потратить на следующие покупки. Чем больше покупаете — тем больше экономите.',
  },
};

const CATEGORY_COLORS = [
  'bg-orange-100 text-orange-700 border-orange-200',
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-green-100 text-green-700 border-green-200',
  'bg-pink-100 text-pink-700 border-pink-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-yellow-100 text-yellow-700 border-yellow-200',
  'bg-red-100 text-red-700 border-red-200',
  'bg-teal-100 text-teal-700 border-teal-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-cyan-100 text-cyan-700 border-cyan-200',
];

export default function HomePage({ onNavigate }: HomePageProps) {
  const [search, setSearch] = useState('');
  const { banners } = useBanner();
  const { addLead } = useLeads();

  /* ── slider ── */
  const [slide, setSlide] = useState(0);
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (slideTimer.current) clearInterval(slideTimer.current);
    slideTimer.current = setInterval(() => {
      setSlide(s => (s + 1) % banners.length);
    }, 5000);
  };

  useEffect(() => {
    if (banners.length > 1) startTimer();
    return () => { if (slideTimer.current) clearInterval(slideTimer.current); };
  }, [banners.length]);

  const goSlide = (i: number) => {
    setSlide(i);
    startTimer();
  };

  /* ── feature popover ── */
  const [popup, setPopup] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) setPopup(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── top products ── */
  const topProducts = [...PRODUCTS].sort((a, b) => b.reviews - a.reviews).slice(0, 4);

  /* ── lead form ── */
  const [form, setForm] = useState({ name: '', phone: '', email: '', type: 'buyer' as LeadType, comment: '' });
  const [formSent, setFormSent] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) { setFormError('Заполните имя и телефон'); return; }
    addLead(form);
    setFormSent(true);
    setFormError('');
    setForm({ name: '', phone: '', email: '', type: 'buyer', comment: '' });
  };

  const activeBanner = banners[slide] ?? banners[0];

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">

      {/* ── BANNER SLIDER ── */}
      <section className="relative">
        <div
          className="relative rounded-2xl overflow-hidden transition-all duration-700"
          style={{ background: activeBanner.gradient, minHeight: 220 }}
        >
          {activeBanner.imageUrl && (
            <img src={activeBanner.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          )}
          <div className="absolute top-6 right-8 w-24 h-24 bg-white/10 rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-28 w-36 h-36 bg-white/10 rounded-full translate-y-1/2 pointer-events-none" />

          <div className="relative z-10 px-7 py-10 max-w-lg">
            <span className="inline-flex bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 backdrop-blur-sm">
              {activeBanner.badge}
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-white leading-tight mb-3" style={{ whiteSpace: 'pre-line' }}>
              {activeBanner.title}
            </h1>
            <p className="text-white/80 text-sm mb-6 leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
              {activeBanner.subtitle}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onNavigate('catalog')}
                className="btn-3d px-5 py-2.5 bg-white text-primary rounded-xl font-black text-sm"
                style={{ '--btn-shadow': '0 0% 70%' } as React.CSSProperties}
              >
                {activeBanner.btnPrimary}
              </button>
              <button
                onClick={() => onNavigate('seller-register')}
                className="px-5 py-2.5 bg-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/30 transition-all backdrop-blur-sm"
              >
                {activeBanner.btnSecondary}
              </button>
            </div>
          </div>
        </div>

        {/* Dots */}
        {banners.length > 1 && (
          <div className="flex justify-center gap-2 mt-3">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => goSlide(i)}
                className={`rounded-full transition-all ${i === slide ? 'w-6 h-2 bg-primary' : 'w-2 h-2 bg-border hover:bg-primary/50'}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── SEARCH ── */}
      <section>
        <form
          onSubmit={e => { e.preventDefault(); onNavigate('catalog', { search }); }}
          className="flex gap-2"
        >
          <div className="flex-1 relative">
            <Icon name="Search" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Ищи товары — и торгуйся!"
              className="w-full pl-11 pr-4 py-3 bg-white border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <button type="submit" className="btn-primary px-5 py-3 text-sm">Найти</button>
        </form>
      </section>

      {/* ── FEATURE CHIPS ── */}
      <section ref={popupRef} className="relative">
        <div className="flex flex-wrap gap-2">
          {Object.entries(FEATURE_INFO).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setPopup(popup === key ? null : key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full border-2 text-sm font-bold transition-all ${
                popup === key
                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/25'
                  : 'bg-white border-border text-foreground hover:border-primary/50'
              }`}
            >
              <span>{info.emoji}</span> {key}
              <Icon name={popup === key ? 'ChevronUp' : 'ChevronDown'} size={12} />
            </button>
          ))}
        </div>

        {popup && FEATURE_INFO[popup] && (
          <div className="absolute top-full left-0 mt-2 z-30 bg-white border-2 border-primary/20 rounded-2xl shadow-xl p-5 max-w-sm animate-fade-in">
            <div className="text-2xl mb-2">{FEATURE_INFO[popup].emoji}</div>
            <div className="font-black mb-1">{FEATURE_INFO[popup].title}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{FEATURE_INFO[popup].body}</p>
          </div>
        )}
      </section>

      {/* ── CATEGORIES ── */}
      <section>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat}
              onClick={() => onNavigate('catalog', { category: cat })}
              className={`flex-shrink-0 px-3.5 py-1.5 border-2 rounded-full text-xs font-semibold transition-all hover:opacity-80 ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ── TOP PRODUCTS + SELLERS ── */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* Топ товаров */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-lg">🔥 Топ по продажам</h2>
            <button onClick={() => onNavigate('catalog')} className="text-xs text-primary font-bold hover:underline">Все товары →</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {topProducts.map(p => (
              <button
                key={p.id}
                onClick={() => onNavigate('product', { id: String(p.id) })}
                className="bg-white border-2 border-border rounded-2xl overflow-hidden text-left hover:border-primary/50 hover:shadow-md transition-all group"
              >
                <div className="aspect-square overflow-hidden bg-secondary relative">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    #{PRODUCTS.sort((a, b) => b.reviews - a.reviews).findIndex(x => x.id === p.id) + 1}
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-xs text-muted-foreground mb-0.5">{p.seller}</div>
                  <div className="font-bold text-sm leading-tight line-clamp-2 mb-1">{p.name}</div>
                  <div className="font-black text-primary">{p.price.toLocaleString('ru')} ₽</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">⭐ {p.rating} · {p.reviews} продаж</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Магазины */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-lg">🏪 Магазины</h2>
          </div>
          <div className="space-y-2">
            {SELLERS.map(s => (
              <div key={s.id} className="bg-white border-2 border-border rounded-2xl p-3 flex items-center gap-3 hover:border-primary/40 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0">
                  {s.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{s.name}</div>
                  <div className="text-xs text-muted-foreground">⭐ {s.rating} · {s.sales} продаж</div>
                </div>
                <Icon name="ChevronRight" size={14} className="text-muted-foreground flex-shrink-0" />
              </div>
            ))}
            <button
              onClick={() => onNavigate('catalog')}
              className="w-full py-2.5 border-2 border-dashed border-primary/30 text-primary text-xs font-bold rounded-2xl hover:bg-primary/5 transition-colors"
            >
              Все магазины →
            </button>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <section className="grid grid-cols-4 gap-3">
        {[
          { label: 'Товаров',     value: '12 450+', emoji: '📦' },
          { label: 'Магазинов',   value: '830',     emoji: '🏪' },
          { label: 'Покупателей', value: '45 000+', emoji: '👥' },
          { label: 'Сделок/день', value: '2 300',   emoji: '🤝' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border-2 border-border p-4 text-center">
            <div className="text-xl mb-0.5">{stat.emoji}</div>
            <div className="text-lg font-black text-primary">{stat.value}</div>
            <div className="text-[10px] text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* ── CTA SELLER ── */}
      <section className="bg-secondary rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-border">
        <div>
          <span className="text-2xl">🚀</span>
          <h3 className="font-black text-lg mt-1">Есть что продать?</h3>
          <p className="text-muted-foreground text-sm">Создай магазин бесплатно. Без комиссий навсегда.</p>
        </div>
        <button onClick={() => onNavigate('seller-register')} className="btn-primary flex-shrink-0 px-6 py-2.5 text-sm">
          Стать продавцом →
        </button>
      </section>

      {/* ── LEAD FORM ── */}
      <section className="bg-white border-2 border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-border bg-secondary/50">
          <h3 className="font-black">📋 Оставить заявку</h3>
          <p className="text-xs text-muted-foreground">Свяжемся и расскажем всё о платформе</p>
        </div>
        <div className="p-6">
          {formSent ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-2">🎉</div>
              <h4 className="font-black mb-1">Заявка принята!</h4>
              <p className="text-sm text-muted-foreground mb-4">Свяжемся в ближайшее время</p>
              <button onClick={() => setFormSent(false)} className="text-sm text-primary font-bold hover:underline">Отправить ещё</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Имя *" className="px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <input
                  value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="Телефон *" type="tel" className="px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <input
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="Email" type="email" className="px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <div className="grid grid-cols-2 gap-2">
                  {(['buyer', 'seller'] as LeadType[]).map(t => (
                    <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                      className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${form.type === t ? 'bg-primary text-white border-primary' : 'border-border text-foreground'}`}
                    >
                      {t === 'buyer' ? '🛍️ Покупатель' : '🏪 Продавец'}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                placeholder="Комментарий" rows={2}
                className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors resize-none"
              />
              {formError && <div className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2">{formError}</div>}
              <button type="submit" className="btn-primary w-full py-3 text-sm">Отправить заявку →</button>
            </form>
          )}
        </div>
      </section>

    </main>
  );
}
