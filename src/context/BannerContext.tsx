import { createContext, useContext, useState, ReactNode } from 'react';

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  btnPrimary: string;
  btnSecondary: string;
  gradient: string;
  imageUrl?: string;
}

const DEFAULT_BANNERS: HeroBanner[] = [
  {
    id: 'b1',
    title: "О'kak — торгуйся\nи побеждай! 🎉",
    subtitle: 'Предлагай свою цену, продавец принимает — и сразу в чат!\nТысячи товаров. Встроенный торг. Полностью бесплатно.',
    badge: '✅ Абсолютно бесплатно!',
    btnPrimary: 'Смотреть каталог',
    btnSecondary: 'Стать продавцом',
    gradient: 'linear-gradient(135deg, hsl(24,95%,53%) 0%, hsl(330,85%,60%) 50%, hsl(271,76%,60%) 100%)',
  },
  {
    id: 'b2',
    title: 'Тысячи товаров\nбез наценок 📦',
    subtitle: 'Прямые продажи от продавцов. Никаких скрытых комиссий.\nЧат с продавцом встроен в платформу.',
    badge: '🚀 Новые поступления',
    btnPrimary: 'Открыть каталог',
    btnSecondary: 'Как это работает',
    gradient: 'linear-gradient(135deg, hsl(211,95%,55%) 0%, hsl(271,76%,60%) 100%)',
  },
  {
    id: 'b3',
    title: 'Продавай без\nкомиссий навсегда 🤝',
    subtitle: 'Создай свой магазин за 5 минут. Принимай заявки на торг.\nВыплаты напрямую — без посредников.',
    badge: '🏪 Для продавцов',
    btnPrimary: 'Открыть магазин',
    btnSecondary: 'Узнать больше',
    gradient: 'linear-gradient(135deg, hsl(142,72%,40%) 0%, hsl(174,80%,35%) 100%)',
  },
];

interface BannerContextType {
  banners: HeroBanner[];
  banner: HeroBanner;
  addBanner: (b: Omit<HeroBanner, 'id'>) => void;
  updateBanner: (id: string, patch: Partial<HeroBanner>) => void;
  deleteBanner: (id: string) => void;
  reorderBanners: (banners: HeroBanner[]) => void;
  resetBanners: () => void;
}

const BannerContext = createContext<BannerContextType | null>(null);

export function BannerProvider({ children }: { children: ReactNode }) {
  const [banners, setBanners] = useState<HeroBanner[]>(DEFAULT_BANNERS);

  const addBanner = (b: Omit<HeroBanner, 'id'>) =>
    setBanners(prev => [...prev, { ...b, id: `b${Date.now()}` }]);

  const updateBanner = (id: string, patch: Partial<HeroBanner>) =>
    setBanners(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b));

  const deleteBanner = (id: string) =>
    setBanners(prev => prev.filter(b => b.id !== id));

  const reorderBanners = (bs: HeroBanner[]) => setBanners(bs);

  const resetBanners = () => setBanners(DEFAULT_BANNERS);

  return (
    <BannerContext.Provider value={{
      banners,
      banner: banners[0] ?? DEFAULT_BANNERS[0],
      addBanner,
      updateBanner,
      deleteBanner,
      reorderBanners,
      resetBanners,
    }}>
      {children}
    </BannerContext.Provider>
  );
}

export function useBanner() {
  const ctx = useContext(BannerContext);
  if (!ctx) throw new Error('useBanner must be inside BannerProvider');
  return ctx;
}
