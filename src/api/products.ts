import { api } from './client';

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

export interface Seller {
  id: number;
  shop_name: string;
  city: string;
  logo: string;
  status: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  original_price: number | null;
  images: string[];
  in_stock: boolean;
  rating: number;
  reviews_count: number;
  article: string;
  allow_negotiation: boolean;
  views: number;
  created_at: string;
  category: { name: string; slug: string };
  seller: Seller;
}

export interface SellerProfile {
  id: number;
  shop_name: string;
  description: string;
  city: string;
  logo: string;
  banner_url: string;
  status: string;
  total_sales: number;
  total_revenue: number;
  products_count: number;
  bonus_points: number;
  contact_phone: string;
  inn: string;
  ogrn: string;
  user_id: number;
  owner_name: string;
  created_at: string;
}

export const productsApi = {
  list: (params?: { category?: string; search?: string; seller_id?: number; limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.search) qs.set('search', params.search);
    if (params?.seller_id) qs.set('seller_id', String(params.seller_id));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.offset) qs.set('offset', String(params.offset));
    const q = qs.toString();
    return api.get<{ products: Product[] }>('products', q ? `/?${q}` : '/');
  },

  get: (id: number) =>
    api.get<Product>('products', `/products/${id}`),

  create: (data: {
    title: string; price: number; description?: string; original_price?: number;
    category_id?: number; images?: string[]; in_stock?: boolean; allow_negotiation?: boolean; article?: string;
  }) => api.post<{ id: number }>('products', '/products', data),

  update: (id: number, data: Partial<Product>) =>
    api.put<{ success: boolean }>('products', `/products/${id}`, data),

  delete: (id: number) =>
    api.delete<{ success: boolean }>('products', `/products/${id}`),

  categories: () =>
    api.get<{ categories: Category[] }>('products', '/categories'),

  upload: (file: string, name: string, folder?: string) =>
    api.post<{ url: string; key: string }>('products', '/upload', { file, name, folder: folder || 'products' }),
};

export const sellersApi = {
  list: () =>
    api.get<{ sellers: SellerProfile[] }>('sellers', '/'),

  get: (id: number) =>
    api.get<SellerProfile>('sellers', `/sellers/${id}`),

  register: (data: {
    shop_name: string; description?: string; contact_phone?: string;
    contact_email?: string; city?: string; address?: string; inn?: string; ogrn?: string;
  }) => api.post<{ id: number }>('sellers', '/register', data),

  update: (id: number, data: Partial<SellerProfile>) =>
    api.put<{ success: boolean }>('sellers', `/sellers/${id}`, data),
};
