import { api } from './client';

export interface Negotiation {
  id: number;
  product_id: number;
  buyer_id: number;
  seller_id: number;
  status: 'pending' | 'active' | 'accepted' | 'rejected' | 'cancelled' | 'disputed';
  offered_price: number | null;
  final_price: number | null;
  created_at: string;
  updated_at: string;
  product: { title: string; price: number; images: string[] };
  shop_name: string;
  buyer_name: string;
}

export interface NegotiationMessage {
  id: number;
  sender_id: number;
  sender_role: 'buyer' | 'seller' | 'moderator';
  price: number | null;
  message: string;
  action: 'offer' | 'counter_offer' | 'accept' | 'reject' | 'message' | 'system';
  created_at: string;
  sender_name: string;
}

export const negotiationsApi = {
  list: () =>
    api.get<{ negotiations: Negotiation[] }>('negotiations', '/'),

  start: (product_id: number, offered_price: number, message?: string) =>
    api.post<{ id: number }>('negotiations', '/', { product_id, offered_price, message }),

  messages: (neg_id: number) =>
    api.get<{ messages: NegotiationMessage[] }>('negotiations', `/${neg_id}/messages`),

  sendMessage: (neg_id: number, data: { action: string; message?: string; price?: number }) =>
    api.post<{ id: number }>('negotiations', `/${neg_id}/messages`, data),

  updateStatus: (neg_id: number, status: string, moderator_note?: string) =>
    api.put<{ success: boolean }>('negotiations', `/${neg_id}`, { status, moderator_note }),
};
