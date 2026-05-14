import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { PRODUCTS } from '@/data/products';

interface ProfilePageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const ORDERS = [
  { id: '#МК-82341', date: '10 мая 2026', product: 'Беспроводные наушники Pro', price: 12990, status: 'delivered', statusLabel: 'Доставлен' },
  { id: '#МК-77120', date: '2 мая 2026', product: 'Керамическая кружка Nord', price: 1890, status: 'delivered', statusLabel: 'Доставлен' },
  { id: '#МК-91005', date: '14 мая 2026', product: 'Кожаный кошелёк Slim', price: 3490, status: 'processing', statusLabel: 'В обработке' },
];

const MY_LISTINGS = PRODUCTS.slice(0, 2);

const STATUS_COLORS: Record<string, string> = {
  delivered: 'bg-green-100 text-green-700',
  processing: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'listings' | 'settings'>('orders');

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* User card */}
      <div className="bg-white border border-border rounded-3xl p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-16 h-16 bg-foreground text-background rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0">
          ИВ
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Иван Васильев</h1>
          <p className="text-muted-foreground text-sm">ivan@email.ru · Покупатель и продавец</p>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="text-muted-foreground">{ORDERS.length} заказов</span>
            <span className="text-muted-foreground">{MY_LISTINGS.length} объявления</span>
          </div>
        </div>
        <button className="px-4 py-2 border border-border rounded-xl text-sm hover:bg-secondary transition-colors flex items-center gap-2">
          <Icon name="Pencil" size={14} />
          Редактировать
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1 mb-6">
        {([
          { key: 'orders', label: 'Мои заказы', icon: 'ShoppingBag' },
          { key: 'listings', label: 'Мои товары', icon: 'Package' },
          { key: 'settings', label: 'Настройки', icon: 'Settings' },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key ? 'bg-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={tab.icon} size={14} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-3 animate-fade-in">
          {ORDERS.map(order => (
            <div key={order.id} className="bg-white border border-border rounded-2xl p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{order.id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                    {order.statusLabel}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{order.product}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{order.date}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-semibold">{order.price.toLocaleString('ru')} ₽</div>
                <button className="text-xs text-muted-foreground hover:text-foreground mt-1 transition-colors">
                  Подробнее
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Listings */}
      {activeTab === 'listings' && (
        <div className="animate-fade-in">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => onNavigate('catalog')}
              className="px-4 py-2 bg-foreground text-background rounded-xl text-sm font-medium hover:bg-foreground/80 transition-colors flex items-center gap-2"
            >
              <Icon name="Plus" size={14} />
              Добавить товар
            </button>
          </div>
          <div className="space-y-3">
            {MY_LISTINGS.map(product => (
              <div key={product.id} className="bg-white border border-border rounded-2xl p-4 flex items-center gap-4">
                <div className="w-14 h-14 bg-secondary rounded-xl overflow-hidden flex-shrink-0">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm mb-0.5">{product.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon name="Star" size={10} className="fill-amber-400 text-amber-400" />
                    {product.rating} · {product.reviews} отзывов
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-semibold">{product.price.toLocaleString('ru')} ₽</div>
                  <div className={`text-xs mt-1 ${product.inStock ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {product.inStock ? 'В наличии' : 'Нет в наличии'}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                    <Icon name="Pencil" size={14} className="text-muted-foreground" />
                  </button>
                  <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                    <Icon name="Trash2" size={14} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings */}
      {activeTab === 'settings' && (
        <div className="animate-fade-in space-y-4">
          {[
            { label: 'Имя', value: 'Иван Васильев', icon: 'User' },
            { label: 'Email', value: 'ivan@email.ru', icon: 'Mail' },
            { label: 'Телефон', value: '+7 900 123-45-67', icon: 'Phone' },
            { label: 'Город', value: 'Москва', icon: 'MapPin' },
          ].map(field => (
            <div key={field.label} className="bg-white border border-border rounded-2xl p-4 flex items-center gap-3">
              <Icon name={field.icon as Parameters<typeof Icon>[0]['name']} size={16} className="text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-0.5">{field.label}</div>
                <div className="text-sm font-medium">{field.value}</div>
              </div>
              <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
                <Icon name="Pencil" size={13} className="text-muted-foreground" />
              </button>
            </div>
          ))}

          <button className="w-full py-3 mt-4 text-destructive border border-destructive/30 rounded-xl text-sm font-medium hover:bg-destructive/5 transition-colors flex items-center justify-center gap-2">
            <Icon name="LogOut" size={14} />
            Выйти из аккаунта
          </button>
        </div>
      )}
    </main>
  );
}
