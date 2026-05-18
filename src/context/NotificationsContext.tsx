import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface Notification {
  id: string;
  type: 'new_shop' | 'new_document' | 'shop_blocked' | 'info';
  title: string;
  message: string;
  shopId?: string;
  shopName?: string;
  createdAt: Date;
  read: boolean;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  clearAll: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Сбрасываем уведомления при смене пользователя
  useEffect(() => {
    setNotifications([]);
  }, [user?.id, user?.role]);

  // Симулируем новую заявку каждые 30 секунд (только для модератора)
  useEffect(() => {
    if (user?.role !== 'moderator') return;

    const SHOP_NAMES = ['ФудМаркет', 'ОдеждаПлюс', 'ТехноЛэнд', 'КрасотаСтор', 'ДомДекор'];
    let counter = 0;

    const timer = setInterval(() => {
      counter++;
      const name = SHOP_NAMES[counter % SHOP_NAMES.length];
      const code = `SHOP-${Math.floor(1000 + Math.random() * 9000)}`;
      const newN: Notification = {
        id: `sim-${Date.now()}`,
        type: 'new_shop',
        title: 'Новая заявка на магазин',
        message: `«${name}» (${code}) только что подал заявку на регистрацию`,
        shopName: name,
        createdAt: new Date(),
        read: false,
      };
      setNotifications(prev => [newN, ...prev].slice(0, 50));
    }, 30000);

    return () => clearInterval(timer);
  }, [user?.role]);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    setNotifications(prev => [{
      ...n,
      id: `n-${Date.now()}`,
      createdAt: new Date(),
      read: false,
    }, ...prev].slice(0, 50));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, addNotification, clearAll }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be inside NotificationsProvider');
  return ctx;
}