interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t-2 border-primary/10 bg-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <button
              onClick={() => onNavigate('home')}
              className="font-black text-lg tracking-tight flex items-center gap-2 mb-3"
            >
              <span className="w-8 h-8 bg-primary rounded-lg text-white text-sm flex items-center justify-center font-black shadow-md shadow-primary/30">О'</span>
              О'<span className="text-primary">kak</span>
            </button>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Бесплатная площадка для покупки и продажи товаров. Торгуйся и выигрывай!
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
              ✅ Полностью бесплатно
            </span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3 text-primary">Покупателям</p>
            <ul className="space-y-2">
              {['Каталог', 'Магазины', 'Бонусы', 'Как купить'].map(item => (
                <li key={item}>
                  <button
                    onClick={() => onNavigate('catalog')}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{color: 'hsl(271,76%,60%)'}}>Продавцам</p>
            <ul className="space-y-2">
              {['Начать продавать', 'Бонусы продавца', 'Правила', 'Аналитика'].map(item => (
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
            <p className="text-xs font-bold uppercase tracking-wider mb-3 text-muted-foreground">Помощь</p>
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
          <p className="text-xs text-muted-foreground">© 2026 О'kak. Всё бесплатно, навсегда 🎉</p>
          <p className="text-xs text-muted-foreground">Политика конфиденциальности · Правила</p>
        </div>
      </div>
    </footer>
  );
}
