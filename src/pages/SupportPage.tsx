import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface SupportPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const FAQS = [
  { q: 'Как оформить заказ?', a: 'Выберите товар, нажмите «В корзину», затем перейдите в корзину и нажмите «Оформить заказ». Укажите адрес доставки и выберите способ оплаты.' },
  { q: 'Как связаться с продавцом?', a: 'На странице товара или профиля продавца нажмите «Написать продавцу». Откроется встроенный чат для переговоров.' },
  { q: 'Какие гарантии безопасности сделки?', a: 'Деньги хранятся на эскроу-счёте и переводятся продавцу только после подтверждения получения товара покупателем.' },
  { q: 'Как вернуть товар?', a: 'В течение 14 дней вы можете вернуть товар. Перейдите в «Мои заказы», выберите заказ и нажмите «Оформить возврат».' },
  { q: 'Как стать продавцом?', a: 'Зарегистрируйтесь на платформе, перейдите в «Личный кабинет» и нажмите «Стать продавцом». Верификация занимает 1-2 дня.' },
];

export default function SupportPage({ onNavigate }: SupportPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Поддержка</h1>
        <p className="text-muted-foreground">Мы готовы помочь вам 24/7</p>
      </div>

      {/* Contact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {[
          { icon: 'MessageCircle', title: 'Онлайн-чат', desc: 'Ответим в течение 5 минут', action: 'Написать в чат', onClick: () => onNavigate('chat') },
          { icon: 'Mail', title: 'Email', desc: 'support@market.ru', action: 'Отправить письмо', onClick: () => {} },
          { icon: 'Phone', title: 'Телефон', desc: '8-800-123-45-67 (бесплатно)', action: 'Позвонить', onClick: () => {} },
        ].map(card => (
          <div key={card.title} className="bg-white border border-border rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
              <Icon name={card.icon as Parameters<typeof Icon>[0]['name']} size={20} />
            </div>
            <h3 className="font-semibold mb-1">{card.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{card.desc}</p>
            <button
              onClick={card.onClick}
              className="w-full py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-colors"
            >
              {card.action}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Частые вопросы</h2>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white border border-border rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary transition-colors"
              >
                <span className="font-medium text-sm pr-4">{faq.q}</span>
                <Icon
                  name="ChevronDown"
                  size={16}
                  className={`text-muted-foreground flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 animate-fade-in">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact form */}
      <div className="bg-white border border-border rounded-3xl p-8">
        <h2 className="text-xl font-semibold mb-6">Написать нам</h2>
        {sent ? (
          <div className="text-center py-8 animate-fade-in">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Check" size={28} className="text-green-600" />
            </div>
            <h3 className="font-semibold mb-1">Сообщение отправлено!</h3>
            <p className="text-sm text-muted-foreground">Мы ответим в течение 24 часов на ваш email</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Имя</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Ваше имя"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="your@email.ru"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Тема</label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Тема обращения"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Сообщение</label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Опишите ваш вопрос..."
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-foreground text-background rounded-xl font-semibold text-sm hover:bg-foreground/80 transition-colors"
            >
              Отправить обращение
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
