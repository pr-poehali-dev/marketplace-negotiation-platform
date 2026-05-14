export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  seller: string;
  sellerId: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  tags: string[];
  inStock: boolean;
}

export interface Review {
  id: number;
  author: string;
  rating: number;
  date: string;
  text: string;
  avatar: string;
}

export const CATEGORIES = [
  'Все',
  'Электроника',
  'Одежда',
  'Дом и сад',
  'Спорт',
  'Красота',
  'Книги',
  'Игрушки',
];

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Беспроводные наушники Pro',
    price: 12990,
    originalPrice: 18500,
    category: 'Электроника',
    seller: 'ТехноМир',
    sellerId: 1,
    rating: 4.8,
    reviews: 234,
    image: 'https://cdn.poehali.dev/projects/79897c22-95d7-42e3-87d3-febfdfbbf31b/files/21234df6-c874-4ce1-827c-a6572ee0e3cb.jpg',
    description: 'Премиальные беспроводные наушники с активным шумоподавлением. 30 часов работы от батареи, складная конструкция, кристально чистый звук.',
    tags: ['bluetooth', 'шумоподавление', 'премиум'],
    inStock: true,
  },
  {
    id: 2,
    name: 'Кожаный кошелёк Slim',
    price: 3490,
    category: 'Одежда',
    seller: 'LeatherCo',
    sellerId: 2,
    rating: 4.6,
    reviews: 89,
    image: 'https://cdn.poehali.dev/projects/79897c22-95d7-42e3-87d3-febfdfbbf31b/files/8d73943f-05c6-40ed-ae3e-b7e5c6d62a7d.jpg',
    description: 'Минималистичный тонкий кошелёк из натуральной кожи. Вмещает до 6 карт и купюры. Доступен в 5 цветах.',
    tags: ['кожа', 'минимализм', 'унисекс'],
    inStock: true,
  },
  {
    id: 3,
    name: 'Керамическая кружка Nord',
    price: 1890,
    originalPrice: 2400,
    category: 'Дом и сад',
    seller: 'CeramicStudio',
    sellerId: 3,
    rating: 4.9,
    reviews: 156,
    image: 'https://cdn.poehali.dev/projects/79897c22-95d7-42e3-87d3-febfdfbbf31b/files/4363e0e9-cc91-45b6-9ffd-f8bc8e1987a9.jpg',
    description: 'Ручная работа. Скандинавский стиль. Идеальный объём 350 мл, удобная ручка, матовое покрытие.',
    tags: ['ручная работа', 'скандинавский', 'подарок'],
    inStock: true,
  },
  {
    id: 4,
    name: 'Механическая клавиатура MK-84',
    price: 8990,
    category: 'Электроника',
    seller: 'ТехноМир',
    sellerId: 1,
    rating: 4.7,
    reviews: 312,
    image: 'https://cdn.poehali.dev/projects/79897c22-95d7-42e3-87d3-febfdfbbf31b/files/5d54420e-a9b6-434b-a0ef-969519a5c25b.jpg',
    description: 'Компактная 84-клавишная механическая клавиатура с подсветкой RGB. Переключатели Cherry MX Red, алюминиевый корпус.',
    tags: ['механика', 'rgb', 'компактная'],
    inStock: false,
  },
  {
    id: 5,
    name: 'Беспроводные наушники Pro',
    price: 12990,
    originalPrice: 18500,
    category: 'Электроника',
    seller: 'ТехноМир',
    sellerId: 1,
    rating: 4.8,
    reviews: 234,
    image: 'https://cdn.poehali.dev/projects/79897c22-95d7-42e3-87d3-febfdfbbf31b/files/21234df6-c874-4ce1-827c-a6572ee0e3cb.jpg',
    description: 'Премиальные беспроводные наушники с активным шумоподавлением. 30 часов работы от батареи.',
    tags: ['bluetooth', 'шумоподавление'],
    inStock: true,
  },
  {
    id: 6,
    name: 'Кожаный кошелёк Slim',
    price: 3490,
    category: 'Одежда',
    seller: 'LeatherCo',
    sellerId: 2,
    rating: 4.6,
    reviews: 89,
    image: 'https://cdn.poehali.dev/projects/79897c22-95d7-42e3-87d3-febfdfbbf31b/files/8d73943f-05c6-40ed-ae3e-b7e5c6d62a7d.jpg',
    description: 'Минималистичный тонкий кошелёк из натуральной кожи.',
    tags: ['кожа', 'минимализм'],
    inStock: true,
  },
  {
    id: 7,
    name: 'Керамическая кружка Nord',
    price: 1890,
    category: 'Дом и сад',
    seller: 'CeramicStudio',
    sellerId: 3,
    rating: 4.9,
    reviews: 156,
    image: 'https://cdn.poehali.dev/projects/79897c22-95d7-42e3-87d3-febfdfbbf31b/files/4363e0e9-cc91-45b6-9ffd-f8bc8e1987a9.jpg',
    description: 'Ручная работа. Скандинавский стиль.',
    tags: ['ручная работа', 'скандинавский'],
    inStock: true,
  },
  {
    id: 8,
    name: 'Механическая клавиатура MK-84',
    price: 8990,
    category: 'Электроника',
    seller: 'ТехноМир',
    sellerId: 1,
    rating: 4.7,
    reviews: 312,
    image: 'https://cdn.poehali.dev/projects/79897c22-95d7-42e3-87d3-febfdfbbf31b/files/5d54420e-a9b6-434b-a0ef-969519a5c25b.jpg',
    description: 'Компактная 84-клавишная механическая клавиатура с подсветкой RGB.',
    tags: ['механика', 'rgb'],
    inStock: true,
  },
];

export const REVIEWS: Review[] = [
  { id: 1, author: 'Алексей М.', rating: 5, date: '12 мая 2026', text: 'Отличный товар, пришёл быстро. Качество на высшем уровне, очень доволен покупкой!', avatar: 'АМ' },
  { id: 2, author: 'Светлана К.', rating: 4, date: '8 мая 2026', text: 'Хороший товар, соответствует описанию. Упаковка аккуратная, доставка быстрая.', avatar: 'СК' },
  { id: 3, author: 'Дмитрий П.', rating: 5, date: '3 мая 2026', text: 'Супер! Уже второй раз покупаю у этого продавца — всё всегда идеально.', avatar: 'ДП' },
];

export const SELLERS = [
  { id: 1, name: 'ТехноМир', rating: 4.8, sales: 1240, since: '2020', avatar: 'ТМ', products: 45, description: 'Официальный дистрибьютор электроники. Все товары с гарантией.' },
  { id: 2, name: 'LeatherCo', rating: 4.6, sales: 380, since: '2021', avatar: 'LC', products: 18, description: 'Ручное производство кожаных аксессуаров премиум класса.' },
  { id: 3, name: 'CeramicStudio', rating: 4.9, sales: 560, since: '2019', avatar: 'CS', products: 27, description: 'Авторская керамика ручной работы. Каждое изделие уникально.' },
];
