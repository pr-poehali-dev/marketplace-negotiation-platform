import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { PRODUCTS, REVIEWS, SELLERS, Product } from '@/data/products';

interface ProductPageProps {
  productId: number;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onAddToCart: (product: Product) => void;
}

type OfferStatus = 'idle' | 'pending' | 'accepted' | 'rejected';

export default function ProductPage({ productId, onNavigate, onAddToCart }: ProductPageProps) {
  const product = PRODUCTS.find(p => p.id === productId) || PRODUCTS[0];
  const seller = SELLERS.find(s => s.id === product.sellerId) || SELLERS[0];
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews'>('desc');

  const [offerPrice, setOfferPrice] = useState('');
  const [offerStatus, setOfferStatus] = useState<OfferStatus>('idle');
  const [showOfferForm, setShowOfferForm] = useState(false);

  const handleSendOffer = () => {
    const price = Number(offerPrice);
    if (!price || price <= 0 || price >= product.price) return;
    setOfferStatus('pending');

    // Симуляция ответа продавца через 2.5 сек
    setTimeout(() => {
      const discount = (product.price - price) / product.price;
      // Принимает если скидка до 20%
      if (discount <= 0.2) {
        setOfferStatus('accepted');
      } else {
        setOfferStatus('rejected');
      }
    }, 2500);
  };

  const handleGoToChat = () => {
    onNavigate('chat', {
      sellerId: String(product.sellerId),
      offerPrice: offerPrice,
      productName: product.name,
    });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <button onClick={() => onNavigate('home')} className="hover:text-primary transition-colors">Главная</button>
        <Icon name="ChevronRight" size={14} />
        <button onClick={() => onNavigate('catalog')} className="hover:text-primary transition-colors">Каталог</button>
        <Icon name="ChevronRight" size={14} />
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 mb-12">
        {/* Image */}
        <div className="bg-secondary rounded-3xl overflow-hidden aspect-square">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">{product.category}</span>
            <span className="text-xs font-mono bg-secondary text-muted-foreground px-2.5 py-1 rounded-full">Арт: {product.article}</span>
            <span className="text-xs font-mono bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full">{product.sellerCode}</span>
            {!product.inStock && (
              <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2.5 py-1 rounded-full">Нет в наличии</span>
            )}
          </div>

          <h1 className="text-2xl font-bold mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(i => (
                <Icon key={i} name="Star" size={14} className={i <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-border fill-border'} />
              ))}
            </div>
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-muted-foreground">({product.reviews} отзывов)</span>
          </div>

          <div className="mb-6">
            <div className="flex items-end gap-3">
              <span className="text-4xl font-black">{product.price.toLocaleString('ru')} ₽</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through mb-1">{product.originalPrice.toLocaleString('ru')} ₽</span>
              )}
            </div>
            {product.originalPrice && (
              <span className="text-sm text-green-600 font-semibold">
                Экономия: {(product.originalPrice - product.price).toLocaleString('ru')} ₽
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {product.tags.map(tag => (
              <span key={tag} className="text-xs bg-secondary px-2.5 py-1 rounded-full text-muted-foreground">#{tag}</span>
            ))}
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
              disabled={!product.inStock}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md shadow-primary/30"
            >
              <Icon name="ShoppingBag" size={16} />
              {product.inStock ? 'В корзину' : 'Нет в наличии'}
            </button>
          </div>

          {/* Торг кнопка */}
          {product.inStock && (
            <button
              onClick={() => { setShowOfferForm(!showOfferForm); setOfferStatus('idle'); setOfferPrice(''); }}
              className="py-3 border-2 border-primary text-primary rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 mb-3"
            >
              🤝 Предложить свою цену
            </button>
          )}

          {/* Торг форма */}
          {showOfferForm && offerStatus === 'idle' && (
            <div className="bg-orange-50 border-2 border-primary/30 rounded-2xl p-4 mb-3 animate-fade-in">
              <p className="text-sm font-bold mb-1">💬 Укажи свою цену</p>
              <p className="text-xs text-muted-foreground mb-3">Продавец получит уведомление и решит — принять или отклонить предложение</p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    value={offerPrice}
                    onChange={e => setOfferPrice(e.target.value)}
                    placeholder={`Ваша цена, ₽`}
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
              {Number(offerPrice) >= product.price && offerPrice !== '' && (
                <p className="text-xs text-destructive mt-1.5">Цена должна быть ниже {product.price.toLocaleString('ru')} ₽</p>
              )}
            </div>
          )}

          {/* Статус pending */}
          {offerStatus === 'pending' && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4 mb-3 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-yellow-800">Ожидаем ответа продавца...</p>
                  <p className="text-xs text-yellow-600">Ваше предложение: {Number(offerPrice).toLocaleString('ru')} ₽</p>
                </div>
              </div>
            </div>
          )}

          {/* Статус accepted */}
          {offerStatus === 'accepted' && (
            <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-4 mb-3 animate-fade-in">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">🎉</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-green-800">Продавец принял предложение!</p>
                  <p className="text-xs text-green-600 mb-3">Цена сделки: <span className="font-bold">{Number(offerPrice).toLocaleString('ru')} ₽</span></p>
                  <button
                    onClick={handleGoToChat}
                    className="w-full py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Icon name="MessageCircle" size={15} />
                    Перейти в чат с продавцом
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Статус rejected */}
          {offerStatus === 'rejected' && (
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 mb-3 animate-fade-in">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">😔</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-800">Продавец отклонил предложение</p>
                  <p className="text-xs text-red-600 mb-3">Слишком большая скидка. Попробуй предложить чуть больше.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setOfferStatus('idle'); setOfferPrice(''); }}
                      className="flex-1 py-2 border-2 border-red-300 text-red-700 rounded-xl font-semibold text-xs hover:bg-red-50 transition-colors"
                    >
                      Другая цена
                    </button>
                    <button
                      onClick={() => onNavigate('chat', { sellerId: String(product.sellerId) })}
                      className="flex-1 py-2 bg-primary text-white rounded-xl font-semibold text-xs hover:opacity-90 transition-all"
                    >
                      Написать продавцу
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => onNavigate('chat', { sellerId: String(product.sellerId) })}
            className="py-3 border-2 border-border rounded-xl font-semibold text-sm hover:bg-secondary transition-colors flex items-center justify-center gap-2 mb-6"
          >
            <Icon name="MessageCircle" size={16} />
            Написать продавцу
          </button>

          {/* Seller */}
          <div
            className="flex items-center gap-3 p-4 border-2 border-border rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-secondary transition-all"
            onClick={() => onNavigate('seller', { id: String(seller.id) })}
          >
            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-sm font-black flex-shrink-0">
              {seller.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{seller.name}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Icon name="Star" size={10} className="fill-amber-400 text-amber-400" />
                {seller.rating} · {seller.sales} продаж
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
            {tab === 'desc' ? 'Описание' : `Отзывы (${product.reviews})`}
          </button>
        ))}
      </div>

      {activeTab === 'desc' && (
        <div className="animate-fade-in max-w-2xl">
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4 animate-fade-in max-w-2xl">
          {REVIEWS.map(review => (
            <div key={review.id} className="bg-white border-2 border-border rounded-2xl p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {review.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{review.author}</span>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {[1,2,3,4,5].map(i => (
                      <Icon key={i} name="Star" size={11} className={i <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-border fill-border'} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}