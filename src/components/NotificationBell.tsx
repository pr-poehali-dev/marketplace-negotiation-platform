import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { useNotifications, Notification } from '@/context/NotificationsContext';
import { useAuth } from '@/context/AuthContext';

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'только что';
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  return `${Math.floor(diff / 86400)} д назад`;
}

const TYPE_ICONS: Record<Notification['type'], string> = {
  new_shop: '🏪',
  new_document: '📄',
  shop_blocked: '🚫',
  info: 'ℹ️',
};

interface Props {
  onNavigateAdmin: () => void;
}

export default function NotificationBell({ onNavigateAdmin }: Props) {
  const { user } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [prevUnread, setPrevUnread] = useState(unreadCount);
  const [shake, setShake] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Тряска при новых уведомлениях
  useEffect(() => {
    if (user?.role !== 'moderator') return;
    if (unreadCount > prevUnread) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 600);
      return () => clearTimeout(t);
    }
    setPrevUnread(unreadCount);
  }, [unreadCount]); // eslint-disable-line react-hooks/exhaustive-deps

  // Закрыть по клику вне
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (user?.role !== 'moderator') return null;

  const handleClickNotif = (n: Notification) => {
    markRead(n.id);
    setOpen(false);
    onNavigateAdmin();
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`relative p-2 rounded-xl transition-all ${open ? 'bg-red-100' : 'hover:bg-secondary'} ${shake ? 'animate-bounce' : ''}`}
        title="Уведомления"
      >
        <Icon name="Bell" size={20} className={unreadCount > 0 ? 'text-red-500' : 'text-muted-foreground'} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-0.5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border-2 border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-border bg-red-50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black">🔔 Уведомления</span>
              {unreadCount > 0 && (
                <span className="text-xs font-bold text-red-600 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full">
                  {unreadCount} новых
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-muted-foreground hover:text-primary font-semibold transition-colors">
                  Прочитать все
                </button>
              )}
              <button
                onClick={() => { setOpen(false); onNavigateAdmin(); }}
                className="text-xs text-primary font-bold hover:underline"
              >
                Панель →
              </button>
            </div>
          </div>

          {/* Список */}
          <div className="max-h-[320px] overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                <span className="text-4xl block mb-2">📭</span>
                Нет уведомлений
              </div>
            ) : notifications.map(n => (
              <button
                key={n.id}
                onClick={() => handleClickNotif(n)}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-secondary/60 ${!n.read ? 'bg-red-50/40' : ''}`}
              >
                <span className="text-lg flex-shrink-0 mt-0.5">{TYPE_ICONS[n.type]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <p className={`text-sm leading-snug ${!n.read ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>
                      {n.title}
                    </p>
                    {!n.read && <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
              </button>
            ))}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-2 bg-secondary/40 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">Всего {notifications.length} уведомлений</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
