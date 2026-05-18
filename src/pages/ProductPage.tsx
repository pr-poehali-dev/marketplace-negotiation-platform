import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { productsApi, Product } from '@/api/products';
import { negotiationsApi } from '@/api/negotiations';
import { useAuth } from '@/context/AuthContext';

interface ProductPageProps {
  productId: number;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onAddToCart: (product: Product) => void;
}

type OfferStatus = 'idle' | 'sending' | 'pending' | 'accepted' | 'rejected' | 'error';

export default function ProductPage({ productId, onNavigate, onAddToCart }: ProductPageProps) {
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews'>('desc');

  const [offerPrice, setOfferPrice] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [offerStatus, setOfferStatus] = useState<OfferStatus>('idle');
  const [offerError, setOfferError] = useState('');
  const [showOfferForm, setShowOfferForm] = useState(false);

  useEffect(() => {
    setLoading(true);
    productsApi.get(productId)
      .then(p => setProduct(p))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [productId]);

  const handleSendOffer = async () => {
    if (!product) return;
    const price = Number(offerPrice);
    if (!price || price <= 0 || price >= product.price) return;
    if (!user) {
      onNavigate('auth');
      return;
    }
    setOfferStatus('sending');
    setOfferError('');
    try {
      await negotiationsApi.start(product.id, price, offerMessage || undefined);
      setOfferStatus('pending');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      if (msg.includes('already exists')) {
        setOfferError('У вас уже есть активный торг по этому товару.');
      } else {
        setOfferError('Не удалось отправить предложение. Попробуй ещё раз.');
      }
      setOfferStatus('error');
    }
  };

  const handleGoToChat = () => {
    onNavigate('chat');
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid md:grid-cols-2 gap-10 animate-pulse">
          <div className="bg-secondary rounded-3xl aspect-square" />
          <div className="space-y-4">
            <div className="h-6 bg-secondary rounded w-1/3" />
            <div className="h-8 bg-secondary rounded w-2/3" />
            <div className="h-10 bg-secondary rounded w-1/2" />
            <div className="h-4 bg-secondary rounded" />
            <div className="h-4 bg-secondary rounded w-4/5" />
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="max-w-xl mx-auto px-4 py-20 text-center">
        <Icon name="PackageX" size={48} className="mx-auto mb-4 text-muted-foreground/40" />
        <h2 className="text-xl font-bold mb-2">Товар не найден</h2>
        <button onClick={() => onNavigate('catalog')} className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all">
          В каталог
        </button>
      </main>
    );
  }

  const image = product.images?.[0] || '';

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <button onClick={() => onNavigate('home')} className="hover:text-primary transition-colors">Главная</button>
        <Icon name="ChevronRight" size={14} />
        <button onClick={() => onNavigate('catalog')} className="hover:text-primary transition-colors">Каталог</button>
        <Icon name="ChevronRight" size={14} />
        <span className="text-foreground font-medium truncate">{product.title}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 mb-12">
        {/* Image */}
        <div className="bg-secondary rounded-3xl overflow-hidden aspect-square">
          {image ? (
            <img src={image} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
              <Icon name="Image" size={64} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">{product.category.name}</span>
            {product.article && (
              <span className="text-xs font-mono bg-secondary text-muted-foreground px-2.5 py-1 rounded-full">Арт: {product.article}</span>
            )}
            {!product.in_stock && (
              <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2.5 py-1 rounded-full">Нет в наличии</span>
            )}
          </div>

          <h1 className="text-2xl font-bold mb-3">{product.title}</h1>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(i => (
                <Icon key={i} name="Star" size={14} className={i <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-border fill-border'} />
              ))}
            </div>
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-muted-foreground">({product.reviews_count} отзывов)</span>
          </div>

          <div className="mb-6">
            <div className="flex items-end gap-3">
              <span className="text-4xl font-black">{product.price.toLocaleString('ru')} ₽</span>
              {product.original_price && (
                <span className="text-lg text-muted-foreground line-through mb-1">{product.original_price.toLocaleString('ru')} ₽</span>
              )}
            </div>
            {product.original_price && (
              <span className="text-sm text-green-600 font-semibold">
                Экономия: {(product.original_price - product.price).toLocaleString('ru')} ₽
              </span>
            )}
          </div>

          {/* Quantity + add */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center border-2 border-border rounded-xl overflow-hidden">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2.5 hover:bg-secondary transition-colors">
                <Icon name="Minus" size={14} />
              </button>
              <span className="px-4 py-2.5 text-sm font-bold min-w-[3rem] text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2.5 hover:bg-secondary transition-colors">
                <Icon name="Plus" size={14} />
              </button>
            </div>
            <button
              onClick={() => onAddToCart(product)}
              disabled={!product.in_stock}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md shadow-primary/30"
            >
              <Icon name="ShoppingBag" size={16} />
              {product.in_stock ? 'В корзину' : 'Нет в наличии'}
            </button>
          </div>

          {/* Торг кнопка */}
          {product.in_stock && product.allow_negotiation && (
            <button
              onClick={() => { setShowOfferForm(!showOfferForm); setOfferStatus('idle'); setOfferPrice(''); setOfferMessage(''); setOfferError(''); }}
              className="py-3 border-2 border-primary text-primary rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 mb-3"
            >
              🤝 Предложить свою цену
            </button>
          )}

          {/* Торг форма */}
          {showOfferForm && (offerStatus === 'idle' || offerStatus === 'error') && (
            <div className="bg-orange-50 border-2 border-primary/30 rounded-2xl p-4 mb-3 animate-fade-in">
              <p className="text-sm font-bold mb-1">💬 Укажи свою цену</p>
              <p className="text-xs text-muted-foreground mb-3">Продавец получит уведомление и решит — принять или отклонить предложение</p>
              <div className="flex gap-2 mb-2">
                <div className="flex-1">
                  <input
                    type="number"
                    value={offerPrice}
                    onChange={e => setOfferPrice(e.target.value)}
                    placeholder="Ваша цена, ₽"
                    className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <button
                  onClick={handleSendOffer}
                  disabled={!offerPrice || Number(offerPrice) <= 0 || Number(offerPrice) >= product.price}
                  className="px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Отправить
                </button>
              </div>
              <input
                type="text"
                value={offerMessage}
                onChange={e => setOfferMessage(e.target.value)}
                placeholder="Сообщение продавцу (необязательно)"
                className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-primary mb-1"
              />
              {Number(offerPrice) >= product.price && offerPrice !== '' && (
                <p className="text-xs text-destructive mt-1.5">Цена должна быть ниже {product.price.toLocaleString('ru')} ₽</p>
              )}
              {offerStatus === 'error' && offerError && (
                <p className="text-xs text-destructive mt-1.5">{offerError}</p>
              )}
            </div>
          )}

          {/* Статус sending */}
          {offerStatus === 'sending' && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4 mb-3 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <p className="text-sm font-bold text-yellow-800">Отправляем предложение...</p>
              </div>
            </div>
          )}

          {/* Статус pending */}
          {offerStatus === 'pending' && (
            <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-4 mb-3 animate-fade-in">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">✅</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-green-800">Предложение отправлено!</p>
                  <p className="text-xs text-green-600 mb-3">
                    Ваша цена: <span className="font-bold">{Number(offerPrice).toLocaleString('ru')} ₽</span>. Ожидайте ответа продавца в переговорах.
                  </p>
                  <button
                    onClick={handleGoToChat}
                    className="w-full py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Icon name="MessageCircle" size={15} />
                    Перейти к переговорам
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => onNavigate('chat')}
            className="py-3 border-2 border-border rounded-xl font-semibold text-sm hover:bg-secondary transition-colors flex items-center justify-center gap-2 mb-6"
          >
            <Icon name="MessageCircle" size={16} />
            Написать продавцу
          </button>

          {/* Seller */}
          <div
            className="flex items-center gap-3 p-4 border-2 border-border rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-secondary transition-all"
            onClick={() => onNavigate('seller', { id: String(product.seller.id) })}
          >
            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-sm font-black flex-shrink-0">
              {product.seller.logo ? (
                <img src={product.seller.logo} alt={product.seller.shop_name} className="w-full h-full object-cover rounded-full" />
              ) : (
                product.seller.shop_name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{product.seller.shop_name}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                {product.seller.city && <span>{product.seller.city}</span>}
              </div>
            </div>
            <Icon name="ChevronRight" size={16} className="text-muted-foreground flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b-2 border-border mb-6 flex gap-6">
        {(['desc', 'reviews'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'desc' ? 'Описание' : `Отзывы (${product.reviews_count})`}
          </button>
        ))}
      </div>

      {activeTab === 'desc' && (
        <div className="animate-fade-in max-w-2xl">
          <p className="text-muted-foreground leading-relaxed">{product.description || 'Описание отсутствует.'}</p>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="animate-fade-in max-w-2xl">
          <p className="text-muted-foreground text-sm">Отзывы пока недоступны.</p>
        </div>
      )}
    </main>
  );
}
