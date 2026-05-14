interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-border bg-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <button
              onClick={() => onNavigate('home')}
              className="font-bold text-lg tracking-tight flex items-center gap-2 mb-2"
            >
              <span className="w-6 h-6 bg-foreground rounded text-background text-xs flex items-center justify-center font-bold">М</span>
              Маркет
            </button>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Безопасная площадка для покупки и продажи товаров между людьми.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3">Покупателям</p>
            <ul className="space-y-2">
              {['Каталог', 'Как купить', 'Доставка', 'Возврат'].map(item => (
                <li key={item}>
                  <button
                    onClick={() => onNavigate('catalog')}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3">Продавцам</p>
            <ul className="space-y-2">
              {['Начать продавать', 'Тарифы', 'Правила', 'Аналитика'].map(item => (
                <li key={item}>
                  <button
                    onClick={() => onNavigate('profile')}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3">Помощь</p>
            <ul className="space-y-2">
              {['Поддержка', 'FAQ', 'Безопасность', 'О нас'].map(item => (
                <li key={item}>
                  <button
                    onClick={() => onNavigate('support')}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">© 2026 Маркет. Все права защищены.</p>
          <p className="text-xs text-muted-foreground">ИНН 1234567890 · Политика конфиденциальности</p>
        </div>
      </div>
    </footer>
  );
}
