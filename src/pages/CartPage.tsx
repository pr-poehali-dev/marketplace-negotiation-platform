import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Product } from '@/data/products';

interface CartItem extends Product {
  quantity: number;
}

interface CartPageProps {
  cartItems: CartItem[];
  onUpdateCart: (items: CartItem[]) => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function CartPage({ cartItems, onUpdateCart, onNavigate }: CartPageProps) {
  const [promoCode, setPromoCode] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = total > 5000 ? 0 : 350;

  const updateQuantity = (id: number, delta: number) => {
    onUpdateCart(
      cartItems.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const removeItem = (id: number) => {
    onUpdateCart(cartItems.filter(item => item.id !== id));
  };

  if (orderPlaced) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center animate-fade-in">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="Check" size={32} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Заказ оформлен!</h2>
        <p className="text-muted-foreground mb-8">Номер заказа: <span className="font-semibold text-foreground">#МК-{Math.floor(Math.random() * 90000) + 10000}</span></p>
        <p className="text-sm text-muted-foreground mb-8">Продавец свяжется с вами в течение 2 часов для подтверждения.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => onNavigate('home')}
            className="px-6 py-3 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-colors"
          >
            На главную
          </button>
          <button
            onClick={() => onNavigate('profile')}
            className="px-6 py-3 bg-foreground text-background rounded-xl text-sm font-medium hover:bg-foreground/80 transition-colors"
          >
            Мои заказы
          </button>
        </div>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center animate-fade-in">
        <Icon name="ShoppingCart" size={56} className="mx-auto mb-4 text-muted-foreground/30" />
        <h2 className="text-xl font-semibold mb-2">Корзина пуста</h2>
        <p className="text-muted-foreground text-sm mb-8">Добавьте товары из каталога</p>
        <button
          onClick={() => onNavigate('catalog')}
          className="px-8 py-3 bg-foreground text-background rounded-xl font-medium text-sm hover:bg-foreground/80 transition-colors"
        >
          Перейти в каталог
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Корзина</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 space-y-3">
          {cartItems.map(item => (
            <div key={item.id} className="bg-white border border-border rounded-2xl p-4 flex gap-4 animate-fade-in">
              <div
                className="w-20 h-20 bg-secondary rounded-xl overflow-hidden flex-shrink-0 cursor-pointer"
                onClick={() => onNavigate('product', { id: String(item.id) })}
              >
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => onNavigate('product', { id: String(item.id) })}
                  className="font-medium text-sm mb-1 text-left hover:text-muted-foreground transition-colors line-clamp-2"
                >
                  {item.name}
                </button>
                <p className="text-xs text-muted-foreground mb-3">{item.seller}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button onClick={() => updateQuantity(item.id, -1)} className="px-2.5 py-1.5 hover:bg-secondary transition-colors">
                      <Icon name="Minus" size={12} />
                    </button>
                    <span className="px-3 text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="px-2.5 py-1.5 hover:bg-secondary transition-colors">
                      <Icon name="Plus" size={12} />
                    </button>
                  </div>
                  <span className="font-semibold text-sm">{(item.price * item.quantity).toLocaleString('ru')} ₽</span>
                </div>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-destructive transition-colors self-start"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="md:col-span-1">
          <div className="bg-white border border-border rounded-2xl p-6 sticky top-24">
            <h3 className="font-semibold mb-4">Итого</h3>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Товары ({cartItems.length})</span>
                <span>{total.toLocaleString('ru')} ₽</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Доставка</span>
                <span className={delivery === 0 ? 'text-green-600' : ''}>{delivery === 0 ? 'Бесплатно' : `${delivery} ₽`}</span>
              </div>
              {delivery > 0 && (
                <p className="text-xs text-muted-foreground">Бесплатно при заказе от 5 000 ₽</p>
              )}
            </div>
            <div className="border-t border-border pt-4 mb-4">
              <div className="flex justify-between font-semibold">
                <span>К оплате</span>
                <span>{(total + delivery).toLocaleString('ru')} ₽</span>
              </div>
            </div>

            {/* Promo */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
                placeholder="Промокод"
                className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button className="px-3 py-2 border border-border rounded-lg text-sm hover:bg-secondary transition-colors">
                Применить
              </button>
            </div>

            <button
              onClick={() => setOrderPlaced(true)}
              className="w-full py-3.5 bg-foreground text-background rounded-xl font-semibold text-sm hover:bg-foreground/80 transition-colors"
            >
              Оформить заказ
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
