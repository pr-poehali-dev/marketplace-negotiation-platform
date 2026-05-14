import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface Store {
  id: number;
  name: string;
  city: string;
  address: string;
  phone: string;
  hours: string;
  category: string;
  rating: number;
  reviews: number;
  avatar: string;
  color: string;
}

const STORES: Store[] = [
  { id: 1, name: 'ТехноМир на Арбате', city: 'Москва', address: 'ул. Арбат, 24', phone: '+7 495 123-45-67', hours: '10:00–22:00', category: 'Электроника', rating: 4.8, reviews: 312, avatar: 'ТМ', color: 'bg-fun-blue' },
  { id: 2, name: 'ТехноМир Митино', city: 'Москва', address: 'ул. Митинская, 30', phone: '+7 495 987-65-43', hours: '09:00–21:00', category: 'Электроника', rating: 4.6, reviews: 198, avatar: 'ТМ', color: 'bg-fun-blue' },
  { id: 3, name: 'LeatherCo', city: 'Москва', address: 'Кузнецкий мост, 7', phone: '+7 495 321-00-11', hours: '11:00–20:00', category: 'Аксессуары', rating: 4.7, reviews: 89, avatar: 'LC', color: 'bg-fun-orange' },
  { id: 4, name: 'CeramicStudio', city: 'Москва', address: 'Чистые пруды, 5', phone: '+7 495 555-44-33', hours: '12:00–20:00', category: 'Дом', rating: 4.9, reviews: 156, avatar: 'CS', color: 'bg-fun-pink' },
  { id: 5, name: 'ТехноМир СПб', city: 'Санкт-Петербург', address: 'Невский пр., 55', phone: '+7 812 123-45-67', hours: '10:00–22:00', category: 'Электроника', rating: 4.7, reviews: 241, avatar: 'ТМ', color: 'bg-fun-blue' },
  { id: 6, name: 'SportZone', city: 'Санкт-Петербург', address: 'ул. Рубинштейна, 12', phone: '+7 812 777-88-99', hours: '09:00–21:00', category: 'Спорт', rating: 4.5, reviews: 134, avatar: 'SZ', color: 'bg-fun-green' },
  { id: 7, name: 'ModaHouse', city: 'Санкт-Петербург', address: 'Гороховая ул., 8', phone: '+7 812 444-55-66', hours: '10:00–21:00', category: 'Одежда', rating: 4.6, reviews: 88, avatar: 'МH', color: 'bg-fun-purple' },
  { id: 8, name: 'ТехноМир Казань', city: 'Казань', address: 'ул. Баумана, 44', phone: '+7 843 111-22-33', hours: '10:00–21:00', category: 'Электроника', rating: 4.5, reviews: 175, avatar: 'ТМ', color: 'bg-fun-blue' },
  { id: 9, name: 'КазаньМода', city: 'Казань', address: 'пр. Победы, 15', phone: '+7 843 999-88-77', hours: '10:00–20:00', category: 'Одежда', rating: 4.4, reviews: 62, avatar: 'КМ', color: 'bg-fun-pink' },
  { id: 10, name: 'ТехноМир Екб', city: 'Екатеринбург', address: 'ул. Вайнера, 10', phone: '+7 343 234-56-78', hours: '09:00–21:00', category: 'Электроника', rating: 4.6, reviews: 203, avatar: 'ТМ', color: 'bg-fun-blue' },
  { id: 11, name: 'УралСпорт', city: 'Екатеринбург', address: 'ул. Малышева, 33', phone: '+7 343 876-54-32', hours: '09:00–20:00', category: 'Спорт', rating: 4.7, reviews: 91, avatar: 'УС', color: 'bg-fun-green' },
  { id: 12, name: 'НовосибТех', city: 'Новосибирск', address: 'Красный пр., 100', phone: '+7 383 100-20-30', hours: '10:00–21:00', category: 'Электроника', rating: 4.5, reviews: 142, avatar: 'НТ', color: 'bg-fun-blue' },
];

const CITIES = ['Все города', ...Array.from(new Set(STORES.map(s => s.city)))];
const CATEGORY_COLORS: Record<string, string> = {
  'Электроника': 'bg-blue-100 text-blue-700',
  'Аксессуары': 'bg-orange-100 text-orange-700',
  'Дом': 'bg-pink-100 text-pink-700',
  'Спорт': 'bg-green-100 text-green-700',
  'Одежда': 'bg-purple-100 text-purple-700',
};

export default function StoresPage({ onNavigate }: { onNavigate: (page: string, params?: Record<string, string>) => void }) {
  const [selectedCity, setSelectedCity] = useState('Все города');
  const [search, setSearch] = useState('');

  const filtered = STORES.filter(s => {
    const cityMatch = selectedCity === 'Все города' || s.city === selectedCity;
    const searchMatch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.address.toLowerCase().includes(search.toLowerCase());
    return cityMatch && searchMatch;
  });

  const grouped = CITIES.slice(1).reduce<Record<string, Store[]>>((acc, city) => {
    const stores = filtered.filter(s => s.city === city);
    if (stores.length > 0) acc[city] = stores;
    return acc;
  }, {});

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl animate-bounce-light">🏪</span>
          <h1 className="text-3xl font-black">Наши магазины</h1>
        </div>
        <p className="text-muted-foreground">Найди магазин рядом с тобой и приходи лично!</p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Icon name="MapPin" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по названию или адресу..."
            className="w-full pl-9 pr-4 py-3 bg-white border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CITIES.map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`flex-shrink-0 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                selectedCity === city
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'bg-white border-2 border-border hover:border-primary'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Stores grouped by city */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl block mb-4">🔍</span>
          <p className="text-muted-foreground">Магазины не найдены</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([city, stores]) => (
            <div key={city}>
              <div className="flex items-center gap-2 mb-4">
                <Icon name="MapPin" size={18} className="text-primary" />
                <h2 className="text-xl font-bold">{city}</h2>
                <span className="text-sm text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full">{stores.length} {stores.length === 1 ? 'магазин' : 'магазина'}</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stores.map(store => (
                  <div key={store.id} className="bg-white border-2 border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-lg transition-all group animate-fade-in">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-12 h-12 ${store.color} rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-sm`}>
                        {store.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm leading-snug mb-1">{store.name}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[store.category] || 'bg-gray-100 text-gray-600'}`}>
                          {store.category}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2 text-sm">
                        <Icon name="MapPin" size={13} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{store.address}</span>
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

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-1.5">
                        <Icon name="Star" size={13} className="fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold">{store.rating}</span>
                        <span className="text-xs text-muted-foreground">({store.reviews})</span>
                      </div>
                      <button
                        onClick={() => onNavigate('catalog')}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        Товары <Icon name="ArrowRight" size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
