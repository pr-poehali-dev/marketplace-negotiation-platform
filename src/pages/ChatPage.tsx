import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { SELLERS } from '@/data/products';

interface Message {
  id: number;
  text: string;
  fromMe: boolean;
  time: string;
  status: 'sent' | 'read';
}

interface Chat {
  sellerId: number;
  messages: Message[];
}

interface ChatPageProps {
  initialSellerId?: number;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const INITIAL_CHATS: Chat[] = [
  {
    sellerId: 1,
    messages: [
      { id: 1, text: 'Здравствуйте! Интересует наушники, есть ли скидка?', fromMe: true, time: '10:15', status: 'read' },
      { id: 2, text: 'Добрый день! Да, для вас можем сделать 5% скидку при оплате сегодня.', fromMe: false, time: '10:18', status: 'read' },
      { id: 3, text: 'Отлично, буду думать. Сколько ждать доставку?', fromMe: true, time: '10:20', status: 'read' },
      { id: 4, text: 'Доставка 1-2 рабочих дня по всей России.', fromMe: false, time: '10:22', status: 'read' },
    ],
  },
  {
    sellerId: 2,
    messages: [
      { id: 1, text: 'Здравствуйте! Есть ли кошелёк в чёрном цвете?', fromMe: true, time: '09:00', status: 'read' },
      { id: 2, text: 'Есть! Могу выслать фото. Также есть тёмно-коричневый.', fromMe: false, time: '09:05', status: 'read' },
    ],
  },
  {
    sellerId: 3,
    messages: [],
  },
];

export default function ChatPage({ initialSellerId, onNavigate }: ChatPageProps) {
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [activeSellerId, setActiveSellerId] = useState<number>(initialSellerId || SELLERS[0].id);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find(c => c.sellerId === activeSellerId) || chats[0];
  const activeSeller = SELLERS.find(s => s.id === activeSellerId) || SELLERS[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat.messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newMsg: Message = {
      id: Date.now(),
      text: input.trim(),
      fromMe: true,
      time,
      status: 'sent',
    };
    setChats(prev =>
      prev.map(c =>
        c.sellerId === activeSellerId
          ? { ...c, messages: [...c.messages, newMsg] }
          : c
      )
    );
    setInput('');

    // Auto-reply after 1.5 sec
    setTimeout(() => {
      const replies = [
        'Спасибо за сообщение! Скоро отвечу.',
        'Хорошо, уточню информацию.',
        'Да, это возможно. Уточните детали.',
        'Понял, обработаем ваш запрос.',
      ];
      const reply: Message = {
        id: Date.now() + 1,
        text: replies[Math.floor(Math.random() * replies.length)],
        fromMe: false,
        time: `${now.getHours()}:${String(now.getMinutes() + 1).padStart(2, '0')}`,
        status: 'read',
      };
      setChats(prev =>
        prev.map(c =>
          c.sellerId === activeSellerId
            ? { ...c, messages: [...c.messages, reply] }
            : c
        )
      );
    }, 1500);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Сообщения</h1>

      <div className="bg-white border border-border rounded-3xl overflow-hidden flex h-[calc(100vh-220px)] min-h-[500px]">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Диалоги</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {SELLERS.map(seller => {
              const chat = chats.find(c => c.sellerId === seller.id);
              const lastMsg = chat?.messages.at(-1);
              const unread = chat?.messages.filter(m => !m.fromMe && m.status === 'sent').length || 0;
              return (
                <button
                  key={seller.id}
                  onClick={() => setActiveSellerId(seller.id)}
                  className={`w-full flex items-center gap-3 p-3 text-left hover:bg-secondary transition-colors ${activeSellerId === seller.id ? 'bg-secondary' : ''}`}
                >
                  <div className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {seller.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{seller.name}</span>
                      {lastMsg && <span className="text-xs text-muted-foreground flex-shrink-0">{lastMsg.time}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {lastMsg ? (lastMsg.fromMe ? `Вы: ${lastMsg.text}` : lastMsg.text) : 'Нет сообщений'}
                    </p>
                  </div>
                  {unread > 0 && (
                    <span className="w-5 h-5 bg-foreground text-background text-xs rounded-full flex items-center justify-center flex-shrink-0">
                      {unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <div className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              {activeSeller.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium">{activeSeller.name}</div>
              <div className="text-xs text-green-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                Онлайн
              </div>
            </div>
            <button
              onClick={() => onNavigate('seller', { id: String(activeSeller.id) })}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <Icon name="User" size={16} className="text-muted-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeChat.messages.length === 0 && (
              <div className="text-center py-16 text-muted-foreground text-sm">
                <Icon name="MessageCircle" size={40} className="mx-auto mb-3 opacity-30" />
                <p>Начните диалог с продавцом</p>
              </div>
            )}
            {activeChat.messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.fromMe
                      ? 'bg-foreground text-background rounded-br-md'
                      : 'bg-secondary text-foreground rounded-bl-md'
                  }`}
                >
                  <p>{msg.text}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${msg.fromMe ? 'text-background/50' : 'text-muted-foreground'}`}>
                    <span className="text-xs">{msg.time}</span>
                    {msg.fromMe && (
                      <Icon name={msg.status === 'read' ? 'CheckCheck' : 'Check'} size={12} />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Напишите сообщение..."
                className="flex-1 px-4 py-2.5 bg-secondary border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="px-4 py-2.5 bg-foreground text-background rounded-xl hover:bg-foreground/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Icon name="Send" size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
