import { api } from './client';

export interface ModStats {
  buyers_count: number;
  sellers_count: number;
  shops_count: number;
  pending_shops: number;
  products_count: number;
  negotiations_count: number;
  deals_count: number;
  total_revenue: number;
}

export interface ModShop {
  id: number;
  shop_name: string;
  description: string;
  status: string;
  city: string;
  contact_phone: string;
  inn: string;
  ogrn: string;
  total_sales: number;
  total_revenue: number;
  products_count: number;
  bonus_points: number;
  created_at: string;
  rejection_reason: string;
  user_id: number;
  owner_name: string;
  owner_phone: string;
}

export interface ModUser {
  id: number;
  phone: string;
  name: string;
  role: string;
  status: string;
  bonus_points: number;
  orders_count: number;
  total_spent: number;
  created_at: string;
}

export interface ModNegotiation {
  id: number;
  product_id: number;
  buyer_id: number;
  seller_id: number;
  status: string;
  offered_price: number | null;
  final_price: number | null;
  created_at: string;
  updated_at: string;
  moderator_note: string;
  product_title: string;
  product_price: number;
  shop_name: string;
  buyer_name: string;
  buyer_phone: string;
}

export interface ModProduct {
  id: number;
  title: string;
  price: number;
  status: string;
  in_stock: boolean;
  views: number;
  rating: number;
  reviews_count: number;
  created_at: string;
  category_name: string;
  shop_name: string;
  seller_name: string;
}

export const moderatorApi = {
  stats: () =>
    api.get<ModStats>('moderator', '/stats'),

  shops: () =>
    api.get<{ shops: ModShop[] }>('moderator', '/shops'),

  updateShop: (id: number, data: { status?: string; rejection_reason?: string; bonus_points?: number }) =>
    api.put<{ success: boolean }>('moderator', `/shops/${id}`, data),

  users: () =>
    api.get<{ users: ModUser[] }>('moderator', '/users'),

  updateUser: (id: number, data: { status?: string; bonus_points?: number; role?: string }) =>
    api.put<{ success: boolean }>('moderator', `/users/${id}`, data),

  negotiations: () =>
    api.get<{ negotiations: ModNegotiation[] }>('moderator', '/negotiations'),

  updateNegotiation: (id: number, status: string, note?: string) =>
    api.put<{ success: boolean }>('moderator', `/negotiations/${id}`, { status, moderator_note: note }),

  products: () =>
    api.get<{ products: ModProduct[] }>('moderator', '/products'),
};
