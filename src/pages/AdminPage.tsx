import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/context/AuthContext';
import { SellerProfile, User } from '@/data/auth';
import AdminOverviewTab from '@/pages/admin/AdminOverviewTab';
import AdminShopsTab from '@/pages/admin/AdminShopsTab';
import AdminBuyersTab from '@/pages/admin/AdminBuyersTab';
import AdminContentTab from '@/pages/admin/AdminContentTab';
import AdminLeadsTab from '@/pages/admin/AdminLeadsTab';
import AdminProductsTab from '@/pages/admin/AdminProductsTab';
import { useLeads } from '@/context/LeadsContext';
import { moderatorApi, ModShop, ModUser } from '@/api/moderator';

interface AdminPageProps {
  onNavigate: (page: string) => void;
}

type AdminTab = 'overview' | 'shops' | 'buyers' | 'content' | 'leads' | 'products';

export default function AdminPage({ onNavigate }: AdminPageProps) {
  const { user } = useAuth();
  const { leads } = useLeads();
  const newLeadsCount = leads.filter(l => l.status === 'new').length;
  const [tab, setTab] = useState<AdminTab>('overview');

  /* ─ load real data ─ */
  useEffect(() => {
    if (user?.role === 'moderator') {
      moderatorApi.shops().then(d => {
        const mapped = d.shops.map((s: ModShop) => ({
          id: String(s.id),
          userId: String(s.user_id),
          sellerCode: '',
          shopName: s.shop_name,
          shopDescription: s.description,
          city: s.city,
          address: '',
          phone: s.contact_phone,
          logo: '',
          status: s.status as SellerProfile['status'],
          documents: [],
          totalSales: s.total_sales,
          totalRevenue: s.total_revenue,
          productsCount: s.products_count,
          bonusPoints: s.bonus_points,
          createdAt: s.created_at.split('T')[0],
          rejection_reason: s.rejection_reason,
          owner_name: s.owner_name,
          owner_phone: s.owner_phone,
        } as SellerProfile & { rejection_reason: string; owner_name: string; owner_phone: string }));
        setShops(mapped);
      }).catch(console.error);
      moderatorApi.users().then(d => {
        const mapped = d.users.map((u: ModUser) => ({
          id: String(u.id),
          phone: u.phone,
          name: u.name,
          role: u.role as User['role'],
          status: u.status as User['status'],
          buyerCode: '',
          avatar: u.name.substring(0, 2).toUpperCase(),
          bonusPoints: u.bonus_points,
          createdAt: u.created_at.split('T')[0],
          ordersCount: u.orders_count,
          totalSpent: u.total_spent,
        } as User));
        setBuyers(mapped);
      }).catch(console.error);
    }
  }, [user]);

  /* ─ shops state ─ */
  const [shops, setShops]               = useState<SellerProfile[]>([]);
  const [selectedShop, setSelectedShop] = useState<SellerProfile | null>(null);
  const [shopTab, setShopTab]           = useState<'info' | 'docs' | 'sales' | 'content'>('info');
  const [shopFilter, setShopFilter]     = useState<'all' | 'pending' | 'approved' | 'rejected' | 'blocked'>('all');
  const [shopSearch, setShopSearch]     = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [bonusInput, setBonusInput]     = useState('');
  const [showBonusModal, setShowBonusModal] = useState(false);

  /* ─ content editing for selected shop ─ */
  const [editBannerTitle,    setEditBannerTitle]    = useState('');
  const [editBannerSubtitle, setEditBannerSubtitle] = useState('');
  const [editBannerUrl,      setEditBannerUrl]      = useState('');
  const [editLogoUrl,        setEditLogoUrl]        = useState('');
  const [editDesc,           setEditDesc]           = useState('');
  const [contentSaved,       setContentSaved]       = useState(false);

  /* ─ buyers state ─ */
  const [buyers, setBuyers]               = useState<User[]>([]);
  const [selectedBuyer, setSelectedBuyer] = useState<User | null>(null);
  const [buyerFilter, setBuyerFilter]     = useState<'all' | 'active' | 'blocked'>('all');
  const [buyerSearch, setBuyerSearch]     = useState('');
  const [buyerBonusInput, setBuyerBonusInput]       = useState('');
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

  /* ─ actions: shops ─ */
  const updateShopState = (id: string, patch: Partial<SellerProfile>) => { setShops(p => p.map(s => s.id === id ? { ...s, ...patch } : s)); setSelectedShop(p => p?.id === id ? { ...p, ...patch } : p); };
  const approveShop  = (id: string) => { moderatorApi.updateShop(Number(id), { status: 'approved' }).catch(console.error); updateShopState(id, { status: 'approved' }); };
  const rejectShop   = (id: string) => { if (!rejectReason.trim()) return; moderatorApi.updateShop(Number(id), { status: 'rejected', rejection_reason: rejectReason }).catch(console.error); updateShopState(id, { status: 'rejected' }); setRejectReason(''); setShowRejectModal(false); };
  const blockShop    = (id: string) => { moderatorApi.updateShop(Number(id), { status: 'blocked' }).catch(console.error); updateShopState(id, { status: 'blocked' }); };
  const unblockShop  = (id: string) => { moderatorApi.updateShop(Number(id), { status: 'approved' }).catch(console.error); updateShopState(id, { status: 'approved' }); };
  const addShopBonus = (id: string) => { const n = Number(bonusInput); if (!n) return; moderatorApi.updateShop(Number(id), { bonus_points: n }).catch(console.error); updateShopState(id, { bonusPoints: (shops.find(s=>s.id===id)?.bonusPoints||0)+n }); setBonusInput(''); setShowBonusModal(false); };

  /* ─ actions: content save ─ */
  const saveContent = (id: string) => {
    setShops(p => p.map(s => s.id === id ? {
      ...s,
      bannerTitle:      editBannerTitle    || s.bannerTitle,
      bannerSubtitle:   editBannerSubtitle || s.bannerSubtitle,
      bannerUrl:        editBannerUrl      || s.bannerUrl,
      logoImageUrl:     editLogoUrl        || s.logoImageUrl,
      shopDescription:  editDesc           || s.shopDescription,
    } : s));
    setSelectedShop(p => p?.id === id ? {
      ...p,
      bannerTitle:      editBannerTitle    || p.bannerTitle,
      bannerSubtitle:   editBannerSubtitle || p.bannerSubtitle,
      bannerUrl:        editBannerUrl      || p.bannerUrl,
      shopDescription:  editDesc           || p.shopDescription,
    } : p);
    setContentSaved(true);
    setTimeout(() => setContentSaved(false), 2000);
  };

  /* ─ actions: buyers ─ */
  const updateBuyerState = (id: string, patch: Partial<User>) => { setBuyers(p => p.map(u => u.id === id ? { ...u, ...patch } : u)); setSelectedBuyer(p => p?.id === id ? { ...p, ...patch } : p); };
  const blockBuyer    = (id: string) => { moderatorApi.updateUser(Number(id), { status: 'blocked' }).catch(console.error); updateBuyerState(id, { status: 'blocked' }); };
  const unblockBuyer  = (id: string) => { moderatorApi.updateUser(Number(id), { status: 'active' }).catch(console.error); updateBuyerState(id, { status: 'active' }); };
  const addBuyerBonus = (id: string) => { const n = Number(buyerBonusInput); if (!n) return; moderatorApi.updateUser(Number(id), { bonus_points: n }).catch(console.error); updateBuyerState(id, { bonusPoints: (buyers.find(u=>u.id===id)?.bonusPoints||0)+n }); setBuyerBonusInput(''); setShowBuyerBonusModal(false); };

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
            { key: 'overview',  label: 'Обзор',        emoji: '📊' },
            { key: 'leads',     label: 'Заявки',        emoji: '📋' },
            { key: 'products',  label: 'Товары',        emoji: '📦' },
            { key: 'shops',     label: 'Магазины',      emoji: '🏪' },
            { key: 'buyers',    label: 'Покупатели',    emoji: '👥' },
            { key: 'content',   label: 'Контент сайта', emoji: '🎨' },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all relative ${
                tab === t.key ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-white border-2 border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              <span>{t.emoji}</span>{t.label}
              {t.key === 'leads' && newLeadsCount > 0 && (
                <span className={`ml-1 min-w-[18px] h-[18px] px-0.5 rounded-full text-[10px] font-black flex items-center justify-center ${tab === 'leads' ? 'bg-white text-primary' : 'bg-red-500 text-white'}`}>
                  {newLeadsCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <AdminOverviewTab
            shops={shops}
            buyers={buyers}
            onOpenShop={openShop}
            onGoToShopsTab={() => setTab('shops')}
          />
        )}

        {tab === 'shops' && (
          <AdminShopsTab
            shops={shops}
            selectedShop={selectedShop}
            shopTab={shopTab}
            shopFilter={shopFilter}
            shopSearch={shopSearch}
            rejectReason={rejectReason}
            showRejectModal={showRejectModal}
            bonusInput={bonusInput}
            showBonusModal={showBonusModal}
            editBannerTitle={editBannerTitle}
            editBannerSubtitle={editBannerSubtitle}
            editBannerUrl={editBannerUrl}
            editLogoUrl={editLogoUrl}
            editDesc={editDesc}
            contentSaved={contentSaved}
            onSelectShop={openShop}
            onSetShopTab={setShopTab}
            onSetShopFilter={setShopFilter}
            onSetShopSearch={setShopSearch}
            onApprove={approveShop}
            onReject={rejectShop}
            onBlock={blockShop}
            onUnblock={unblockShop}
            onSetRejectReason={setRejectReason}
            onSetShowRejectModal={setShowRejectModal}
            onSetBonusInput={setBonusInput}
            onSetShowBonusModal={setShowBonusModal}
            onAddShopBonus={addShopBonus}
            onSetEditBannerTitle={setEditBannerTitle}
            onSetEditBannerSubtitle={setEditBannerSubtitle}
            onSetEditBannerUrl={setEditBannerUrl}
            onSetEditLogoUrl={setEditLogoUrl}
            onSetEditDesc={setEditDesc}
            onSaveContent={saveContent}
          />
        )}

        {tab === 'buyers' && (
          <AdminBuyersTab
            buyers={buyers}
            selectedBuyer={selectedBuyer}
            buyerFilter={buyerFilter}
            buyerSearch={buyerSearch}
            buyerBonusInput={buyerBonusInput}
            showBuyerBonusModal={showBuyerBonusModal}
            onSelectBuyer={setSelectedBuyer}
            onSetBuyerFilter={setBuyerFilter}
            onSetBuyerSearch={setBuyerSearch}
            onBlockBuyer={blockBuyer}
            onUnblockBuyer={unblockBuyer}
            onSetBuyerBonusInput={setBuyerBonusInput}
            onSetShowBuyerBonusModal={setShowBuyerBonusModal}
            onAddBuyerBonus={addBuyerBonus}
          />
        )}

        {tab === 'leads' && <AdminLeadsTab />}

        {tab === 'products' && <AdminProductsTab />}

        {tab === 'content' && <AdminContentTab />}
      </div>
    </div>
  );
}