import { createContext, useContext, useState, ReactNode } from 'react';

export interface HeroBanner {
  title: string;
  subtitle: string;
  badge: string;
  btnPrimary: string;
  btnSecondary: string;
  gradient: string;
}

const DEFAULT_BANNER: HeroBanner = {
  title: "О'kak — торгуйся\nи побеждай! 🎉",
  subtitle: 'Предлагай свою цену, продавец принимает — и сразу в чат!\nТысячи товаров. Встроенный торг. Полностью бесплатно.',
  badge: '✅ Абсолютно бесплатно!',
  btnPrimary: 'Смотреть каталог',
  btnSecondary: 'Стать продавцом',
  gradient: 'linear-gradient(135deg, hsl(24,95%,53%) 0%, hsl(330,85%,60%) 50%, hsl(271,76%,60%) 100%)',
};

interface BannerContextType {
  banner: HeroBanner;
  updateBanner: (patch: Partial<HeroBanner>) => void;
  resetBanner: () => void;
}

const BannerContext = createContext<BannerContextType | null>(null);

export function BannerProvider({ children }: { children: ReactNode }) {
  const [banner, setBanner] = useState<HeroBanner>(DEFAULT_BANNER);

  const updateBanner = (patch: Partial<HeroBanner>) =>
    setBanner(prev => ({ ...prev, ...patch }));

  const resetBanner = () => setBanner(DEFAULT_BANNER);

  return (
    <BannerContext.Provider value={{ banner, updateBanner, resetBanner }}>
      {children}
    </BannerContext.Provider>
  );
}

export function useBanner() {
  const ctx = useContext(BannerContext);
  if (!ctx) throw new Error('useBanner must be inside BannerProvider');
  return ctx;
}
