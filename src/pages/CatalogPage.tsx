import { useState, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import ProductCard from '@/components/ProductCard';
import { PRODUCTS, CATEGORIES, Product } from '@/data/products';

interface CatalogPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onAddToCart: (product: Product) => void;
  initialCategory?: string;
  initialSearch?: string;
}

const SORT_OPTIONS = [
  { value: 'popular', label: 'По популярности' },
  { value: 'price_asc', label: 'Дешевле' },
  { value: 'price_desc', label: 'Дороже' },
  { value: 'rating', label: 'По рейтингу' },
];

export default function CatalogPage({ onNavigate, onAddToCart, initialCategory = 'Все', initialSearch = '' }: CatalogPageProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState('popular');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let items = [...PRODUCTS];
    if (selectedCategory !== 'Все') {
      items = items.filter(p => p.category === selectedCategory);
    }
    if (search) {
      items = items.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.seller.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (priceMin) items = items.filter(p => p.price >= Number(priceMin));
    if (priceMax) items = items.filter(p => p.price <= Number(priceMax));

    if (sort === 'price_asc') items.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') items.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') items.sort((a, b) => b.rating - a.rating);

    return items;
  }, [selectedCategory, search, sort, priceMin, priceMax]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Каталог</h1>
        <span className="text-sm text-muted-foreground">{filtered.length} товаров</span>
      </div>

      {/* Search + Sort */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по каталогу..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="px-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2.5 border rounded-xl text-sm flex items-center gap-2 transition-colors ${showFilters ? 'bg-foreground text-background border-foreground' : 'bg-white border-border hover:border-foreground'}`}
        >
          <Icon name="SlidersHorizontal" size={14} />
          <span className="hidden sm:inline">Фильтры</span>
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white border border-border rounded-2xl p-5 mb-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Цена от</label>
              <input
                type="number"
                value={priceMin}
                onChange={e => setPriceMin(e.target.value)}
                placeholder="0 ₽"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Цена до</label>
              <input
                type="number"
                value={priceMax}
                onChange={e => setPriceMax(e.target.value)}
                placeholder="∞ ₽"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setPriceMin(''); setPriceMax(''); }}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Сбросить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all ${
              selectedCategory === cat
                ? 'bg-foreground text-background'
                : 'bg-white border border-border hover:border-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={onNavigate}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Icon name="SearchX" size={48} className="mx-auto mb-4 text-muted-foreground/40" />
          <h3 className="font-semibold mb-1">Ничего не найдено</h3>
          <p className="text-sm text-muted-foreground">Попробуй другой запрос или категорию</p>
        </div>
      )}
    </main>
  );
}
