import { useState } from 'react';
import Icon from '@/components/ui/icon';

const BUYER_BONUSES = [
  {
    icon: '🎯',
    title: 'Бонус за первую покупку',
    desc: 'Совершите первую покупку на О\'kak и получите 200 бонусных баллов на следующий заказ',
    points: '+200 баллов',
    color: 'bg-orange-50 border-orange-200',
    badgeColor: 'bg-primary text-white',
  },
  {
    icon: '🔁',
    title: 'За каждую покупку',
    desc: '1% от суммы каждой покупки возвращается баллами. 1 балл = 1 рубль скидки.',
    points: '+1% кэшбэк',
    color: 'bg-blue-50 border-blue-200',
    badgeColor: 'bg-fun-blue text-white',
  },
  {
    icon: '⭐',
    title: 'За отзыв с фото',
    desc: 'Оставьте отзыв с фотографией товара — получите 50 дополнительных баллов',
    points: '+50 баллов',
    color: 'bg-yellow-50 border-yellow-200',
    badgeColor: 'bg-fun-yellow text-foreground',
  },
  {
    icon: '👥',
    title: 'Приведи друга',
    desc: 'Пригласи друга по реферальной ссылке. Когда он совершит первую покупку — вы оба получаете по 300 баллов!',
    points: '+300 баллов',
    color: 'bg-green-50 border-green-200',
    badgeColor: 'bg-fun-green text-white',
  },
  {
    icon: '🎂',
    title: 'День рождения',
    desc: 'В день рождения вы получаете 500 праздничных баллов. Не забудь указать дату в профиле!',
    points: '+500 баллов',
    color: 'bg-pink-50 border-pink-200',
    badgeColor: 'bg-fun-pink text-white',
  },
  {
    icon: '📦',
    title: 'За 10 покупок',
    desc: 'Совершите 10 покупок на платформе и получите статус «Постоянный покупатель» с повышенным кэшбэком 3%',
    points: 'Статус VIP',
    color: 'bg-purple-50 border-purple-200',
    badgeColor: 'bg-fun-purple text-white',
  },
];

const SELLER_BONUSES = [
  {
    icon: '🚀',
    title: 'Первая продажа',
    desc: 'Совершите первую продажу и получите расширенное размещение товаров на 7 дней бесплатно',
    reward: 'Топ выдача 7 дней',
    color: 'bg-orange-50 border-orange-200',
    badgeColor: 'bg-primary text-white',
  },
  {
    icon: '📊',
    title: 'За объём продаж',
    desc: 'Продайте товаров на сумму от 50 000 ₽ в месяц — получите бейдж «Топ-продавец» и приоритет в поиске',
    reward: 'Бейдж + приоритет',
    color: 'bg-blue-50 border-blue-200',
    badgeColor: 'bg-fun-blue text-white',
  },
  {
    icon: '💬',
    title: 'Быстрый ответ',
    desc: 'Отвечайте на запросы покупателей в течение 1 часа. При рейтинге ответа выше 90% — бонус к видимости',
    reward: '+30% видимость',
    color: 'bg-green-50 border-green-200',
    badgeColor: 'bg-fun-green text-white',
  },
  {
    icon: '❤️',
    title: 'Высокий рейтинг',
    desc: 'Поддерживайте рейтинг 4.8 и выше — ваши товары автоматически попадают в раздел «Лучшие предложения»',
    reward: 'Лучшие предложения',
    color: 'bg-pink-50 border-pink-200',
    badgeColor: 'bg-fun-pink text-white',
  },
  {
    icon: '🎁',
    title: '100 сделок',
    desc: 'Совершите 100 успешных сделок и получите статус «Проверенный продавец» с синим значком верификации',
    reward: '✓ Верификация',
    color: 'bg-yellow-50 border-yellow-200',
    badgeColor: 'bg-fun-yellow text-foreground',
  },
  {
    icon: '📷',
    title: 'Качество фото',
    desc: 'Добавляйте качественные фото товаров (от 3 штук). Такие объявления получают +50% кликов',
    reward: '+50% кликов',
    color: 'bg-purple-50 border-purple-200',
    badgeColor: 'bg-fun-purple text-white',
  },
];

const LEVELS = [
  { name: 'Новичок', min: 0, max: 500, icon: '🌱', color: 'text-green-600', bg: 'bg-green-100' },
  { name: 'Активный', min: 500, max: 2000, icon: '⚡', color: 'text-blue-600', bg: 'bg-blue-100' },
  { name: 'Постоянный', min: 2000, max: 5000, icon: '🌟', color: 'text-orange-600', bg: 'bg-orange-100' },
  { name: 'VIP', min: 5000, max: 99999, icon: '👑', color: 'text-purple-600', bg: 'bg-purple-100' },
];

export default function BonusesPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');
  const currentPoints = 320;
  const currentLevel = LEVELS.find(l => currentPoints >= l.min && currentPoints < l.max) || LEVELS[0];
  const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1];
  const progress = nextLevel ? ((currentPoints - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100 : 100;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-3 animate-bounce-light">🎁</div>
        <h1 className="text-3xl font-black mb-2">Бонусная программа</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          О'kak полностью бесплатен! А бонусная программа делает покупки и продажи ещё выгоднее.
        </p>
      </div>

      {/* My balance card */}
      <div className="bg-gradient-to-br from-primary via-orange-400 to-yellow-400 rounded-3xl p-6 md:p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-20 w-24 h-24 bg-white/10 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">Мои баллы</p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black">{currentPoints}</span>
                <span className="text-white/80 mb-1">баллов</span>
              </div>
            </div>
            <div className={`flex items-center gap-2 ${currentLevel.bg} ${currentLevel.color} px-4 py-2 rounded-xl font-bold`}>
              <span className="text-xl">{currentLevel.icon}</span>
              <span>{currentLevel.name}</span>
            </div>
          </div>
          {nextLevel && (
            <div>
              <div className="flex justify-between text-sm text-white/80 mb-2">
                <span>До уровня «{nextLevel.name}»</span>
                <span>{nextLevel.min - currentPoints} баллов</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Levels */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {LEVELS.map((level, i) => (
          <div
            key={level.name}
            className={`rounded-2xl p-4 text-center border-2 ${currentLevel.name === level.name ? 'border-primary shadow-md shadow-primary/20' : 'border-border bg-white'}`}
          >
            <span className="text-2xl block mb-1">{level.icon}</span>
            <div className="font-bold text-sm">{level.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {i < LEVELS.length - 1 ? `${level.min}–${level.max} баллов` : `от ${level.min} баллов`}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setActiveTab('buyer')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'buyer'
              ? 'bg-primary text-white shadow-md shadow-primary/30'
              : 'bg-white border-2 border-border hover:border-primary text-muted-foreground'
          }`}
        >
          🛍️ Для покупателей
        </button>
        <button
          onClick={() => setActiveTab('seller')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'seller'
              ? 'bg-fun-purple text-white shadow-md'
              : 'bg-white border-2 border-border text-muted-foreground hover:border-fun-purple'
          }`}
          style={activeTab === 'seller' ? { backgroundColor: 'hsl(271,76%,60%)' } : {}}
        >
          🏪 Для продавцов
        </button>
      </div>

      {/* Buyer bonuses */}
      {activeTab === 'buyer' && (
        <div className="animate-fade-in">
          <p className="text-sm text-muted-foreground mb-5 flex items-center gap-2">
            <span className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">!</span>
            1 балл = 1 рубль скидки при следующей покупке. Баллы не сгорают!
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {BUYER_BONUSES.map(bonus => (
              <div key={bonus.title} className={`border-2 ${bonus.color} rounded-2xl p-5 animate-fade-in`}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl flex-shrink-0">{bonus.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm mb-1">{bonus.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{bonus.desc}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <span className={`${bonus.badgeColor} text-xs font-bold px-3 py-1.5 rounded-full`}>
                    {bonus.points}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-secondary rounded-2xl p-6 text-center">
            <p className="font-bold mb-2">Начни копить баллы прямо сейчас! 🚀</p>
            <p className="text-sm text-muted-foreground mb-4">Сделай первую покупку и получи 200 стартовых баллов</p>
            <button
              onClick={() => onNavigate('catalog')}
              className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Перейти в каталог
            </button>
          </div>
        </div>
      )}

      {/* Seller bonuses */}
      {activeTab === 'seller' && (
        <div className="animate-fade-in">
          <p className="text-sm text-muted-foreground mb-5 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: 'hsl(271,76%,60%)' }}>!</span>
            Бонусы продавца повышают видимость ваших товаров и доверие покупателей — совершенно бесплатно!
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {SELLER_BONUSES.map(bonus => (
              <div key={bonus.title} className={`border-2 ${bonus.color} rounded-2xl p-5 animate-fade-in`}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl flex-shrink-0">{bonus.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm mb-1">{bonus.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{bonus.desc}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <span className={`${bonus.badgeColor} text-xs font-bold px-3 py-1.5 rounded-full`}>
                    {bonus.reward}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl p-6 text-center text-white" style={{ background: 'linear-gradient(135deg, hsl(271,76%,60%), hsl(211,95%,55%))' }}>
            <p className="font-bold mb-2">Начни продавать сегодня! 🏪</p>
            <p className="text-sm text-white/80 mb-4">Размещение товаров бесплатное. Первая продажа — уже в кармане бонус!</p>
            <button
              onClick={() => onNavigate('profile')}
              className="px-8 py-3 bg-white text-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Стать продавцом
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
