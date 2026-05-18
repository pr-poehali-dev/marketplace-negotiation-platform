import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { negotiationsApi, Negotiation, NegotiationMessage } from '@/api/negotiations';
import { useAuth } from '@/context/AuthContext';

interface ChatPageProps {
  initialNegotiationId?: number;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function ChatPage({ initialNegotiationId, onNavigate }: ChatPageProps) {
  const { user } = useAuth();
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [messages, setMessages] = useState<NegotiationMessage[]>([]);
  const [activeId, setActiveId] = useState<number | null>(initialNegotiationId || null);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    negotiationsApi.list()
      .then(res => {
        setNegotiations(res.negotiations);
        if (!activeId && res.negotiations.length > 0) {
          setActiveId(res.negotiations[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!activeId) return;
    setMessagesLoading(true);
    negotiationsApi.messages(activeId)
      .then(res => setMessages(res.messages))
      .catch(() => setMessages([]))
      .finally(() => setMessagesLoading(false));
  }, [activeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeNeg = negotiations.find(n => n.id === activeId) || null;

  const sendMessage = async () => {
    if (!input.trim() || !activeId || sending) return;
    setSending(true);
    try {
      await negotiationsApi.sendMessage(activeId, { action: 'message', message: input.trim() });
      setInput('');
      // Перезагрузим сообщения
      const res = await negotiationsApi.messages(activeId);
      setMessages(res.messages);
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return '';
    }
  };

  const getStatusBadge = (status: Negotiation['status']) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      active: 'bg-blue-100 text-blue-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700',
      disputed: 'bg-orange-100 text-orange-700',
    };
    const labels: Record<string, string> = {
      pending: 'Ожидает',
      active: 'Активный',
      accepted: 'Принят',
      rejected: 'Отклонён',
      cancelled: 'Отменён',
      disputed: 'Спор',
    };
    return { cls: map[status] || '', label: labels[status] || status };
  };

  if (!user) {
    return (
      <main className="max-w-xl mx-auto px-4 py-20 text-center">
        <span className="text-5xl block mb-4">💬</span>
        <h2 className="text-xl font-bold mb-2">Войдите, чтобы видеть переговоры</h2>
        <button onClick={() => onNavigate('auth')} className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all">
          Войти
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">💬</span>
        <h1 className="text-2xl font-black">Переговоры</h1>
      </div>

      <div className="bg-white border-2 border-border rounded-3xl overflow-hidden flex h-[calc(100vh-220px)] min-h-[500px]">
        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 border-r-2 border-border flex flex-col">
          <div className="p-4 border-b-2 border-border">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Мои переговоры</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-10 h-10 bg-secondary rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-secondary rounded w-3/4" />
                      <div className="h-3 bg-secondary rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!loading && negotiations.length === 0 && (
              <div className="p-6 text-center text-muted-foreground text-sm">
                <span className="text-4xl block mb-2 opacity-40">📭</span>
                <p>Переговоров пока нет</p>
              </div>
            )}
            {!loading && negotiations.map(neg => {
              const isActive = activeId === neg.id;
              const badge = getStatusBadge(neg.status);
              return (
                <button
                  key={neg.id}
                  onClick={() => setActiveId(neg.id)}
                  className={`w-full flex items-start gap-3 p-3 text-left transition-colors ${isActive ? 'bg-primary/10 border-r-2 border-primary' : 'hover:bg-secondary'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${isActive ? 'bg-primary text-white' : 'bg-secondary text-foreground'}`}>
                    {neg.shop_name?.slice(0, 2).toUpperCase() || '??'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-sm font-semibold truncate ${isActive ? 'text-primary' : ''}`}>
                        {neg.product.title}
                      </span>
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${badge.cls}`}>{badge.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{neg.shop_name}</p>
                    {neg.offered_price && (
                      <p className="text-xs text-muted-foreground mt-0.5">Предложено: {neg.offered_price.toLocaleString('ru')} ₽</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {!activeNeg ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              <div className="text-center">
                <span className="text-5xl block mb-3 opacity-40">💬</span>
                <p>Выберите переговор слева</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 p-4 border-b-2 border-border">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-sm font-black flex-shrink-0">
                  {activeNeg.shop_name?.slice(0, 2).toUpperCase() || '??'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{activeNeg.product.title}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{activeNeg.shop_name}</span>
                    {activeNeg.offered_price && (
                      <span className="font-semibold text-primary">· Предложена: {activeNeg.offered_price.toLocaleString('ru')} ₽</span>
                    )}
                    {activeNeg.final_price && (
                      <span className="font-semibold text-green-600">· Итог: {activeNeg.final_price.toLocaleString('ru')} ₽</span>
                    )}
                  </div>
                </div>
                <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusBadge(activeNeg.status).cls}`}>
                  {getStatusBadge(activeNeg.status).label}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary/30">
                {messagesLoading && (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {!messagesLoading && messages.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground text-sm">
                    <span className="text-5xl block mb-3 opacity-40">💬</span>
                    <p>Сообщений пока нет</p>
                  </div>
                )}
                {!messagesLoading && messages.map(msg => {
                  const isMe = user && msg.sender_id === user.id;
                  const isSystem = msg.action === 'system';
                  const isOffer = msg.action === 'offer' || msg.action === 'counter_offer';
                  const isAccept = msg.action === 'accept';
                  const isReject = msg.action === 'reject';

                  if (isSystem || isAccept || isReject) {
                    return (
                      <div key={msg.id} className="flex justify-center animate-fade-in">
                        <div className={`max-w-sm px-4 py-3 rounded-2xl text-xs font-medium text-center border-2 ${
                          isAccept ? 'bg-green-50 border-green-400 text-green-800' :
                          isReject ? 'bg-red-50 border-red-300 text-red-800' :
                          'bg-secondary border-border text-muted-foreground'
                        }`}>
                          {isAccept && '✅ '}
                          {isReject && '❌ '}
                          {msg.message}
                          {msg.price && <span className="block font-bold mt-1">{msg.price.toLocaleString('ru')} ₽</span>}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                      <div className={`max-w-xs lg:max-w-md ${isMe ? 'order-2' : ''}`}>
                        {!isMe && (
                          <p className="text-xs text-muted-foreground mb-1 ml-1">{msg.sender_name}</p>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                          isMe
                            ? 'bg-primary text-white rounded-br-sm'
                            : 'bg-white text-foreground border border-border rounded-bl-sm'
                        } ${isOffer ? 'border-2 border-orange-300 bg-orange-50 text-orange-900' : ''}`}>
                          {isOffer && msg.price && (
                            <p className="font-black text-base mb-1">🤝 {msg.price.toLocaleString('ru')} ₽</p>
                          )}
                          <p className="leading-relaxed">{msg.message}</p>
                        </div>
                        <p className={`text-xs text-muted-foreground mt-1 ${isMe ? 'text-right' : 'text-left ml-1'}`}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t-2 border-border bg-white">
                {(activeNeg.status === 'accepted' || activeNeg.status === 'rejected' || activeNeg.status === 'cancelled') ? (
                  <p className="text-center text-sm text-muted-foreground py-1">
                    Переговоры завершены ({getStatusBadge(activeNeg.status).label})
                  </p>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder="Напишите сообщение..."
                      className="flex-1 px-4 py-2.5 bg-secondary border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || sending}
                      className="px-4 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      {sending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Icon name="Send" size={16} />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
