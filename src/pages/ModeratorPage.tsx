import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/context/AuthContext';
import { MOCK_SELLER_PROFILES, SellerProfile } from '@/data/auth';

interface ModeratorPageProps {
  onNavigate: (page: string) => void;
}

const STATUS_MAP = {
  pending: { label: 'На проверке', cls: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  approved: { label: 'Одобрен', cls: 'bg-green-100 text-green-700 border-green-300' },
  rejected: { label: 'Отклонён', cls: 'bg-red-100 text-red-700 border-red-300' },
};

const DOC_ICONS: Record<string, string> = {
  inn: '📄',
  ogrn: '📋',
  passport: '🪪',
  license: '📜',
  other: '📎',
};

export default function ModeratorPage({ onNavigate }: ModeratorPageProps) {
  const { user } = useAuth();
  const [shops, setShops] = useState<SellerProfile[]>(MOCK_SELLER_PROFILES);
  const [selected, setSelected] = useState<SellerProfile | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [showRejectModal, setShowRejectModal] = useState(false);

  if (!user || user.role !== 'moderator') {
    return (
      <main className="max-w-xl mx-auto px-4 py-20 text-center">
        <span className="text-5xl block mb-4">🔒</span>
        <h2 className="text-xl font-black mb-2">Доступ запрещён</h2>
        <p className="text-muted-foreground mb-6 text-sm">Эта страница только для модераторов</p>
        <button onClick={() => onNavigate('home')} className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all">
          На главную
        </button>
      </main>
    );
  }

  const filtered = shops.filter(s => filter === 'all' || s.status === filter);
  const counts = {
    all: shops.length,
    pending: shops.filter(s => s.status === 'pending').length,
    approved: shops.filter(s => s.status === 'approved').length,
    rejected: shops.filter(s => s.status === 'rejected').length,
  };

  const approve = (id: string) => {
    setShops(prev => prev.map(s => s.id === id ? { ...s, status: 'approved' } : s));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: 'approved' } : null);
  };

  const reject = (id: string) => {
    if (!rejectReason.trim()) return;
    setShops(prev => prev.map(s => s.id === id ? { ...s, status: 'rejected', rejectionReason: rejectReason } : s));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: 'rejected', rejectionReason: rejectReason } : null);
    setRejectReason('');
    setShowRejectModal(false);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <h1 className="text-2xl font-black">Панель модератора</h1>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200">MODERATOR</span>
          </div>
          <p className="text-muted-foreground text-sm mt-1 ml-10">Привет, {user.name}! Проверяй заявки магазинов.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {([
          { key: 'all', label: 'Всего', emoji: '📊', color: 'border-border' },
          { key: 'pending', label: 'На проверке', emoji: '⏳', color: 'border-yellow-300 bg-yellow-50' },
          { key: 'approved', label: 'Одобрено', emoji: '✅', color: 'border-green-300 bg-green-50' },
          { key: 'rejected', label: 'Отклонено', emoji: '❌', color: 'border-red-300 bg-red-50' },
        ] as const).map(s => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`border-2 rounded-2xl p-4 text-center transition-all ${s.color} ${filter === s.key ? 'ring-2 ring-primary ring-offset-1' : 'hover:ring-1 hover:ring-primary'}`}
          >
            <div className="text-xl mb-1">{s.emoji}</div>
            <div className="text-2xl font-black">{counts[s.key]}</div>
            <div className="text-xs text-muted-foreground font-medium">{s.label}</div>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <span className="text-4xl block mb-2">📭</span>
              <p className="text-sm">Нет заявок в этом разделе</p>
            </div>
          )}
          {filtered.map(shop => {
            const st = STATUS_MAP[shop.status];
            return (
              <button
                key={shop.id}
                onClick={() => setSelected(shop)}
                className={`w-full text-left p-4 bg-white border-2 rounded-2xl transition-all hover:border-primary/50 ${selected?.id === shop.id ? 'border-primary shadow-md shadow-primary/10' : 'border-border'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0">
                    {shop.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm truncate">{shop.shopName}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${st.cls}`}>{st.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{shop.city} · {shop.sellerCode}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{shop.documents.length} документ(ов)</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {!selected ? (
            <div className="bg-white border-2 border-border rounded-3xl p-12 text-center text-muted-foreground">
              <span className="text-5xl block mb-3">👈</span>
              <p className="text-sm">Выберите заявку для проверки</p>
            </div>
          ) : (
            <div className="bg-white border-2 border-border rounded-3xl p-6 animate-fade-in">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center text-xl font-black">
                    {selected.logo}
                  </div>
                  <div>
                    <h2 className="text-xl font-black">{selected.shopName}</h2>
                    <p className="text-sm text-muted-foreground">{selected.sellerCode}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${STATUS_MAP[selected.status].cls}`}>
                  {STATUS_MAP[selected.status].label}
                </span>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { icon: 'MapPin', label: 'Город', val: selected.city },
                  { icon: 'Navigation', label: 'Адрес', val: selected.address },
                  { icon: 'Phone', label: 'Телефон', val: selected.phone },
                  { icon: 'Calendar', label: 'Подана', val: selected.createdAt },
                ].map(f => (
                  <div key={f.label} className="bg-secondary rounded-xl p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">{f.label}</p>
                    <p className="text-sm font-semibold">{f.val}</p>
                  </div>
                ))}
              </div>

              {selected.shopDescription && (
                <div className="mb-5">
                  <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wide">Описание</p>
                  <p className="text-sm text-muted-foreground bg-secondary rounded-xl p-3">{selected.shopDescription}</p>
                </div>
              )}

              {/* Documents */}
              <div className="mb-6">
                <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wide">Документы ({selected.documents.length})</p>
                <div className="space-y-2">
                  {selected.documents.map(doc => (
                    <div key={doc.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 ${doc.status === 'approved' ? 'border-green-200 bg-green-50' : doc.status === 'rejected' ? 'border-red-200 bg-red-50' : 'border-border bg-white'}`}>
                      <span className="text-xl flex-shrink-0">{DOC_ICONS[doc.type] || '📎'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{doc.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{doc.fileName}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button className="text-xs text-primary hover:underline flex items-center gap-1">
                          <Icon name="Eye" size={12} /> Просмотр
                        </button>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          doc.status === 'approved' ? 'text-green-700' :
                          doc.status === 'rejected' ? 'text-red-700' : 'text-yellow-700'
                        }`}>
                          {doc.status === 'approved' ? '✓' : doc.status === 'rejected' ? '✗' : '⏳'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rejection reason */}
              {selected.rejectionReason && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-5">
                  <p className="text-xs font-bold text-red-700 mb-1">Причина отклонения:</p>
                  <p className="text-sm text-red-700">{selected.rejectionReason}</p>
                </div>
              )}

              {/* Actions */}
              {selected.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => approve(selected.id)}
                    className="flex-1 py-3 bg-green-600 text-white rounded-xl font-black text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-md"
                  >
                    <Icon name="CheckCircle" size={16} /> Одобрить магазин
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2 shadow-md"
                  >
                    <Icon name="XCircle" size={16} /> Отклонить
                  </button>
                </div>
              )}

              {selected.status !== 'pending' && (
                <button
                  onClick={() => setShops(prev => prev.map(s => s.id === selected.id ? { ...s, status: 'pending', rejectionReason: undefined } : s))}
                  className="w-full py-3 border-2 border-border rounded-xl font-bold text-sm hover:bg-secondary transition-colors text-muted-foreground"
                >
                  Вернуть на проверку
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reject modal */}
      {showRejectModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowRejectModal(false)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-md animate-scale-in shadow-2xl">
            <h3 className="text-lg font-black mb-2">Причина отклонения</h3>
            <p className="text-sm text-muted-foreground mb-4">Укажите причину — продавец увидит её и сможет исправить документы.</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Например: Документы нечитаемы, истёк срок действия..."
              className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors resize-none mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 py-3 border-2 border-border rounded-xl font-bold text-sm hover:bg-secondary transition-colors">
                Отмена
              </button>
              <button
                onClick={() => reject(selected.id)}
                disabled={!rejectReason.trim()}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black text-sm hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                Отклонить
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
