import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/context/AuthContext';
import { moderatorApi, ModShop, ModStats, ModNegotiation } from '@/api/moderator';

interface ModeratorPageProps {
  onNavigate: (page: string) => void;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending:  { label: 'На проверке',  cls: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  approved: { label: 'Одобрен',      cls: 'bg-green-100 text-green-700 border-green-300'   },
  rejected: { label: 'Отклонён',     cls: 'bg-red-100 text-red-700 border-red-300'         },
  blocked:  { label: 'Заблокирован', cls: 'bg-gray-100 text-gray-700 border-gray-300'      },
};

const NEG_STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'Ожидает',  cls: 'bg-yellow-100 text-yellow-700' },
  active:    { label: 'Активный', cls: 'bg-blue-100 text-blue-700'     },
  accepted:  { label: 'Принят',   cls: 'bg-green-100 text-green-700'   },
  rejected:  { label: 'Отклонён', cls: 'bg-red-100 text-red-700'       },
  cancelled: { label: 'Отменён',  cls: 'bg-gray-100 text-gray-700'     },
  disputed:  { label: 'Спор',     cls: 'bg-orange-100 text-orange-700' },
};

type Tab = 'shops' | 'negotiations';

export default function ModeratorPage({ onNavigate }: ModeratorPageProps) {
  const { user } = useAuth();

  // ── общее ──
  const [tab, setTab] = useState<Tab>('shops');
  const [stats, setStats] = useState<ModStats | null>(null);

  // ── магазины ──
  const [shops, setShops] = useState<ModShop[]>([]);
  const [loadingShops, setLoadingShops] = useState(true);
  const [selected, setSelected] = useState<ModShop | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // ── переговоры ──
  const [negotiations, setNegotiations] = useState<ModNegotiation[]>([]);
  const [loadingNegs, setLoadingNegs] = useState(false);
  const [negFilter, setNegFilter] = useState<'all' | 'disputed' | 'pending' | 'active'>('all');
  const [negNote, setNegNote] = useState('');
  const [selectedNeg, setSelectedNeg] = useState<ModNegotiation | null>(null);
  const [showNegModal, setShowNegModal] = useState(false);
  const [negAction, setNegAction] = useState<'cancelled' | 'accepted' | ''>('');

  // ── загрузка при монтировании ──
  useEffect(() => {
    if (!user || user.role !== 'moderator') return;
    setLoadingShops(true);
    Promise.all([
      moderatorApi.shops(),
      moderatorApi.stats(),
    ]).then(([shopsRes, statsRes]) => {
      setShops(shopsRes.shops);
      setStats(statsRes);
    }).catch(err => console.error('moderator load error', err))
      .finally(() => setLoadingShops(false));
  }, [user]);

  // ── загружаем переговоры при переходе на вкладку ──
  useEffect(() => {
    if (tab !== 'negotiations' || !user || user.role !== 'moderator') return;
    setLoadingNegs(true);
    moderatorApi.negotiations()
      .then(res => setNegotiations(res.negotiations))
      .catch(err => console.error('negotiations load error', err))
      .finally(() => setLoadingNegs(false));
  }, [tab, user]);

  // ── guard ──
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

  // ── магазины: вычисляемые ──
  const filtered = shops.filter(s => filter === 'all' || s.status === filter);
  const counts = {
    all:      shops.length,
    pending:  shops.filter(s => s.status === 'pending').length,
    approved: shops.filter(s => s.status === 'approved').length,
    rejected: shops.filter(s => s.status === 'rejected').length,
  };

  // ── магазины: actions ──
  const approve = async (id: number) => {
    setActionLoading(true);
    try {
      await moderatorApi.updateShop(id, { status: 'approved', rejection_reason: '' });
      setShops(prev => prev.map(s => s.id === id ? { ...s, status: 'approved', rejection_reason: '' } : s));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: 'approved', rejection_reason: '' } : null);
    } catch (err) {
      console.error('approve error', err);
    } finally {
      setActionLoading(false);
    }
  };

  const reject = async (id: number) => {
    if (!rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await moderatorApi.updateShop(id, { status: 'rejected', rejection_reason: rejectReason });
      setShops(prev => prev.map(s => s.id === id ? { ...s, status: 'rejected', rejection_reason: rejectReason } : s));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: 'rejected', rejection_reason: rejectReason } : null);
      setRejectReason('');
      setShowRejectModal(false);
    } catch (err) {
      console.error('reject error', err);
    } finally {
      setActionLoading(false);
    }
  };

  const returnToPending = async (id: number) => {
    setActionLoading(true);
    try {
      await moderatorApi.updateShop(id, { status: 'pending', rejection_reason: '' });
      setShops(prev => prev.map(s => s.id === id ? { ...s, status: 'pending', rejection_reason: '' } : s));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: 'pending', rejection_reason: '' } : null);
    } catch (err) {
      console.error('returnToPending error', err);
    } finally {
      setActionLoading(false);
    }
  };

  // ── переговоры: вычисляемые ──
  const filteredNegs = negotiations.filter(n =>
    negFilter === 'all' || n.status === negFilter
  );
  const negCounts = {
    all:      negotiations.length,
    disputed: negotiations.filter(n => n.status === 'disputed').length,
    pending:  negotiations.filter(n => n.status === 'pending').length,
    active:   negotiations.filter(n => n.status === 'active').length,
  };

  // ── переговоры: action ──
  const handleNegAction = async () => {
    if (!selectedNeg || negAction === '') return;
    const action: 'cancelled' | 'accepted' = negAction;
    setActionLoading(true);
    try {
      await moderatorApi.updateNegotiation(selectedNeg.id, action, negNote || undefined);
      setNegotiations(prev => prev.map(n =>
        n.id === selectedNeg.id ? { ...n, status: action, moderator_note: negNote } : n
      ));
      setShowNegModal(false);
      setNegNote('');
      setSelectedNeg(null);
      setNegAction('');
    } catch (err) {
      console.error('neg action error', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Header ── */}
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

      {/* ── Global stats ── */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Покупатели',   value: stats.buyers_count,                          emoji: '👥' },
            { label: 'Продавцы',     value: stats.sellers_count,                         emoji: '🏪' },
            { label: 'Переговоры',   value: stats.negotiations_count,                    emoji: '🤝' },
            { label: 'Выручка',      value: `${stats.total_revenue.toLocaleString('ru')} ₽`, emoji: '💰' },
          ].map(s => (
            <div key={s.label} className="border-2 border-border rounded-2xl p-4 bg-white text-center">
              <div className="text-xl mb-1">{s.emoji}</div>
              <div className="text-xl font-black">{s.value}</div>
              <div className="text-xs text-muted-foreground font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1 mb-6 w-fit">
        {([
          { key: 'shops',        label: 'Магазины',    emoji: '🏪' },
          { key: 'negotiations', label: 'Переговоры',  emoji: '🤝' },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === t.key ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{t.emoji}</span> {t.label}
            {t.key === 'shops' && counts.pending > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                {counts.pending}
              </span>
            )}
            {t.key === 'negotiations' && negCounts.disputed > 0 && (
              <span className="bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                {negCounts.disputed}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════
          ВКЛАДКА: МАГАЗИНЫ
      ══════════════════════════════════════ */}
      {tab === 'shops' && (
        <>
          {/* Filter stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {([
              { key: 'all',      label: 'Всего',        emoji: '📊', color: 'border-border'                      },
              { key: 'pending',  label: 'На проверке',  emoji: '⏳', color: 'border-yellow-300 bg-yellow-50'     },
              { key: 'approved', label: 'Одобрено',     emoji: '✅', color: 'border-green-300 bg-green-50'       },
              { key: 'rejected', label: 'Отклонено',    emoji: '❌', color: 'border-red-300 bg-red-50'           },
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
              {loadingShops && (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="w-full p-4 bg-white border-2 border-border rounded-2xl animate-pulse">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-secondary rounded-xl flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-secondary rounded w-2/3" />
                          <div className="h-3 bg-secondary rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!loadingShops && filtered.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  <span className="text-4xl block mb-2">📭</span>
                  <p className="text-sm">Нет заявок в этом разделе</p>
                </div>
              )}
              {!loadingShops && filtered.map(shop => {
                const st = STATUS_MAP[shop.status] || STATUS_MAP['pending'];
                return (
                  <button
                    key={shop.id}
                    onClick={() => setSelected(shop)}
                    className={`w-full text-left p-4 bg-white border-2 rounded-2xl transition-all hover:border-primary/50 ${selected?.id === shop.id ? 'border-primary shadow-md shadow-primary/10' : 'border-border'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0">
                        {shop.shop_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm truncate">{shop.shop_name}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${st.cls}`}>{st.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{shop.city || '—'} · {shop.owner_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{shop.owner_phone}</p>
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
                        {selected.shop_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-xl font-black">{selected.shop_name}</h2>
                        <p className="text-sm text-muted-foreground">{selected.owner_name} · {selected.owner_phone}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${(STATUS_MAP[selected.status] || STATUS_MAP['pending']).cls}`}>
                      {(STATUS_MAP[selected.status] || STATUS_MAP['pending']).label}
                    </span>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      { label: 'Город',    val: selected.city          || '—' },
                      { label: 'Телефон',  val: selected.contact_phone || '—' },
                      { label: 'ИНН',      val: selected.inn           || '—' },
                      { label: 'Подана',   val: selected.created_at ? new Date(selected.created_at).toLocaleDateString('ru') : '—' },
                    ].map(f => (
                      <div key={f.label} className="bg-secondary rounded-xl p-3">
                        <p className="text-xs text-muted-foreground mb-0.5">{f.label}</p>
                        <p className="text-sm font-semibold">{f.val}</p>
                      </div>
                    ))}
                  </div>

                  {selected.description && (
                    <div className="mb-5">
                      <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wide">Описание</p>
                      <p className="text-sm text-muted-foreground bg-secondary rounded-xl p-3">{selected.description}</p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="bg-secondary rounded-xl p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-0.5">Продажи</p>
                      <p className="text-sm font-black">{selected.total_sales}</p>
                    </div>
                    <div className="bg-secondary rounded-xl p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-0.5">Выручка</p>
                      <p className="text-sm font-black">{selected.total_revenue.toLocaleString('ru')} ₽</p>
                    </div>
                    <div className="bg-secondary rounded-xl p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-0.5">Товаров</p>
                      <p className="text-sm font-black">{selected.products_count}</p>
                    </div>
                  </div>

                  {/* Rejection reason */}
                  {selected.rejection_reason && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-5">
                      <p className="text-xs font-bold text-red-700 mb-1">Причина отклонения:</p>
                      <p className="text-sm text-red-700">{selected.rejection_reason}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {selected.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => approve(selected.id)}
                        disabled={actionLoading}
                        className="flex-1 py-3 bg-green-600 text-white rounded-xl font-black text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                      >
                        <Icon name="CheckCircle" size={16} /> Одобрить магазин
                      </button>
                      <button
                        onClick={() => setShowRejectModal(true)}
                        disabled={actionLoading}
                        className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                      >
                        <Icon name="XCircle" size={16} /> Отклонить
                      </button>
                    </div>
                  )}

                  {selected.status !== 'pending' && (
                    <button
                      onClick={() => returnToPending(selected.id)}
                      disabled={actionLoading}
                      className="w-full py-3 border-2 border-border rounded-xl font-bold text-sm hover:bg-secondary transition-colors text-muted-foreground disabled:opacity-50"
                    >
                      Вернуть на проверку
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════
          ВКЛАДКА: ПЕРЕГОВОРЫ
      ══════════════════════════════════════ */}
      {tab === 'negotiations' && (
        <>
          {/* Filter tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {([
              { key: 'all',      label: 'Все',        emoji: '📋', color: 'border-border'                          },
              { key: 'disputed', label: 'Споры',      emoji: '⚠️', color: 'border-orange-300 bg-orange-50'         },
              { key: 'pending',  label: 'Ожидают',    emoji: '⏳', color: 'border-yellow-300 bg-yellow-50'         },
              { key: 'active',   label: 'Активные',   emoji: '🔥', color: 'border-blue-300 bg-blue-50'             },
            ] as const).map(s => (
              <button
                key={s.key}
                onClick={() => setNegFilter(s.key)}
                className={`border-2 rounded-2xl p-4 text-center transition-all ${s.color} ${negFilter === s.key ? 'ring-2 ring-primary ring-offset-1' : 'hover:ring-1 hover:ring-primary'}`}
              >
                <div className="text-xl mb-1">{s.emoji}</div>
                <div className="text-2xl font-black">{negCounts[s.key]}</div>
                <div className="text-xs text-muted-foreground font-medium">{s.label}</div>
              </button>
            ))}
          </div>

          {/* Negotiations list */}
          {loadingNegs && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white border-2 border-border rounded-2xl p-4 animate-pulse">
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-secondary rounded w-1/2" />
                      <div className="h-3 bg-secondary rounded w-1/3" />
                    </div>
                    <div className="h-8 bg-secondary rounded w-24 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loadingNegs && filteredNegs.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <span className="text-5xl block mb-3">📭</span>
              <p className="text-sm">Нет переговоров в этом разделе</p>
            </div>
          )}

          {!loadingNegs && filteredNegs.length > 0 && (
            <div className="space-y-3">
              {filteredNegs.map(neg => {
                const st = NEG_STATUS_MAP[neg.status] || { label: neg.status, cls: 'bg-gray-100 text-gray-700' };
                const canAct = !['accepted', 'rejected', 'cancelled'].includes(neg.status);
                return (
                  <div
                    key={neg.id}
                    className="bg-white border-2 border-border rounded-2xl p-4 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-sm truncate">{neg.product_title}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${st.cls}`}>{st.label}</span>
                          {neg.status === 'disputed' && (
                            <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full flex-shrink-0">⚠️ Требует внимания</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                          <span>Магазин: <span className="font-semibold text-foreground">{neg.shop_name}</span></span>
                          <span>Покупатель: <span className="font-semibold text-foreground">{neg.buyer_name}</span></span>
                          {neg.offered_price && (
                            <span>Предложено: <span className="font-semibold text-primary">{neg.offered_price.toLocaleString('ru')} ₽</span></span>
                          )}
                          {neg.final_price && (
                            <span>Итог: <span className="font-semibold text-green-600">{neg.final_price.toLocaleString('ru')} ₽</span></span>
                          )}
                        </div>
                        {neg.moderator_note && (
                          <p className="text-xs text-blue-600 mt-1 bg-blue-50 px-2 py-1 rounded-lg inline-block">
                            Заметка: {neg.moderator_note}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(neg.updated_at).toLocaleDateString('ru', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {canAct && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => { setSelectedNeg(neg); setNegAction('cancelled'); setShowNegModal(true); }}
                            className="px-3 py-2 text-xs font-bold border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors whitespace-nowrap"
                          >
                            Отменить
                          </button>
                          {neg.status === 'disputed' && (
                            <button
                              onClick={() => { setSelectedNeg(neg); setNegAction('accepted'); setShowNegModal(true); }}
                              className="px-3 py-2 text-xs font-bold border-2 border-green-200 text-green-600 rounded-xl hover:bg-green-50 transition-colors whitespace-nowrap"
                            >
                              Закрыть спор
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Modal: отклонить магазин ── */}
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
                disabled={!rejectReason.trim() || actionLoading}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black text-sm hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                Отклонить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: действие с переговором ── */}
      {showNegModal && selectedNeg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowNegModal(false); setNegNote(''); }} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-md animate-scale-in shadow-2xl">
            <h3 className="text-lg font-black mb-1">
              {negAction === 'cancelled' ? 'Отменить переговор' : 'Закрыть спор'}
            </h3>
            <p className="text-sm text-muted-foreground mb-1">
              <span className="font-semibold">{selectedNeg.product_title}</span>
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {selectedNeg.buyer_name} · {selectedNeg.shop_name}
            </p>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Заметка модератора (необязательно)
            </label>
            <textarea
              value={negNote}
              onChange={e => setNegNote(e.target.value)}
              rows={3}
              placeholder="Причина решения..."
              className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowNegModal(false); setNegNote(''); }}
                className="flex-1 py-3 border-2 border-border rounded-xl font-bold text-sm hover:bg-secondary transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleNegAction}
                disabled={actionLoading}
                className={`flex-1 py-3 text-white rounded-xl font-black text-sm disabled:opacity-50 transition-colors ${
                  negAction === 'cancelled' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {actionLoading ? 'Сохраняем...' : negAction === 'cancelled' ? 'Отменить' : 'Закрыть спор'}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}