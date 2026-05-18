import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { moderatorApi, ModProduct } from '@/api/moderator';
import { productsApi, Category } from '@/api/products';

type SortKey = 'title' | 'price' | 'reviews_count' | 'category_name' | 'views';

export default function AdminProductsTab() {
  const [products, setProducts] = useState<ModProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Все');
  const [sortKey, setSortKey] = useState<SortKey>('title');
  const [sortAsc, setSortAsc] = useState(true);
  const [stockFilter, setStockFilter] = useState<'all' | 'in' | 'out'>('all');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      moderatorApi.products(),
      productsApi.categories(),
    ]).then(([prodRes, catRes]) => {
      setProducts(prodRes.products);
      setCategories(catRes.categories);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (k: SortKey) => {
    if (sortKey === k) setSortAsc(a => !a);
    else { setSortKey(k); setSortAsc(true); }
  };

  const filtered = products
    .filter(p => {
      const s = search.toLowerCase();
      const matchSearch = !s
        || p.title.toLowerCase().includes(s)
        || p.shop_name.toLowerCase().includes(s)
        || p.seller_name.toLowerCase().includes(s)
        || p.category_name.toLowerCase().includes(s);
      const matchCat = catFilter === 'Все' || p.category_name === catFilter;
      const matchStock = stockFilter === 'all' || (stockFilter === 'in' ? p.in_stock : !p.in_stock);
      return matchSearch && matchCat && matchStock;
    })
    .sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortAsc ? av.localeCompare(bv, 'ru') : bv.localeCompare(av, 'ru');
      }
      return sortAsc ? (Number(av) - Number(bv)) : (Number(bv) - Number(av));
    });

  const SortIcon = ({ k }: { k: SortKey }) => (
    <Icon
      name={sortKey === k ? (sortAsc ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'}
      size={12}
      className={sortKey === k ? 'text-primary' : 'text-muted-foreground/40'}
    />
  );

  const categoryOptions = ['Все', ...categories.map(c => c.name)];

  return (
    <div className="animate-fade-in space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Название, продавец, категория..."
            className="w-full pl-8 pr-3 py-2.5 bg-white border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary"
        >
          {categoryOptions.map(c => <option key={c}>{c}</option>)}
        </select>

        <div className="flex gap-1">
          {([
            { k: 'all', label: 'Все' },
            { k: 'in',  label: '✅ В наличии' },
            { k: 'out', label: '❌ Нет' },
          ] as const).map(f => (
            <button
              key={f.k}
              onClick={() => setStockFilter(f.k)}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${stockFilter === f.k ? 'bg-primary text-white border-primary' : 'bg-white border-border text-muted-foreground hover:border-primary/40'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3 flex-wrap">
        <div className="bg-white border-2 border-border rounded-xl px-4 py-2 text-sm">
          <span className="text-muted-foreground">Всего: </span>
          <span className="font-black">{loading ? '...' : filtered.length}</span>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-xl px-4 py-2 text-sm">
          <span className="text-muted-foreground">В наличии: </span>
          <span className="font-black text-green-700">{filtered.filter(p => p.in_stock).length}</span>
        </div>
        <div className="bg-white border-2 border-red-200 rounded-xl px-4 py-2 text-sm">
          <span className="text-muted-foreground">Нет в наличии: </span>
          <span className="font-black text-red-600">{filtered.filter(p => !p.in_stock).length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-2 border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border bg-secondary/50">
                <th className="text-left px-4 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wide">
                  <button onClick={() => handleSort('title')} className="flex items-center gap-1">
                    Название <SortIcon k="title" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wide">
                  <button onClick={() => handleSort('category_name')} className="flex items-center gap-1">
                    Категория <SortIcon k="category_name" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wide">Магазин</th>
                <th className="text-right px-4 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wide">
                  <button onClick={() => handleSort('price')} className="flex items-center gap-1 ml-auto">
                    Цена <SortIcon k="price" />
                  </button>
                </th>
                <th className="text-right px-4 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wide">
                  <button onClick={() => handleSort('reviews_count')} className="flex items-center gap-1 ml-auto">
                    Отзывы <SortIcon k="reviews_count" />
                  </button>
                </th>
                <th className="text-right px-4 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wide">
                  <button onClick={() => handleSort('views')} className="flex items-center gap-1 ml-auto">
                    Просмотры <SortIcon k="views" />
                  </button>
                </th>
                <th className="text-center px-4 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wide">Статус</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50 animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-secondary rounded w-3/4" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-secondary rounded w-20" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-secondary rounded w-24" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-secondary rounded w-16 ml-auto" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-secondary rounded w-10 ml-auto" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-secondary rounded w-14 ml-auto" /></td>
                    <td className="px-4 py-3"><div className="h-5 bg-secondary rounded-full w-16 mx-auto" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                    <span className="text-3xl block mb-2">🔍</span>
                    Товары не найдены
                  </td>
                </tr>
              ) : filtered.map((p, i) => (
                <tr key={p.id} className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${i % 2 === 0 ? '' : 'bg-secondary/10'}`}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-sm max-w-[220px] truncate">{p.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">⭐ {p.rating}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded-full font-medium">{p.category_name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs">
                      <div className="font-semibold truncate max-w-[140px]">{p.shop_name}</div>
                      <div className="text-muted-foreground truncate max-w-[140px]">{p.seller_name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-black text-sm">{p.price.toLocaleString('ru')} ₽</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-semibold text-sm">{p.reviews_count}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-sm text-muted-foreground">{p.views.toLocaleString('ru')}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.in_stock ? 'В наличии' : 'Нет'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
