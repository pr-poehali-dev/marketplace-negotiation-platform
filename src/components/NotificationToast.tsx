import { useEffect, useState } from 'react';
import { useNotifications, Notification } from '@/context/NotificationsContext';
import { useAuth } from '@/context/AuthContext';

const TYPE_ICONS: Record<Notification['type'], string> = {
  new_shop: '🏪',
  new_document: '📄',
  shop_blocked: '🚫',
  info: 'ℹ️',
};

interface ToastItem {
  notif: Notification;
  id: string;
}

export default function NotificationToast({ onNavigateAdmin }: { onNavigateAdmin: () => void }) {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [shownIds, setShownIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user?.role !== 'moderator') return;

    const unread = notifications.filter(n => !n.read && !shownIds.has(n.id));
    if (unread.length === 0) return;

    // Показываем только последнее непоказанное
    const latest = unread[0];
    setShownIds(prev => new Set([...prev, latest.id]));

    const toast: ToastItem = { notif: latest, id: `toast-${Date.now()}` };
    setToasts(prev => [toast, ...prev].slice(0, 3));

    // Убираем через 5 секунд
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id));
    }, 5000);
  }, [notifications]); // eslint-disable-line react-hooks/exhaustive-deps

  if (user?.role !== 'moderator') return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(({ notif, id }) => (
        <div
          key={id}
          className="pointer-events-auto bg-white border-2 border-red-200 rounded-2xl shadow-2xl p-4 w-72 animate-fade-in flex items-start gap-3"
        >
          <span className="text-2xl flex-shrink-0">{TYPE_ICONS[notif.type]}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-foreground leading-snug">{notif.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{notif.message}</p>
            <button
              onClick={() => { setToasts([]); onNavigateAdmin(); }}
              className="mt-2 text-xs text-primary font-bold hover:underline"
            >
              Открыть панель →
            </button>
          </div>
          <button
            onClick={() => setToasts(prev => prev.filter(t => t.id !== id))}
            className="text-muted-foreground hover:text-foreground flex-shrink-0 p-0.5"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
