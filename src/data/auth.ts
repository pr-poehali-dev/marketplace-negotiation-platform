export type UserRole = 'buyer' | 'seller' | 'moderator';
export type UserStatus = 'active' | 'blocked';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  buyerCode: string;
  avatar: string;
  bonusPoints: number;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
}

export interface SellerProfile {
  id: string;
  userId: string;
  sellerCode: string;
  shopName: string;
  shopDescription: string;
  city: string;
  address: string;
  phone: string;
  logo: string;
  status: 'pending' | 'approved' | 'rejected' | 'blocked';
  rejectionReason?: string;
  documents: SellerDocument[];
  createdAt: string;
  // Контент магазина (редактируется модератором)
  bannerUrl?: string;
  bannerTitle?: string;
  bannerSubtitle?: string;
  logoImageUrl?: string;
  // Статистика
  totalSales: number;
  totalRevenue: number;
  productsCount: number;
  bonusPoints: number;
}

export interface SellerDocument {
  id: string;
  name: string;
  type: 'inn' | 'ogrn' | 'passport' | 'license' | 'other';
  fileName: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Sale {
  id: string;
  shopId: string;
  productName: string;
  article: string;
  buyerName: string;
  amount: number;
  date: string;
  status: 'completed' | 'cancelled' | 'processing';
}

export function generateBuyerCode(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `BUY-${n}`;
}

export function generateSellerCode(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `SHOP-${n}`;
}

export function generateArticle(category: string, id: number): string {
  const prefix = category.substring(0, 3).toUpperCase().replace(/[^A-ZА-Я]/g, 'X');
  return `${prefix}-${String(id).padStart(5, '0')}`;
}

export const MOCK_USERS: User[] = [
  { id: 'u1', phone: '+7 900 000-00-01', name: 'Иван Васильев', role: 'buyer', status: 'active', buyerCode: 'BUY-4821', avatar: 'ИВ', bonusPoints: 320, createdAt: '2025-01-10', ordersCount: 8, totalSpent: 45600 },
  { id: 'u2', phone: '+7 900 000-00-02', name: 'Мария Смирнова', role: 'seller', status: 'active', buyerCode: 'BUY-7340', avatar: 'МС', bonusPoints: 1150, createdAt: '2024-11-05', ordersCount: 3, totalSpent: 12300 },
  { id: 'u3', phone: '+7 910 555-11-22', name: 'Алексей Петров', role: 'buyer', status: 'active', buyerCode: 'BUY-3312', avatar: 'АП', bonusPoints: 870, createdAt: '2025-03-15', ordersCount: 14, totalSpent: 89200 },
  { id: 'u4', phone: '+7 926 300-44-55', name: 'Светлана Козлова', role: 'buyer', status: 'active', buyerCode: 'BUY-6601', avatar: 'СК', bonusPoints: 50, createdAt: '2026-04-01', ordersCount: 1, totalSpent: 3490 },
  { id: 'u5', phone: '+7 985 777-99-00', name: 'Дмитрий Орлов', role: 'buyer', status: 'blocked', buyerCode: 'BUY-9900', avatar: 'ДО', bonusPoints: 0, createdAt: '2025-06-20', ordersCount: 2, totalSpent: 8800 },
  { id: 'u6', phone: '+7 903 100-22-33', name: 'Анна Морозова', role: 'buyer', status: 'active', buyerCode: 'BUY-2255', avatar: 'АМ', bonusPoints: 420, createdAt: '2025-08-11', ordersCount: 6, totalSpent: 31000 },
  { id: 'u7', phone: '+7 916 444-66-77', name: 'Сергей Белов', role: 'seller', status: 'active', buyerCode: 'BUY-5544', avatar: 'СБ', bonusPoints: 2300, createdAt: '2024-09-01', ordersCount: 0, totalSpent: 0 },
  { id: 'mod1', phone: '+79248985212', name: 'Модератор', role: 'moderator', status: 'active', buyerCode: 'MOD-0001', avatar: 'МД', bonusPoints: 0, createdAt: '2024-01-01', ordersCount: 0, totalSpent: 0 },
];

export const MOCK_SELLER_PROFILES: SellerProfile[] = [
  {
    id: 'sp1', userId: 'u2', sellerCode: 'SHOP-1173',
    shopName: 'ТехноМир', shopDescription: 'Официальный дистрибьютор электроники. Все товары с гарантией производителя.',
    city: 'Москва', address: 'ул. Арбат, 24', phone: '+7 495 123-45-67', logo: 'ТМ',
    status: 'approved',
    bannerTitle: 'Лучшая электроника', bannerSubtitle: 'Официальная гарантия на все товары',
    documents: [
      { id: 'd1', name: 'ИНН', type: 'inn', fileName: 'inn_document.pdf', uploadedAt: '2024-11-05', status: 'approved' },
      { id: 'd2', name: 'ОГРН', type: 'ogrn', fileName: 'ogrn_document.pdf', uploadedAt: '2024-11-05', status: 'approved' },
    ],
    createdAt: '2024-11-05', totalSales: 1240, totalRevenue: 4850000, productsCount: 45, bonusPoints: 500,
  },
  {
    id: 'sp2', userId: 'u7', sellerCode: 'SHOP-2241',
    shopName: 'LeatherCo', shopDescription: 'Ручное производство кожаных аксессуаров премиум класса.',
    city: 'Санкт-Петербург', address: 'Кузнецкий мост, 7', phone: '+7 812 321-00-11', logo: 'LC',
    status: 'approved',
    documents: [
      { id: 'd7', name: 'ИНН', type: 'inn', fileName: 'lc_inn.pdf', uploadedAt: '2024-10-12', status: 'approved' },
    ],
    createdAt: '2024-10-12', totalSales: 380, totalRevenue: 1326200, productsCount: 18, bonusPoints: 200,
  },
  {
    id: 'sp3', userId: 'u_pending', sellerCode: 'SHOP-2290',
    shopName: 'СпортЛэнд', shopDescription: 'Спортивный инвентарь и одежда для активного образа жизни.',
    city: 'Казань', address: 'ул. Баумана, 55', phone: '+7 843 222-33-44', logo: 'СЛ',
    status: 'pending',
    documents: [
      { id: 'd3', name: 'ИНН', type: 'inn', fileName: 'sportland_inn.pdf', uploadedAt: '2026-05-13', status: 'pending' },
      { id: 'd4', name: 'Паспорт ИП', type: 'passport', fileName: 'sportland_passport.pdf', uploadedAt: '2026-05-13', status: 'pending' },
      { id: 'd5', name: 'Лицензия', type: 'license', fileName: 'sportland_license.pdf', uploadedAt: '2026-05-13', status: 'pending' },
    ],
    createdAt: '2026-05-13', totalSales: 0, totalRevenue: 0, productsCount: 0, bonusPoints: 0,
  },
  {
    id: 'sp4', userId: 'u_rej', sellerCode: 'SHOP-3310',
    shopName: 'МодаПлюс', shopDescription: 'Женская и мужская одежда.',
    city: 'Санкт-Петербург', address: 'Невский пр., 100', phone: '+7 812 111-22-33', logo: 'МП',
    status: 'rejected',
    rejectionReason: 'Документы нечитаемы или истёк срок действия. Пожалуйста, загрузите актуальные копии.',
    documents: [
      { id: 'd6', name: 'ИНН', type: 'inn', fileName: 'moda_inn.pdf', uploadedAt: '2026-05-10', status: 'rejected' },
    ],
    createdAt: '2026-05-10', totalSales: 0, totalRevenue: 0, productsCount: 0, bonusPoints: 0,
  },
];

export const MOCK_SALES: Sale[] = [
  { id: 's1', shopId: 'sp1', productName: 'Беспроводные наушники Pro', article: 'ЭЛЕ-00001', buyerName: 'Иван Васильев', amount: 12990, date: '14 мая 2026', status: 'completed' },
  { id: 's2', shopId: 'sp1', productName: 'Механическая клавиатура MK-84', article: 'ЭЛЕ-00004', buyerName: 'Алексей Петров', amount: 8990, date: '13 мая 2026', status: 'completed' },
  { id: 's3', shopId: 'sp1', productName: 'Беспроводные наушники Pro', article: 'ЭЛЕ-00001', buyerName: 'Светлана Козлова', amount: 11500, date: '12 мая 2026', status: 'completed' },
  { id: 's4', shopId: 'sp1', productName: 'Механическая клавиатура MK-84', article: 'ЭЛЕ-00004', buyerName: 'Анна Морозова', amount: 8990, date: '10 мая 2026', status: 'cancelled' },
  { id: 's5', shopId: 'sp2', productName: 'Кожаный кошелёк Slim', article: 'ОДЕ-00002', buyerName: 'Дмитрий Орлов', amount: 3490, date: '11 мая 2026', status: 'completed' },
  { id: 's6', shopId: 'sp2', productName: 'Кожаный кошелёк Slim', article: 'ОДЕ-00002', buyerName: 'Иван Васильев', amount: 3490, date: '9 мая 2026', status: 'completed' },
  { id: 's7', shopId: 'sp1', productName: 'Беспроводные наушники Pro', article: 'ЭЛЕ-00001', buyerName: 'Сергей Белов', amount: 12990, date: '8 мая 2026', status: 'processing' },
];