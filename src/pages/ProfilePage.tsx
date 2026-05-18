import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/context/AuthContext';
import QRCard from '@/components/QRCard';
import { productsApi, Product } from '@/api/products';

interface ProfilePageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onShowAuth: () => void;
}

const ORDERS = [
  { id: '#МК-82341', date: '10 мая 2026', product: 'Беспроводные наушники Pro', article: 'ЭЛЕ-00001', price: 12990, status: 'delivered', statusLabel: 'Доставлен' },
  { id: '#МК-77120', date: '2 мая 2026', product: 'Керамическая кружка Nord', article: 'ДОМ-00003', price: 1890, status: 'delivered', statusLabel: 'Доставлен' },
  { id: '#МК-91005', date: '14 мая 2026', product: 'Кожаный кошелёк Slim', article: 'ОДЕ-00002', price: 3490, status: 'processing', statusLabel: 'В обработке' },
];

const STATUS_COLORS: Record<string, string> = {
  delivered: 'bg-green-100 text-green-700',
  processing: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function ProfilePage({ onNavigate, onShowAuth }: ProfilePageProps) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'listings' | 'qr' | 'settings'>('orders');

  /* ── listings (seller products) ── */
  const [listings, setListings] = useState<Product[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const sellerProfile = user?.seller_profile ?? null;

  /* загружаем товары продавца когда открыта вкладка "Товары" */
  useEffect(() => {
    if (activeTab !== 'listings' || !sellerProfile) return;
    setListingsLoading(true);
    productsApi.list({ seller_id: sellerProfile.id })
      .then(res => setListings(res.products))
      .catch(err => console.error('listings load error', err))
      .finally(() => setListingsLoading(false));
  }, [activeTab, sellerProfile]);

  if (!user) {
    return (
      <main className="max-w-md mx-auto px-4 py-20 text-center">
        <span className="text-5xl block mb-4">👤</span>
        <h2 className="text-2xl font-black mb-2">Личный кабинет</h2>
        <p className="text-muted-foreground mb-6 text-sm">Войдите или зарегистрируйтесь для доступа к кабинету</p>
        <button
          onClick={onShowAuth}
          className="w-full py-3.5 bg-primary text-white rounded-xl font-black text-sm hover:opacity-90 transition-all shadow-md shadow-primary/30"
        >
          Войти / Зарегистрироваться 🚀
        </button>
      </main>
    );
  }

  const tabs = [
    { key: 'orders', label: 'Заказы', icon: 'ShoppingBag' },
    { key: 'listings', label: 'Товары', icon: 'Package' },
    { key: 'qr', label: 'QR', icon: 'QrCode' },
    { key: 'settings', label: 'Настройки', icon: 'Settings' },
  ] as const;

  const SELLER_STATUS_MAP = {
    pending: { label: 'На проверке', cls: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    approved: { label: 'Одобрен ✓', cls: 'bg-green-100 text-green-700 border-green-300' },
    rejected: { label: 'Отклонён', cls: 'bg-red-100 text-red-700 border-red-300' },
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* User card */}
      <div className="bg-white border-2 border-border rounded-3xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center text-xl font-black flex-shrink-0 shadow-md shadow-primary/30 overflow-hidden">
            {user.avatar_url
              ? <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
              : user.name.slice(0, 2).toUpperCase()
            }
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl font-black">{user.name}</h1>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                user.role === 'moderator' ? 'bg-red-100 text-red-700 border-red-300' :
                user.role === 'seller' ? 'bg-purple-100 text-purple-700 border-purple-300' :
                'bg-blue-100 text-blue-700 border-blue-300'
              }`}>
                {user.role === 'moderator' ? '🛡️ Модератор' : user.role === 'seller' ? '🏪 Продавец' : '🛍️ Покупатель'}
              </span>
            </div>
            <p className="text-muted-foreground text-sm">{user.phone}</p>
            <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
              <span className="font-bold text-primary flex items-center gap-1">🎁 {user.bonus_points} баллов</span>
              {user.orders_count > 0 && <span className="text-muted-foreground">{user.orders_count} заказа</span>}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {user.role === 'moderator' && (
              <button
                onClick={() => onNavigate('admin')}
                className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors flex items-center gap-2 shadow-md shadow-red-500/30"
              >
                <Icon name="LayoutDashboard" size={14} /> Панель управления
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Seller profile status */}
      {sellerProfile && (
        <div className={`border-2 rounded-2xl p-4 mb-6 flex items-center justify-between gap-3 ${SELLER_STATUS_MAP[sellerProfile.status as keyof typeof SELLER_STATUS_MAP]?.cls || 'border-border'}`}>
          <div className="flex items-center gap-3">
            <span className="text-xl">{sellerProfile.status === 'approved' ? '✅' : sellerProfile.status === 'rejected' ? '❌' : '⏳'}</span>
            <div>
              <p className="font-bold text-sm">Магазин «{sellerProfile.shop_name}»</p>
              <p className="text-xs opacity-80">Статус: {SELLER_STATUS_MAP[sellerProfile.status as keyof typeof SELLER_STATUS_MAP]?.label || sellerProfile.status}</p>
            </div>
          </div>
          {sellerProfile.status === 'rejected' && (
            <button onClick={() => onNavigate('seller-register')} className="flex-shrink-0 px-3 py-1.5 bg-white rounded-xl text-xs font-bold hover:opacity-80 transition-opacity">
              Переподать
            </button>
          )}
        </div>
      )}

      {/* Кнопка стать продавцом */}
      {!sellerProfile && user.role !== 'moderator' && (
        <div className="bg-gradient-to-r from-orange-50 to-purple-50 border-2 border-primary/20 rounded-2xl p-4 mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="font-bold text-sm">🚀 Хотите продавать на О'kak?</p>
            <p className="text-xs text-muted-foreground">Зарегистрируйте магазин — это бесплатно!</p>
          </div>
          <button
            onClick={() => onNavigate('seller-register')}
            className="flex-shrink-0 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all"
          >
            Открыть магазин
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.key ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
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
            <div key={order.id} className="bg-white border-2 border-border rounded-2xl p-4 flex items-center gap-4 hover:border-primary/40 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-black text-sm">{order.id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[order.status]}`}>
                    {order.statusLabel}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{order.product}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-muted-foreground">{order.date}</p>
                  <span className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">{order.article}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-black">{order.price.toLocaleString('ru')} ₽</div>
                <button className="text-xs text-primary hover:underline mt-1 transition-colors">
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
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {sellerProfile ? `Товары магазина «${sellerProfile.shop_name}»` : 'Нет активного магазина'}
            </p>
            {sellerProfile?.status === 'approved' && (
              <button
                onClick={() => onNavigate('catalog')}
                className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
              >
                <Icon name="Plus" size={14} />
                Добавить товар
              </button>
            )}
          </div>

          {/* Нет магазина */}
          {!sellerProfile && (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
              <Icon name="Store" size={40} className="mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm font-semibold mb-1">Магазин не зарегистрирован</p>
              <p className="text-xs text-muted-foreground mb-4">Зарегистрируйте магазин, чтобы начать продавать</p>
              <button
                onClick={() => onNavigate('seller-register')}
                className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all"
              >
                Открыть магазин
              </button>
            </div>
          )}

          {/* Магазин на проверке / отклонён */}
          {sellerProfile && sellerProfile.status !== 'approved' && (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
              <span className="text-4xl block mb-3">
                {sellerProfile.status === 'pending' ? '⏳' : '❌'}
              </span>
              <p className="text-sm font-semibold mb-1">
                {sellerProfile.status === 'pending' ? 'Магазин на проверке' : 'Магазин отклонён'}
              </p>
              <p className="text-xs text-muted-foreground">
                {sellerProfile.status === 'pending'
                  ? 'Товары можно добавлять после одобрения модератором'
                  : 'Обратитесь в поддержку или переподайте заявку'}
              </p>
            </div>
          )}

          {/* Список товаров */}
          {sellerProfile?.status === 'approved' && (
            <>
              {listingsLoading && (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white border-2 border-border rounded-2xl p-4 animate-pulse flex gap-4">
                      <div className="w-14 h-14 bg-secondary rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-secondary rounded w-1/2" />
                        <div className="h-3 bg-secondary rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!listingsLoading && listings.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
                  <Icon name="Package" size={40} className="mx-auto mb-3 text-muted-foreground/40" />
                  <p className="text-sm font-semibold mb-1">Товаров пока нет</p>
                  <p className="text-xs text-muted-foreground mb-4">Добавьте первый товар в каталог</p>
                  <button
                    onClick={() => onNavigate('catalog')}
                    className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all"
                  >
                    Добавить товар
                  </button>
                </div>
              )}
              {!listingsLoading && listings.length > 0 && (
                <div className="space-y-3">
                  {listings.map(product => {
                    const image = product.images?.[0];
                    return (
                      <div
                        key={product.id}
                        className="bg-white border-2 border-border rounded-2xl p-4 flex items-center gap-4 hover:border-primary/40 transition-colors cursor-pointer"
                        onClick={() => onNavigate('product', { id: String(product.id) })}
                      >
                        <div className="w-14 h-14 bg-secondary rounded-xl overflow-hidden flex-shrink-0">
                          {image
                            ? <img src={image} alt={product.title} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-muted-foreground/30"><Icon name="Image" size={20} /></div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm mb-0.5 truncate">{product.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                            {product.article && <span className="font-mono bg-secondary px-1.5 py-0.5 rounded">{product.article}</span>}
                            <span>{product.category.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{product.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-black">{product.price.toLocaleString('ru')} ₽</div>
                          <div className={`text-xs mt-1 font-semibold ${product.in_stock ? 'text-green-600' : 'text-muted-foreground'}`}>
                            {product.in_stock ? 'В наличии' : 'Нет в наличии'}
                          </div>
                        </div>
                        <Icon name="ChevronRight" size={16} className="text-muted-foreground flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Скрытый input для фото (оставляем для совместимости) */}
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" />
        </div>
      )}

      {/* QR */}
      {activeTab === 'qr' && (
        <div className="animate-fade-in">
          <p className="text-sm text-muted-foreground mb-5">Поделитесь QR-кодом с покупателями или друзьями — они попадут прямо в ваш профиль.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <QRCard
              value={String(user.id)}
              title="Мой код покупателя"
              label="Покажи код — получи скидку от продавца"
            />
            {sellerProfile?.status === 'approved' && (
              <QRCard
                value={String(sellerProfile.id)}
                title="QR-код магазина"
                label={`Магазин «${sellerProfile.shop_name}»`}
              />
            )}
          </div>
          {!sellerProfile && (
            <div className="mt-4 bg-secondary rounded-2xl p-5 text-center">
              <p className="text-sm text-muted-foreground mb-3">QR-код магазина появится после регистрации и одобрения вашего магазина</p>
              <button onClick={() => onNavigate('seller-register')} className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all">
                Зарегистрировать магазин
              </button>
            </div>
          )}
        </div>
      )}

      {/* Settings */}
      {activeTab === 'settings' && (
        <div className="animate-fade-in space-y-4">
          {[
            { label: 'Имя', value: user.name, icon: 'User' },
            { label: 'Телефон', value: user.phone, icon: 'Phone' },
            { label: 'ID', value: String(user.id), icon: 'Hash' },
            { label: 'Роль', value: user.role === 'buyer' ? 'Покупатель' : user.role === 'seller' ? 'Продавец' : 'Модератор', icon: 'Shield' },
          ].map(field => (
            <div key={field.label} className="bg-white border-2 border-border rounded-2xl p-4 flex items-center gap-3 hover:border-primary/30 transition-colors">
              <Icon name={field.icon as Parameters<typeof Icon>[0]['name']} size={16} className="text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-0.5">{field.label}</div>
                <div className="text-sm font-semibold">{field.value}</div>
              </div>
              {field.label !== 'ID' && field.label !== 'Роль' && (
                <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
                  <Icon name="Pencil" size={13} className="text-muted-foreground" />
                </button>
              )}
            </div>
          ))}

          <button
            onClick={logout}
            className="w-full py-3 mt-4 text-destructive border-2 border-destructive/30 rounded-xl text-sm font-bold hover:bg-destructive/5 transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="LogOut" size={14} />
            Выйти из аккаунта
          </button>
        </div>
      )}
    </main>
  );
}