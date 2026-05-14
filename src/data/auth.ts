export type UserRole = 'buyer' | 'seller' | 'moderator';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  buyerCode: string;   // личный код покупателя, напр. BUY-4821
  avatar: string;
  bonusPoints: number;
  createdAt: string;
}

export interface SellerProfile {
  id: string;
  userId: string;
  sellerCode: string;    // код магазина, напр. SHOP-1173
  shopName: string;
  shopDescription: string;
  city: string;
  address: string;
  phone: string;
  logo: string;         // инициалы / аватар
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  documents: SellerDocument[];
  createdAt: string;
}

export interface SellerDocument {
  id: string;
  name: string;
  type: 'inn' | 'ogrn' | 'passport' | 'license' | 'other';
  fileName: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Генератор читаемого кода
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

// Мок-данные пользователей
export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    phone: '+7 900 000-00-01',
    name: 'Иван Васильев',
    role: 'buyer',
    buyerCode: 'BUY-4821',
    avatar: 'ИВ',
    bonusPoints: 320,
    createdAt: '2025-01-10',
  },
  {
    id: 'u2',
    phone: '+7 900 000-00-02',
    name: 'Мария Смирнова',
    role: 'seller',
    buyerCode: 'BUY-7340',
    avatar: 'МС',
    bonusPoints: 1150,
    createdAt: '2024-11-05',
  },
  {
    id: 'mod1',
    phone: '+7 900 000-00-99',
    name: 'Модератор Алексей',
    role: 'moderator',
    buyerCode: 'MOD-0001',
    avatar: 'МА',
    bonusPoints: 0,
    createdAt: '2024-01-01',
  },
];

export const MOCK_SELLER_PROFILES: SellerProfile[] = [
  {
    id: 'sp1',
    userId: 'u2',
    sellerCode: 'SHOP-1173',
    shopName: 'ТехноМир',
    shopDescription: 'Официальный дистрибьютор электроники. Все товары с гарантией производителя.',
    city: 'Москва',
    address: 'ул. Арбат, 24',
    phone: '+7 495 123-45-67',
    logo: 'ТМ',
    status: 'approved',
    documents: [
      { id: 'd1', name: 'ИНН', type: 'inn', fileName: 'inn_document.pdf', uploadedAt: '2024-11-05', status: 'approved' },
      { id: 'd2', name: 'ОГРН', type: 'ogrn', fileName: 'ogrn_document.pdf', uploadedAt: '2024-11-05', status: 'approved' },
    ],
    createdAt: '2024-11-05',
  },
  {
    id: 'sp2',
    userId: 'u_pending',
    sellerCode: 'SHOP-2290',
    shopName: 'СпортЛэнд',
    shopDescription: 'Спортивный инвентарь и одежда для активного образа жизни.',
    city: 'Казань',
    address: 'ул. Баумана, 55',
    phone: '+7 843 222-33-44',
    logo: 'СЛ',
    status: 'pending',
    documents: [
      { id: 'd3', name: 'ИНН', type: 'inn', fileName: 'sportland_inn.pdf', uploadedAt: '2026-05-13', status: 'pending' },
      { id: 'd4', name: 'Паспорт ИП', type: 'passport', fileName: 'sportland_passport.pdf', uploadedAt: '2026-05-13', status: 'pending' },
      { id: 'd5', name: 'Лицензия', type: 'license', fileName: 'sportland_license.pdf', uploadedAt: '2026-05-13', status: 'pending' },
    ],
    createdAt: '2026-05-13',
  },
  {
    id: 'sp3',
    userId: 'u_rej',
    sellerCode: 'SHOP-3310',
    shopName: 'МодаПлюс',
    shopDescription: 'Женская и мужская одежда.',
    city: 'Санкт-Петербург',
    address: 'Невский пр., 100',
    phone: '+7 812 111-22-33',
    logo: 'МП',
    status: 'rejected',
    rejectionReason: 'Документы нечитаемы или истёк срок действия. Пожалуйста, загрузите актуальные копии.',
    documents: [
      { id: 'd6', name: 'ИНН', type: 'inn', fileName: 'moda_inn.pdf', uploadedAt: '2026-05-10', status: 'rejected' },
    ],
    createdAt: '2026-05-10',
  },
];
