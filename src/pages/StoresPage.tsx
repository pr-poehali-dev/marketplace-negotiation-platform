import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface Store {
  id: number;
  name: string;
  sellerCode: string;
  city: string;
  address: string;
  phone: string;
  hours: string;
  category: string;
  rating: number;
  reviews: number;
  avatar: string;
  color: string;
  status: 'approved' | 'pending';
}

const STORES: Store[] = [
  { id: 1, name: 'ТехноМир', sellerCode: 'SHOP-1173', city: 'Москва', address: 'ул. Арбат, 24', phone: '+7 495 123-45-67', hours: '10:00–22:00', category: 'Электроника', rating: 4.8, reviews: 312, avatar: 'ТМ', color: 'bg-blue-500', status: 'approved' },
  { id: 2, name: 'ТехноМир Митино', sellerCode: 'SHOP-1174', city: 'Москва', address: 'ул. Митинская, 30', phone: '+7 495 987-65-43', hours: '09:00–21:00', category: 'Электроника', rating: 4.6, reviews: 198, avatar: 'ТМ', color: 'bg-blue-500', status: 'approved' },
  { id: 3, name: 'LeatherCo', sellerCode: 'SHOP-2241', city: 'Санкт-Петербург', address: 'Кузнецкий мост, 7', phone: '+7 812 321-00-11', hours: '11:00–20:00', category: 'Аксессуары', rating: 4.7, reviews: 89, avatar: 'LC', color: 'bg-orange-500', status: 'approved' },
  { id: 4, name: 'CeramicStudio', sellerCode: 'SHOP-3309', city: 'Казань', address: 'ул. Баумана, 44', phone: '+7 843 555-44-33', hours: '12:00–20:00', category: 'Дом', rating: 4.9, reviews: 156, avatar: 'CS', color: 'bg-pink-500', status: 'approved' },
  { id: 5, name: 'SportZone', sellerCode: 'SHOP-4412', city: 'Санкт-Петербург', address: 'ул. Рубинштейна, 12', phone: '+7 812 777-88-99', hours: '09:00–21:00', category: 'Спорт', rating: 4.5, reviews: 134, avatar: 'SZ', color: 'bg-green-500', status: 'approved' },
  { id: 6, name: 'ModaHouse', sellerCode: 'SHOP-5521', city: 'Москва', address: 'Гороховая ул., 8', phone: '+7 495 444-55-66', hours: '10:00–21:00', category: 'Одежда', rating: 4.6, reviews: 88, avatar: 'МH', color: 'bg-purple-500', status: 'approved' },
  { id: 7, name: 'КнигоМир', sellerCode: 'SHOP-6630', city: 'Екатеринбург', address: 'ул. Вайнера, 10', phone: '+7 343 234-56-78', hours: '09:00–21:00', category: 'Книги', rating: 4.6, reviews: 203, avatar: 'КМ', color: 'bg-yellow-500', status: 'approved' },
  { id: 8, name: 'УралСпорт', sellerCode: 'SHOP-7741', city: 'Екатеринбург', address: 'ул. Малышева, 33', phone: '+7 343 876-54-32', hours: '09:00–20:00', category: 'Спорт', rating: 4.7, reviews: 91, avatar: 'УС', color: 'bg-green-600', status: 'approved' },
  { id: 9, name: 'НовосибТех', sellerCode: 'SHOP-8852', city: 'Новосибирск', address: 'Красный пр., 100', phone: '+7 383 100-20-30', hours: '10:00–21:00', category: 'Электроника', rating: 4.5, reviews: 142, avatar: 'НТ', color: 'bg-blue-600', status: 'approved' },
  { id: 10, name: 'КрасотаPro', sellerCode: 'SHOP-9963', city: 'Москва', address: 'Тверская ул., 15', phone: '+7 495 600-11-22', hours: '10:00–22:00', category: 'Красота', rating: 4.8, reviews: 220, avatar: 'КП', color: 'bg-red-400', status: 'approved' },
  { id: 11, name: 'СпортЛэнд', sellerCode: 'SHOP-2290', city: 'Казань', address: 'ул. Баумана, 55', phone: '+7 843 222-33-44', hours: '09:00–21:00', category: 'Спорт', rating: 0, reviews: 0, avatar: 'СЛ', color: 'bg-teal-500', status: 'pending' },
  { id: 12, name: 'ДетскийМир+', sellerCode: 'SHOP-1099', city: 'Новосибирск', address: 'ул. Ленина, 50', phone: '+7 383 500-60-70', hours: '09:00–21:00', category: 'Игрушки', rating: 4.4, reviews: 77, avatar: 'ДМ', color: 'bg-indigo-500', status: 'approved' },
];

const CATEGORY_COLORS: Record<string, string> = {
  'Электроника': 'bg-blue-100 text-blue-700',
  'Аксессуары': 'bg-orange-100 text-orange-700',
  'Дом': 'bg-pink-100 text-pink-700',
  'Спорт': 'bg-green-100 text-green-700',
  'Одежда': 'bg-purple-100 text-purple-700',
  'Книги': 'bg-yellow-100 text-yellow-700',
  'Красота': 'bg-red-100 text-red-700',
  'Игрушки': 'bg-indigo-100 text-indigo-700',
};

const ALL_CATEGORIES = ['Все', ...Array.from(new Set(STORES.map(s => s.category)))];

export default function StoresPage({ onNavigate }: { onNavigate: (page: string, params?: Record<string, string>) => void }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');

  const filtered = STORES.filter(s => {
    const catMatch = selectedCategory === 'Все' || s.category === selectedCategory;
    const searchMatch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.sellerCode.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch && s.status === 'approved';
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl animate-bounce-light">🏪</span>
          <h1 className="text-3xl font-black">Все магазины</h1>
          <span className="bg-primary/10 text-primary font-bold text-sm px-3 py-1 rounded-full">{filtered.length}</span>
        </div>
        <p className="text-muted-foreground">Проверенные продавцы с подтверждёнными документами</p>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 relative">
          <Icon name="Search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по названию, коду (SHOP-...) или городу..."
            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {ALL_CATEGORIES.map((cat, i) => {
          const colors = ['bg-secondary', 'bg-blue-100 text-blue-700', 'bg-orange-100 text-orange-700', 'bg-pink-100 text-pink-700', 'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700', 'bg-yellow-100 text-yellow-700', 'bg-red-100 text-red-700', 'bg-indigo-100 text-indigo-700'];
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                  : `${colors[i % colors.length]} border-transparent hover:border-primary/30`
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl block mb-4">🔍</span>
          <p className="text-muted-foreground">Магазины не найдены</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(store => (
            <div key={store.id} className="bg-white border-2 border-border rounded-2xl p-5 hover:border-primary/50 hover:shadow-lg transition-all group animate-fade-in">
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-12 h-12 ${store.color} rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-sm`}>
                  {store.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-sm leading-snug">{store.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold">{store.sellerCode}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[store.category] || 'bg-gray-100 text-gray-600'}`}>
                      {store.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="MapPin" size={13} className="text-primary flex-shrink-0" />
                  <span className="text-muted-foreground"><span className="font-semibold text-foreground">{store.city}</span>, {store.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Phone" size={13} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">{store.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Clock" size={13} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">{store.hours}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t-2 border-border">
                <div className="flex items-center gap-1.5">
                  {store.rating > 0 ? (
                    <>
                      <Icon name="Star" size={13} className="fill-amber-400 text-amber-400" />
                      <span className="text-sm font-black">{store.rating}</span>
                      <span className="text-xs text-muted-foreground">({store.reviews})</span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">Новый магазин</span>
                  )}
                </div>
                <button
                  onClick={() => onNavigate('catalog')}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  Товары <Icon name="ArrowRight" size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
