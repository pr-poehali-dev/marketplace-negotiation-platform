import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  cartCount: number;
}

export default function Header({ currentPage, onNavigate, cartCount }: HeaderProps) {
  const [searchValue, setSearchValue] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { key: 'home', label: 'Главная', emoji: '🏠' },
    { key: 'catalog', label: 'Каталог', emoji: '🛍️' },
    { key: 'stores', label: 'Магазины', emoji: '🏪' },
    { key: 'bonuses', label: 'Бонусы', emoji: '🎁' },
    { key: 'chat', label: 'Сообщения', emoji: '💬' },
    { key: 'profile', label: 'Кабинет', emoji: '👤' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      onNavigate('catalog', { search: searchValue });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-primary/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex-shrink-0 flex items-center gap-2 font-bold text-xl"
          >
            <span className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/30">
              <span className="text-white text-sm font-black">О'</span>
            </span>
            <span className="hidden sm:block font-black tracking-tight">
              О'<span className="text-primary">kak</span>
            </span>
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                placeholder="Найти товар, продавца..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-secondary border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
              />
            </div>
          </form>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`px-3 py-2 text-sm rounded-xl transition-all font-medium ${
                  currentPage === item.key
                    ? 'bg-primary text-white shadow-sm shadow-primary/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Cart + mobile menu */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('cart')}
              className="relative p-2 rounded-xl hover:bg-secondary transition-colors"
            >
              <Icon name="ShoppingBag" size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-secondary transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Icon name={mobileMenuOpen ? 'X' : 'Menu'} size={20} />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-3 border-t border-border mt-0 pt-3 animate-fade-in grid grid-cols-3 gap-1">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => { onNavigate(item.key); setMobileMenuOpen(false); }}
                className={`flex flex-col items-center gap-1 px-2 py-2.5 text-xs rounded-xl transition-colors ${
                  currentPage === item.key ? 'bg-primary text-white font-semibold' : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                <span>{item.emoji}</span>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
