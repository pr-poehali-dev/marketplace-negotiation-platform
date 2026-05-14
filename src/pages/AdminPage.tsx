import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/context/AuthContext';
import {
  MOCK_SELLER_PROFILES, MOCK_USERS, MOCK_SALES,
  SellerProfile, User, Sale
} from '@/data/auth';

interface AdminPageProps {
  onNavigate: (page: string) => void;
}

type AdminTab = 'overview' | 'shops' | 'buyers' | 'content';

const STATUS_MAP = {
  pending:  { label: 'На проверке', cls: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  approved: { label: 'Одобрен',     cls: 'bg-green-100 text-green-700 border-green-300'   },
  rejected: { label: 'Отклонён',    cls: 'bg-red-100 text-red-700 border-red-300'         },
  blocked:  { label: 'Заблокирован',cls: 'bg-gray-100 text-gray-700 border-gray-300'      },
};

const SALE_STATUS = {
  completed:  { label: 'Завершена',  cls: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Отменена',   cls: 'bg-red-100 text-red-700'     },
  processing: { label: 'В процессе', cls: 'bg-yellow-100 text-yellow-700'},
};

const DOC_ICONS: Record<string, string> = { inn:'📄', ogrn:'📋', passport:'🪪', license:'📜', other:'📎' };

/* ─────────────────────────── helpers ─────────────────────────── */
function StatCard({ emoji, label, value, sub }: { emoji: string; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white border-2 border-border rounded-2xl p-5">
      <div className="text-2xl mb-2">{emoji}</div>
      <div className="text-2xl font-black text-primary">{value}</div>
      <div className="text-sm font-semibold mt-0.5">{label}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function AdminPage({ onNavigate }: AdminPageProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState<AdminTab>('overview');

  /* ─ shops state ─ */
  const [shops, setShops]           = useState<SellerProfile[]>(MOCK_SELLER_PROFILES);
  const [selectedShop, setSelectedShop] = useState<SellerProfile | null>(null);
  const [shopTab, setShopTab]       = useState<'info' | 'docs' | 'sales' | 'content'>('info');
  const [shopFilter, setShopFilter] = useState<'all'|'pending'|'approved'|'rejected'|'blocked'>('all');
  const [shopSearch, setShopSearch] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [bonusInput, setBonusInput]  = useState('');
  const [showBonusModal, setShowBonusModal] = useState(false);

  /* ─ content editing for selected shop ─ */
  const [editBannerTitle,    setEditBannerTitle]    = useState('');
  const [editBannerSubtitle, setEditBannerSubtitle] = useState('');
  const [editBannerUrl,      setEditBannerUrl]      = useState('');
  const [editLogoUrl,        setEditLogoUrl]        = useState('');
  const [editDesc,           setEditDesc]           = useState('');
  const [contentSaved,       setContentSaved]       = useState(false);

  /* ─ buyers state ─ */
  const [buyers, setBuyers]             = useState<User[]>(MOCK_USERS);
  const [selectedBuyer, setSelectedBuyer] = useState<User | null>(null);
  const [buyerFilter, setBuyerFilter]   = useState<'all'|'active'|'blocked'>('all');
  const [buyerSearch, setBuyerSearch]   = useState('');
  const [buyerBonusInput, setBuyerBonusInput] = useState('');
  const [showBuyerBonusModal, setShowBuyerBonusModal] = useState(false);

  /* ─ guard ─ */
  if (!user || user.role !== 'moderator') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="bg-white rounded-3xl p-10 text-center shadow-xl max-w-sm w-full">
          <span className="text-6xl block mb-4">🔒</span>
          <h2 className="text-xl font-black mb-2">Доступ запрещён</h2>
          <p className="text-muted-foreground text-sm mb-6">Только для модераторов О'kak</p>
          <button onClick={() => onNavigate('home')} className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all">
            На главную
          </button>
        </div>
      </div>
    );
  }

  /* ─ computed ─ */
  const filteredShops = shops.filter(s => {
    const fm = shopFilter === 'all' || s.status === shopFilter;
    const sm = !shopSearch || s.shopName.toLowerCase().includes(shopSearch.toLowerCase()) || s.sellerCode.toLowerCase().includes(shopSearch.toLowerCase());
    return fm && sm;
  });

  const filteredBuyers = buyers.filter(u => {
    const roles = buyerFilter === 'all' ? true : u.status === buyerFilter;
    const sm = !buyerSearch || u.name.toLowerCase().includes(buyerSearch.toLowerCase()) || u.phone.includes(buyerSearch) || u.buyerCode.toLowerCase().includes(buyerSearch.toLowerCase());
    return roles && sm && u.role !== 'moderator';
  });

  const shopSales = (shopId: string) => MOCK_SALES.filter(s => s.shopId === shopId);

  /* ─ actions: shops ─ */
  const approveShop  = (id: string) => { setShops(p => p.map(s => s.id === id ? {...s, status:'approved'} : s)); setSelectedShop(p => p?.id === id ? {...p, status:'approved'} : p); };
  const rejectShop   = (id: string) => { if (!rejectReason.trim()) return; setShops(p => p.map(s => s.id === id ? {...s, status:'rejected', rejectionReason: rejectReason} : s)); setSelectedShop(p => p?.id === id ? {...p, status:'rejected', rejectionReason: rejectReason} : p); setRejectReason(''); setShowRejectModal(false); };
  const blockShop    = (id: string) => { setShops(p => p.map(s => s.id === id ? {...s, status:'blocked'} : s)); setSelectedShop(p => p?.id === id ? {...p, status:'blocked'} : p); };
  const unblockShop  = (id: string) => { setShops(p => p.map(s => s.id === id ? {...s, status:'approved'} : s)); setSelectedShop(p => p?.id === id ? {...p, status:'approved'} : p); };
  const addShopBonus = (id: string) => { const n = Number(bonusInput); if (!n) return; setShops(p => p.map(s => s.id === id ? {...s, bonusPoints: s.bonusPoints + n} : s)); setSelectedShop(p => p?.id === id ? {...p, bonusPoints:(p.bonusPoints||0)+n} : p); setBonusInput(''); setShowBonusModal(false); };

  /* ─ actions: content save ─ */
  const saveContent = (id: string) => {
    setShops(p => p.map(s => s.id === id ? {
      ...s,
      bannerTitle: editBannerTitle || s.bannerTitle,
      bannerSubtitle: editBannerSubtitle || s.bannerSubtitle,
      bannerUrl: editBannerUrl || s.bannerUrl,
      logoImageUrl: editLogoUrl || s.logoImageUrl,
      shopDescription: editDesc || s.shopDescription,
    } : s));
    setSelectedShop(p => p?.id === id ? {
      ...p,
      bannerTitle: editBannerTitle || p.bannerTitle,
      bannerSubtitle: editBannerSubtitle || p.bannerSubtitle,
      bannerUrl: editBannerUrl || p.bannerUrl,
      shopDescription: editDesc || p.shopDescription,
    } : p);
    setContentSaved(true);
    setTimeout(() => setContentSaved(false), 2000);
  };

  /* ─ actions: buyers ─ */
  const blockBuyer   = (id: string) => { setBuyers(p => p.map(u => u.id === id ? {...u, status:'blocked'} : u)); setSelectedBuyer(p => p?.id === id ? {...p, status:'blocked'} : p); };
  const unblockBuyer = (id: string) => { setBuyers(p => p.map(u => u.id === id ? {...u, status:'active'} : u)); setSelectedBuyer(p => p?.id === id ? {...p, status:'active'} : p); };
  const addBuyerBonus = (id: string) => { const n = Number(buyerBonusInput); if (!n) return; setBuyers(p => p.map(u => u.id === id ? {...u, bonusPoints: u.bonusPoints + n} : u)); setSelectedBuyer(p => p?.id === id ? {...p, bonusPoints:(p.bonusPoints||0)+n} : p); setBuyerBonusInput(''); setShowBuyerBonusModal(false); };

  const openShop = (shop: SellerProfile) => {
    setSelectedShop(shop);
    setShopTab('info');
    setEditBannerTitle(shop.bannerTitle || '');
    setEditBannerSubtitle(shop.bannerSubtitle || '');
    setEditBannerUrl(shop.bannerUrl || '');
    setEditLogoUrl(shop.logoImageUrl || '');
    setEditDesc(shop.shopDescription || '');
    setContentSaved(false);
  };

  /* ─────────── OVERVIEW ─────────── */
  const totalRevenue = shops.reduce((a,s) => a + s.totalRevenue, 0);
  const totalSales   = MOCK_SALES.length;
  const buyers_only  = buyers.filter(u => u.role !== 'moderator' && u.role !== 'seller');

  /* ════════════════════════════════════════════════════ RENDER ═══ */
  return (
    <div className="min-h-screen bg-secondary/40">
      {/* Admin header */}
      <div className="bg-white border-b-2 border-primary/20 sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-black">О'</span>
            </div>
            <span className="font-black text-sm">Панель управления</span>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full border border-red-300">ADMIN</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{user.name}</span>
            <button onClick={() => onNavigate('home')} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
              <Icon name="ExternalLink" size={12} /> Сайт
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {([
            { key:'overview', label:'Обзор',         emoji:'📊' },
            { key:'shops',    label:'Магазины',       emoji:'🏪' },
            { key:'buyers',   label:'Покупатели',     emoji:'👥' },
            { key:'content',  label:'Контент сайта',  emoji:'🎨' },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === t.key ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-white border-2 border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              <span>{t.emoji}</span>{t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard emoji="🏪" label="Магазинов"     value={String(shops.filter(s=>s.status==='approved').length)} sub={`${shops.filter(s=>s.status==='pending').length} на проверке`} />
              <StatCard emoji="👥" label="Покупателей"   value={String(buyers_only.length)} sub={`${buyers_only.filter(u=>u.status==='blocked').length} заблокировано`} />
              <StatCard emoji="🤝" label="Продаж"        value={String(totalSales)} sub="за всё время" />
              <StatCard emoji="💰" label="Оборот"        value={`${(totalRevenue/1000000).toFixed(1)} млн ₽`} sub="суммарно" />
            </div>

            <div className="bg-white border-2 border-border rounded-2xl p-5">
              <h3 className="font-black mb-4 flex items-center gap-2"><span>📋</span> Последние продажи</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-xs text-muted-foreground uppercase tracking-wide">
                    <th className="text-left pb-3 pr-4">Товар</th>
                    <th className="text-left pb-3 pr-4">Магазин</th>
                    <th className="text-left pb-3 pr-4">Покупатель</th>
                    <th className="text-left pb-3 pr-4">Сумма</th>
                    <th className="text-left pb-3">Статус</th>
                  </tr></thead>
                  <tbody className="divide-y divide-border">
                    {MOCK_SALES.slice(0,6).map(sale => {
                      const shop = shops.find(s => s.id === sale.shopId);
                      return (
                        <tr key={sale.id} className="hover:bg-secondary/50 transition-colors">
                          <td className="py-2.5 pr-4">
                            <div className="font-semibold">{sale.productName}</div>
                            <div className="text-xs text-muted-foreground font-mono">{sale.article}</div>
                          </td>
                          <td className="py-2.5 pr-4 text-muted-foreground">{shop?.shopName || '—'}</td>
                          <td className="py-2.5 pr-4 text-muted-foreground">{sale.buyerName}</td>
                          <td className="py-2.5 pr-4 font-black text-primary">{sale.amount.toLocaleString('ru')} ₽</td>
                          <td className="py-2.5">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SALE_STATUS[sale.status].cls}`}>{SALE_STATUS[sale.status].label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white border-2 border-border rounded-2xl p-5">
                <h3 className="font-black mb-3 flex items-center gap-2"><span>⏳</span>Требуют проверки</h3>
                {shops.filter(s=>s.status==='pending').length === 0
                  ? <p className="text-sm text-muted-foreground">Нет новых заявок</p>
                  : shops.filter(s=>s.status==='pending').map(s => (
                    <button key={s.id} onClick={() => {setTab('shops'); openShop(s);}}
                      className="w-full flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl mb-2 text-left hover:border-yellow-400 transition-colors">
                      <div className="w-8 h-8 bg-yellow-400 text-white rounded-lg flex items-center justify-center text-xs font-black">{s.logo}</div>
                      <div><div className="font-bold text-sm">{s.shopName}</div><div className="text-xs text-muted-foreground">{s.sellerCode} · {s.city}</div></div>
                      <Icon name="ChevronRight" size={14} className="ml-auto text-muted-foreground" />
                    </button>
                  ))
                }
              </div>
              <div className="bg-white border-2 border-border rounded-2xl p-5">
                <h3 className="font-black mb-3 flex items-center gap-2"><span>🚫</span>Заблокированные</h3>
                {buyers.filter(u=>u.status==='blocked').length === 0
                  ? <p className="text-sm text-muted-foreground">Нет заблокированных</p>
                  : buyers.filter(u=>u.status==='blocked').map(u => (
                    <div key={u.id} className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl mb-2">
                      <div className="w-8 h-8 bg-red-400 text-white rounded-lg flex items-center justify-center text-xs font-black">{u.avatar}</div>
                      <div><div className="font-bold text-sm">{u.name}</div><div className="text-xs text-muted-foreground">{u.phone}</div></div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {/* ── SHOPS ── */}
        {tab === 'shops' && (
          <div className="animate-fade-in grid lg:grid-cols-5 gap-5">
            {/* left: list */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input value={shopSearch} onChange={e=>setShopSearch(e.target.value)} placeholder="Поиск..." className="w-full pl-8 pr-3 py-2.5 bg-white border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
                </div>
                <select value={shopFilter} onChange={e=>setShopFilter(e.target.value as typeof shopFilter)} className="px-3 py-2.5 bg-white border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary cursor-pointer">
                  <option value="all">Все</option>
                  <option value="pending">На проверке</option>
                  <option value="approved">Одобрен</option>
                  <option value="rejected">Отклонён</option>
                  <option value="blocked">Заблокирован</option>
                </select>
              </div>
              {filteredShops.map(shop => {
                const st = STATUS_MAP[shop.status as keyof typeof STATUS_MAP] || STATUS_MAP.pending;
                return (
                  <button key={shop.id} onClick={() => openShop(shop)}
                    className={`w-full text-left p-4 bg-white border-2 rounded-2xl transition-all hover:border-primary/50 ${selectedShop?.id===shop.id?'border-primary shadow-md shadow-primary/10':'border-border'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0">{shop.logo}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-black text-sm truncate">{shop.shopName}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${st.cls}`}>{st.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">{shop.sellerCode}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{shop.city} · {shop.totalSales} продаж · {shop.bonusPoints} бонусов</p>
                      </div>
                    </div>
                  </button>
                );
              })}
              {filteredShops.length === 0 && <div className="text-center py-10 text-muted-foreground"><span className="text-4xl block mb-2">🔍</span><p className="text-sm">Не найдено</p></div>}
            </div>

            {/* right: detail */}
            <div className="lg:col-span-3">
              {!selectedShop ? (
                <div className="bg-white border-2 border-border rounded-3xl p-12 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                  <span className="text-5xl block mb-3">👈</span>
                  <p className="text-sm">Выберите магазин</p>
                </div>
              ) : (
                <div className="bg-white border-2 border-border rounded-3xl overflow-hidden">
                  {/* shop header */}
                  <div className="p-5 border-b-2 border-border flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center text-xl font-black">{selectedShop.logo}</div>
                    <div className="flex-1">
                      <h2 className="text-xl font-black">{selectedShop.shopName}</h2>
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold">{selectedShop.sellerCode}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${(STATUS_MAP[selectedShop.status as keyof typeof STATUS_MAP]||STATUS_MAP.pending).cls}`}>
                          {(STATUS_MAP[selectedShop.status as keyof typeof STATUS_MAP]||STATUS_MAP.pending).label}
                        </span>
                      </div>
                    </div>
                    {/* quick actions */}
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      {selectedShop.status === 'pending' && <>
                        <button onClick={() => approveShop(selectedShop.id)} className="px-3 py-1.5 bg-green-600 text-white rounded-xl text-xs font-black hover:bg-green-700 transition-colors">✓ Одобрить</button>
                        <button onClick={() => setShowRejectModal(true)} className="px-3 py-1.5 bg-red-500 text-white rounded-xl text-xs font-black hover:bg-red-600 transition-colors">✗ Отклонить</button>
                      </>}
                      {selectedShop.status === 'approved' && <button onClick={() => blockShop(selectedShop.id)} className="px-3 py-1.5 bg-gray-600 text-white rounded-xl text-xs font-black hover:bg-gray-700 transition-colors">🚫 Заблокировать</button>}
                      {selectedShop.status === 'blocked'  && <button onClick={() => unblockShop(selectedShop.id)} className="px-3 py-1.5 bg-green-600 text-white rounded-xl text-xs font-black hover:bg-green-700 transition-colors">✓ Разблокировать</button>}
                      <button onClick={() => setShowBonusModal(true)} className="px-3 py-1.5 bg-orange-400 text-white rounded-xl text-xs font-black hover:bg-orange-500 transition-colors">🎁 Бонусы</button>
                    </div>
                  </div>

                  {/* inner tabs */}
                  <div className="flex border-b-2 border-border overflow-x-auto">
                    {([
                      { key:'info',    label:'Информация' },
                      { key:'docs',    label:'Документы' },
                      { key:'sales',   label:`Продажи (${shopSales(selectedShop.id).length})` },
                      { key:'content', label:'Контент' },
                    ] as const).map(t => (
                      <button key={t.key} onClick={() => setShopTab(t.key)}
                        className={`px-5 py-3 text-sm font-bold border-b-2 flex-shrink-0 transition-colors ${shopTab===t.key?'border-primary text-primary':'border-transparent text-muted-foreground hover:text-foreground'}`}
                      >{t.label}</button>
                    ))}
                  </div>

                  <div className="p-5 max-h-[60vh] overflow-y-auto">
                    {/* INFO */}
                    {shopTab === 'info' && (
                      <div className="space-y-3 animate-fade-in">
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            {l:'Город',    v:selectedShop.city},
                            {l:'Адрес',    v:selectedShop.address},
                            {l:'Телефон',  v:selectedShop.phone},
                            {l:'Дата рег.',v:selectedShop.createdAt},
                            {l:'Продаж',   v:String(selectedShop.totalSales)},
                            {l:'Выручка',  v:`${selectedShop.totalRevenue.toLocaleString('ru')} ₽`},
                            {l:'Товаров',  v:String(selectedShop.productsCount)},
                            {l:'Бонусы',   v:String(selectedShop.bonusPoints)},
                          ].map(f => (
                            <div key={f.l} className="bg-secondary rounded-xl p-3">
                              <div className="text-xs text-muted-foreground mb-0.5">{f.l}</div>
                              <div className="text-sm font-bold">{f.v}</div>
                            </div>
                          ))}
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Описание</div>
                          <p className="text-sm bg-secondary rounded-xl p-3">{selectedShop.shopDescription}</p>
                        </div>
                        {selectedShop.rejectionReason && (
                          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                            <div className="text-xs font-bold text-red-700 mb-1">Причина отклонения</div>
                            <p className="text-sm text-red-700">{selectedShop.rejectionReason}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* DOCS */}
                    {shopTab === 'docs' && (
                      <div className="space-y-3 animate-fade-in">
                        {selectedShop.documents.map(doc => (
                          <div key={doc.id} className={`flex items-center gap-3 p-4 rounded-2xl border-2 ${doc.status==='approved'?'border-green-200 bg-green-50':doc.status==='rejected'?'border-red-200 bg-red-50':'border-border bg-white'}`}>
                            <span className="text-2xl">{DOC_ICONS[doc.type]||'📎'}</span>
                            <div className="flex-1">
                              <div className="font-bold text-sm">{doc.name}</div>
                              <div className="text-xs text-muted-foreground">{doc.fileName} · {doc.uploadedAt}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button className="text-xs text-primary hover:underline flex items-center gap-1"><Icon name="Eye" size={12}/>Просмотр</button>
                              <div className="flex gap-1">
                                <button onClick={() => {}} className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200 transition-colors">✓</button>
                                <button onClick={() => {}} className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors">✗</button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {selectedShop.documents.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Документы не загружены</p>}
                      </div>
                    )}

                    {/* SALES */}
                    {shopTab === 'sales' && (
                      <div className="animate-fade-in">
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                            <div className="text-lg font-black text-green-700">{shopSales(selectedShop.id).filter(s=>s.status==='completed').length}</div>
                            <div className="text-xs text-muted-foreground">Завершено</div>
                          </div>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
                            <div className="text-lg font-black text-yellow-700">{shopSales(selectedShop.id).filter(s=>s.status==='processing').length}</div>
                            <div className="text-xs text-muted-foreground">В процессе</div>
                          </div>
                          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                            <div className="text-lg font-black text-red-700">{shopSales(selectedShop.id).filter(s=>s.status==='cancelled').length}</div>
                            <div className="text-xs text-muted-foreground">Отменено</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {shopSales(selectedShop.id).map((sale: Sale) => (
                            <div key={sale.id} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                              <div className="flex-1">
                                <div className="font-semibold text-sm">{sale.productName}</div>
                                <div className="text-xs text-muted-foreground">{sale.buyerName} · {sale.date} · <span className="font-mono">{sale.article}</span></div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="font-black text-sm">{sale.amount.toLocaleString('ru')} ₽</div>
                                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${SALE_STATUS[sale.status].cls}`}>{SALE_STATUS[sale.status].label}</span>
                              </div>
                            </div>
                          ))}
                          {shopSales(selectedShop.id).length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Нет продаж</p>}
                        </div>
                      </div>
                    )}

                    {/* CONTENT */}
                    {shopTab === 'content' && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 text-xs text-blue-800">
                          💡 Изменения сохраняются мгновенно и отражаются на странице магазина
                        </div>

                        <div>
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Баннер — заголовок</label>
                          <input value={editBannerTitle} onChange={e=>setEditBannerTitle(e.target.value)} placeholder={selectedShop.bannerTitle||'Заголовок баннера'} className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Баннер — подзаголовок</label>
                          <input value={editBannerSubtitle} onChange={e=>setEditBannerSubtitle(e.target.value)} placeholder={selectedShop.bannerSubtitle||'Подзаголовок баннера'} className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Картинка баннера (URL)</label>
                          <input value={editBannerUrl} onChange={e=>setEditBannerUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
                          <div className="mt-2 text-xs text-muted-foreground">или загрузить файл:</div>
                          <label className="mt-1 flex items-center gap-2 cursor-pointer">
                            <div className="px-3 py-2 border-2 border-dashed border-border rounded-xl text-xs text-muted-foreground hover:border-primary transition-colors flex items-center gap-2">
                              <Icon name="Upload" size={13} /> Выбрать изображение
                            </div>
                            <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) setEditBannerUrl(URL.createObjectURL(e.target.files[0])); }} />
                          </label>
                          {editBannerUrl && editBannerUrl.startsWith('blob:') && (
                            <img src={editBannerUrl} alt="preview" className="mt-2 h-24 w-full object-cover rounded-xl border" />
                          )}
                        </div>
                        <div>
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Логотип магазина (URL или файл)</label>
                          <input value={editLogoUrl} onChange={e=>setEditLogoUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
                          <label className="mt-2 flex items-center gap-2 cursor-pointer">
                            <div className="px-3 py-2 border-2 border-dashed border-border rounded-xl text-xs text-muted-foreground hover:border-primary transition-colors flex items-center gap-2">
                              <Icon name="Upload" size={13} /> Загрузить логотип
                            </div>
                            <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) setEditLogoUrl(URL.createObjectURL(e.target.files[0])); }} />
                          </label>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Описание магазина</label>
                          <textarea value={editDesc} onChange={e=>setEditDesc(e.target.value)} rows={3} placeholder={selectedShop.shopDescription} className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors resize-none" />
                        </div>
                        <button onClick={() => saveContent(selectedShop.id)} className={`w-full py-3 rounded-xl font-black text-sm transition-all ${contentSaved?'bg-green-600 text-white':'bg-primary text-white hover:opacity-90 shadow-md shadow-primary/30'}`}>
                          {contentSaved ? '✓ Сохранено!' : 'Сохранить изменения'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── BUYERS ── */}
        {tab === 'buyers' && (
          <div className="animate-fade-in grid lg:grid-cols-5 gap-5">
            {/* list */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input value={buyerSearch} onChange={e=>setBuyerSearch(e.target.value)} placeholder="Имя, телефон, код..." className="w-full pl-8 pr-3 py-2.5 bg-white border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
                </div>
                <select value={buyerFilter} onChange={e=>setBuyerFilter(e.target.value as typeof buyerFilter)} className="px-3 py-2.5 bg-white border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary cursor-pointer">
                  <option value="all">Все</option>
                  <option value="active">Активные</option>
                  <option value="blocked">Заблокированные</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  {l:'Всего', v:buyers.filter(u=>u.role!=='moderator').length, cls:'bg-white'},
                  {l:'Активных', v:buyers.filter(u=>u.status==='active'&&u.role!=='moderator').length, cls:'bg-green-50'},
                  {l:'Заблок.', v:buyers.filter(u=>u.status==='blocked').length, cls:'bg-red-50'},
                ].map(s=>(
                  <div key={s.l} className={`${s.cls} border-2 border-border rounded-xl p-3`}>
                    <div className="font-black text-lg">{s.v}</div>
                    <div className="text-xs text-muted-foreground">{s.l}</div>
                  </div>
                ))}
              </div>
              {filteredBuyers.map(u => (
                <button key={u.id} onClick={() => setSelectedBuyer(u)}
                  className={`w-full text-left p-4 bg-white border-2 rounded-2xl transition-all hover:border-primary/50 ${selectedBuyer?.id===u.id?'border-primary shadow-md shadow-primary/10':'border-border'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${u.status==='blocked'?'bg-gray-300 text-gray-600':'bg-primary text-white'}`}>{u.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm truncate">{u.name}</span>
                        {u.status==='blocked' && <span className="text-xs font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full">🚫</span>}
                        {u.role==='seller' && <span className="text-xs font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-full">продавец</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">{u.phone} · {u.buyerCode}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">🎁 {u.bonusPoints} · {u.ordersCount} заказов</p>
                    </div>
                  </div>
                </button>
              ))}
              {filteredBuyers.length === 0 && <div className="text-center py-10 text-muted-foreground"><span className="text-4xl block mb-2">🔍</span><p className="text-sm">Не найдено</p></div>}
            </div>

            {/* detail */}
            <div className="lg:col-span-3">
              {!selectedBuyer ? (
                <div className="bg-white border-2 border-border rounded-3xl p-12 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                  <span className="text-5xl block mb-3">👈</span>
                  <p className="text-sm">Выберите пользователя</p>
                </div>
              ) : (
                <div className="bg-white border-2 border-border rounded-3xl overflow-hidden animate-fade-in">
                  {/* header */}
                  <div className="p-5 border-b-2 border-border flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black ${selectedBuyer.status==='blocked'?'bg-gray-300 text-gray-600':'bg-primary text-white'}`}>{selectedBuyer.avatar}</div>
                    <div className="flex-1">
                      <h2 className="text-xl font-black">{selectedBuyer.name}</h2>
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold">{selectedBuyer.buyerCode}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${selectedBuyer.status==='blocked'?'bg-red-100 text-red-700 border-red-300':'bg-green-100 text-green-700 border-green-300'}`}>{selectedBuyer.status==='blocked'?'🚫 Заблокирован':'✅ Активен'}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${selectedBuyer.role==='seller'?'bg-purple-100 text-purple-700':'bg-blue-100 text-blue-700'}`}>{selectedBuyer.role==='seller'?'Продавец':'Покупатель'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {l:'Телефон',       v:selectedBuyer.phone},
                        {l:'Зарегистрирован', v:selectedBuyer.createdAt},
                        {l:'Заказов',       v:String(selectedBuyer.ordersCount)},
                        {l:'Потрачено',     v:`${selectedBuyer.totalSpent.toLocaleString('ru')} ₽`},
                        {l:'Бонусов',       v:String(selectedBuyer.bonusPoints)},
                        {l:'Роль',          v:selectedBuyer.role==='seller'?'Продавец':selectedBuyer.role==='moderator'?'Модератор':'Покупатель'},
                      ].map(f=>(
                        <div key={f.l} className="bg-secondary rounded-xl p-3">
                          <div className="text-xs text-muted-foreground mb-0.5">{f.l}</div>
                          <div className="text-sm font-bold">{f.v}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3 pt-2">
                      {selectedBuyer.status === 'active' ? (
                        <button onClick={() => blockBuyer(selectedBuyer.id)} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                          <Icon name="Ban" size={15} /> Заблокировать
                        </button>
                      ) : (
                        <button onClick={() => unblockBuyer(selectedBuyer.id)} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-black text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                          <Icon name="CheckCircle" size={15} /> Разблокировать
                        </button>
                      )}
                      <button onClick={() => setShowBuyerBonusModal(true)} className="flex-1 py-3 bg-orange-400 text-white rounded-xl font-black text-sm hover:bg-orange-500 transition-colors flex items-center justify-center gap-2">
                        🎁 Начислить бонусы
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CONTENT ── */}
        {tab === 'content' && (
          <div className="animate-fade-in max-w-3xl space-y-5">
            <div className="bg-white border-2 border-border rounded-2xl p-5">
              <h3 className="font-black mb-4 flex items-center gap-2"><span>🏠</span> Главная страница</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Заголовок Hero-баннера</label>
                  <input defaultValue="О'kak — торгуйся и побеждай! 🎉" className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Подзаголовок</label>
                  <textarea defaultValue="Предлагай свою цену, продавец принимает — и сразу в чат! Тысячи товаров. Встроенный торг. Полностью бесплатно." rows={2} className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors resize-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Фоновое изображение Hero</label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="px-4 py-3 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary transition-colors flex items-center gap-2">
                      <Icon name="Upload" size={14}/> Загрузить изображение
                    </div>
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-border rounded-2xl p-5">
              <h3 className="font-black mb-4 flex items-center gap-2"><span>📢</span> Баннеры и акции</h3>
              <div className="space-y-3">
                {[
                  { title: 'Баннер «Торг»', subtitle: 'Механика торга', active: true },
                  { title: 'Баннер «Бесплатно»', subtitle: 'О бесплатности платформы', active: true },
                  { title: 'Новый баннер акции', subtitle: 'Не активен', active: false },
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 border-2 border-border rounded-xl">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${b.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{b.title}</div>
                      <div className="text-xs text-muted-foreground">{b.subtitle}</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors"><Icon name="Pencil" size={13} className="text-muted-foreground" /></button>
                      <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors"><Icon name="Trash2" size={13} className="text-muted-foreground" /></button>
                    </div>
                  </div>
                ))}
                <button className="w-full py-3 border-2 border-dashed border-primary/40 text-primary rounded-xl text-sm font-bold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2">
                  <Icon name="Plus" size={14} /> Добавить баннер
                </button>
              </div>
            </div>

            <div className="bg-white border-2 border-border rounded-2xl p-5">
              <h3 className="font-black mb-4 flex items-center gap-2"><span>📸</span> Медиатека сайта</h3>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="aspect-video bg-secondary rounded-xl border-2 border-border overflow-hidden relative group cursor-pointer hover:border-primary transition-colors">
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40 text-xs">Изображение {i}</div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button className="p-1.5 bg-white rounded-lg"><Icon name="Eye" size={12}/></button>
                      <button className="p-1.5 bg-white rounded-lg"><Icon name="Trash2" size={12}/></button>
                    </div>
                  </div>
                ))}
                <label className="aspect-video border-2 border-dashed border-primary/40 rounded-xl flex items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors">
                  <div className="text-center text-primary">
                    <Icon name="Plus" size={20} className="mx-auto mb-1" />
                    <span className="text-xs font-bold">Загрузить</span>
                  </div>
                  <input type="file" accept="image/*" multiple className="hidden" />
                </label>
              </div>
            </div>

            <button className="w-full py-3.5 bg-primary text-white rounded-xl font-black text-sm hover:opacity-90 transition-all shadow-md shadow-primary/30">
              Сохранить все изменения
            </button>
          </div>
        )}
      </div>

      {/* ── MODALS ── */}
      {/* Reject shop */}
      {showRejectModal && selectedShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRejectModal(false)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-md animate-scale-in shadow-2xl">
            <h3 className="text-lg font-black mb-2">Причина отклонения</h3>
            <p className="text-sm text-muted-foreground mb-4">Продавец увидит причину и сможет исправить документы.</p>
            <textarea value={rejectReason} onChange={e=>setRejectReason(e.target.value)} rows={3} placeholder="Например: ИНН не читается..." className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary resize-none mb-4" autoFocus />
            <div className="flex gap-3">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 py-3 border-2 border-border rounded-xl font-bold text-sm">Отмена</button>
              <button onClick={() => rejectShop(selectedShop.id)} disabled={!rejectReason.trim()} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black text-sm hover:bg-red-600 disabled:opacity-50">Отклонить</button>
            </div>
          </div>
        </div>
      )}

      {/* Bonus shop */}
      {showBonusModal && selectedShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowBonusModal(false)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-sm animate-scale-in shadow-2xl">
            <h3 className="text-lg font-black mb-1">🎁 Бонусы магазину</h3>
            <p className="text-sm text-muted-foreground mb-1">Магазин: <span className="font-bold">{selectedShop.shopName}</span></p>
            <p className="text-sm text-muted-foreground mb-4">Текущий баланс: <span className="font-bold text-primary">{selectedShop.bonusPoints} баллов</span></p>
            <input type="number" value={bonusInput} onChange={e=>setBonusInput(e.target.value)} placeholder="Количество баллов" className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary mb-4" autoFocus />
            <div className="flex gap-3">
              <button onClick={() => setShowBonusModal(false)} className="flex-1 py-3 border-2 border-border rounded-xl font-bold text-sm">Отмена</button>
              <button onClick={() => addShopBonus(selectedShop.id)} disabled={!bonusInput} className="flex-1 py-3 bg-orange-400 text-white rounded-xl font-black text-sm hover:bg-orange-500 disabled:opacity-50">Начислить</button>
            </div>
          </div>
        </div>
      )}

      {/* Bonus buyer */}
      {showBuyerBonusModal && selectedBuyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowBuyerBonusModal(false)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-sm animate-scale-in shadow-2xl">
            <h3 className="text-lg font-black mb-1">🎁 Бонусы покупателю</h3>
            <p className="text-sm text-muted-foreground mb-1">Пользователь: <span className="font-bold">{selectedBuyer.name}</span></p>
            <p className="text-sm text-muted-foreground mb-4">Текущий баланс: <span className="font-bold text-primary">{selectedBuyer.bonusPoints} баллов</span></p>
            <input type="number" value={buyerBonusInput} onChange={e=>setBuyerBonusInput(e.target.value)} placeholder="Количество баллов" className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary mb-4" autoFocus />
            <div className="flex gap-3">
              <button onClick={() => setShowBuyerBonusModal(false)} className="flex-1 py-3 border-2 border-border rounded-xl font-bold text-sm">Отмена</button>
              <button onClick={() => addBuyerBonus(selectedBuyer.id)} disabled={!buyerBonusInput} className="flex-1 py-3 bg-orange-400 text-white rounded-xl font-black text-sm hover:bg-orange-500 disabled:opacity-50">Начислить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
