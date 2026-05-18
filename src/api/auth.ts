import { api } from './client';

export interface UserProfile {
  id: number;
  phone: string;
  name: string;
  role: 'buyer' | 'seller' | 'moderator';
  status: 'active' | 'blocked';
  avatar_url: string;
  bonus_points: number;
  orders_count: number;
  total_spent: number;
  created_at: string;
  seller_profile?: {
    id: number;
    shop_name: string;
    description: string;
    contact_phone: string;
    status: string;
    city: string;
    logo: string;
    bonus_points: number;
    total_sales: number;
    total_revenue: number;
    products_count: number;
    inn: string;
    ogrn: string;
  };
}

export const authApi = {
  sendOtp: (phone: string) =>
    api.post<{ success: boolean; message: string }>('auth', '/send-otp', { phone }),

  login: (phone: string, otp: string) =>
    api.post<{ token: string; user: UserProfile }>('auth', '/login', { phone, otp }),

  register: (phone: string, name: string, otp: string) =>
    api.post<{ token: string; user: UserProfile }>('auth', '/register', { phone, name, otp }),

  me: () =>
    api.get<UserProfile>('auth', '/me'),

  logout: () =>
    api.post<{ success: boolean }>('auth', '/logout', {}),
};
