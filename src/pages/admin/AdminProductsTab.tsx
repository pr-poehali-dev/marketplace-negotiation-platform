import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { PRODUCTS, CATEGORIES } from '@/data/products';

type SortKey = 'article' | 'name' | 'price' | 'reviews' | 'category';

export default function AdminProductsTab() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Все');
  const [sortKey, setSortKey] = useState<SortKey>('article');
  const [sortAsc, setSortAsc] = useState(true);
  const [stockFilter, setStockFilter] = useState<'all' | 'in' | 'out'>('all');

  const handleSort = (k: SortKey) => {
    if (sortKey === k) setSortAsc(a => !a);
    else { setSortKey(k); setSortAsc(true); }
  };

  const filtered = PRODUCTS
    .filter(p => {
      const s = search.toLowerCase();
      const matchSearch = !s || p.article.toLowerCase().includes(s) || p.name.toLowerCase().includes(s) || p.seller.toLowerCase().includes(s);
      const matchCat = catFilter === 'Все' || p.category === catFilter;
      const matchStock = stockFilter === 'all' || (stockFilter === 'in' ? p.inStock : !p.inStock);
      return matchSearch && matchCat && matchStock;
    })
    .sort((a, b) => {
      let av: string | number = a[sortKey];
      let bv: string | number = b[sortKey];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      return sortAsc ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  const SortIcon = ({ k }: { k: SortKey }) => (
    <Icon
      name={sortKey === k ? (sortAsc ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'}
      size={12}
      className={sortKey === k ? 'text-primary' : 'text-muted-foreground/40'}
    />
  );

  return (
    <div className="animate-fade-in space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Артикул, название, продавец..."
            className="w-full pl-8 pr-3 py-2.5 bg-white border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary"
        >
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
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
          <span className="text-muted-foreground">Всего: </span><span className="font-black">{filtered.length}</span>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-xl px-4 py-2 text-sm">
          <span className="text-muted-foreground">В наличии: </span><span className="font-black text-green-700">{filtered.filter(p => p.inStock).length}</span>
        </div>
        <div className="bg-white border-2 border-red-200 rounded-xl px-4 py-2 text-sm">
          <span className="text-muted-foreground">Нет в наличии: </span><span className="font-black text-red-600">{filtered.filter(p => !p.inStock).length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-2 border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border bg-secondary/50">
                <th className="text-left px-4 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wide">
                  <button onClick={() => handleSort('article')} className="flex items-center gap-1">
                    Артикул <SortIcon k="article" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wide">Фото</th>
                <th className="text-left px-4 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wide">
                  <button onClick={() => handleSort('name')} className="flex items-center gap-1">
                    Название <SortIcon k="name" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wide">
                  <button onClick={() => handleSort('category')} className="flex items-center gap-1">
                    Категория <SortIcon k="category" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wide">Магазин</th>
                <th className="text-right px-4 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wide">
                  <button onClick={() => handleSort('price')} className="flex items-center gap-1 ml-auto">
                    Цена <SortIcon k="price" />
                  </button>
                </th>
                <th className="text-right px-4 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wide">
                  <button onClick={() => handleSort('reviews')} className="flex items-center gap-1 ml-auto">
                    Продажи <SortIcon k="reviews" />
                  </button>
                </th>
                <th className="text-center px-4 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wide">Статус</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-muted-foreground text-sm">
                    <span className="text-3xl block mb-2">🔍</span>
                    Товары не найдены
                  </td>
                </tr>
              ) : filtered.map((p, i) => (
                <tr key={p.id} className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${i % 2 === 0 ? '' : 'bg-secondary/10'}`}>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs bg-secondary px-2 py-0.5 rounded font-bold">{p.article}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-sm max-w-[200px] truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{p.description}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded-full font-medium">{p.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs">
                      <div className="font-semibold">{p.seller}</div>
                      <div className="font-mono text-muted-foreground">{p.sellerCode}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-black text-sm">{p.price.toLocaleString('ru')} ₽</div>
                    {p.originalPrice && (
                      <div className="text-xs text-muted-foreground line-through">{p.originalPrice.toLocaleString('ru')} ₽</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-semibold text-sm">{p.reviews}</div>
                    <div className="text-xs text-amber-500">⭐ {p.rating}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.inStock ? 'В наличии' : 'Нет'}
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
