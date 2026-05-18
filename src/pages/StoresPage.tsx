import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { sellersApi, SellerProfile } from '@/api/products';

const AVATAR_COLORS = ['bg-blue-500', 'bg-orange-500', 'bg-pink-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-400', 'bg-indigo-500', 'bg-teal-500'];

export default function StoresPage({ onNavigate }: { onNavigate: (page: string, params?: Record<string, string>) => void }) {
  const [search, setSearch] = useState('');
  const [stores, setStores] = useState<SellerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sellersApi.list()
      .then(d => setStores(d.sellers))
      .catch(() => setStores([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = stores.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.shop_name.toLowerCase().includes(q) || (s.city || '').toLowerCase().includes(q);
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🏪</span>
          <h1 className="text-3xl font-black">Все магазины</h1>
          <span className="bg-primary/10 text-primary font-bold text-sm px-3 py-1 rounded-full">{filtered.length}</span>
        </div>
        <p className="text-muted-foreground">Проверенные продавцы с подтверждёнными документами</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Icon name="Search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по названию или городу..."
            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border-2 border-border rounded-2xl p-5 animate-pulse">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-secondary rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary rounded w-3/4" />
                  <div className="h-3 bg-secondary rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl block mb-4">🔍</span>
          <p className="text-muted-foreground">
            {stores.length === 0 ? 'Пока нет одобренных магазинов' : 'Магазины не найдены'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((store, idx) => {
            const initials = store.shop_name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase();
            const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            return (
              <div
                key={store.id}
                className="bg-white border-2 border-border rounded-2xl p-5 hover:border-primary/50 hover:shadow-lg transition-all group cursor-pointer animate-fade-in"
                onClick={() => onNavigate('seller', { id: String(store.id) })}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-12 h-12 ${colorClass} rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-sm overflow-hidden`}>
                    {store.logo
                      ? <img src={store.logo} alt={store.shop_name} className="w-full h-full object-cover" />
                      : initials
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-sm leading-snug">{store.shop_name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold">#{store.id}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 mb-4">
                  {store.city && (
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="MapPin" size={13} className="text-primary flex-shrink-0" />
                      <span className="text-muted-foreground font-semibold">{store.city}</span>
                    </div>
                  )}
                  {store.contact_phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="Phone" size={13} className="text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">{store.contact_phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon name="ShoppingBag" size={13} className="text-primary" />
                    <span>{store.products_count} товаров</span>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">✓ Проверен</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
