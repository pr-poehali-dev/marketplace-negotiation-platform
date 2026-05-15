import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/context/AuthContext';
import { MOCK_SELLER_PROFILES, MOCK_USERS, SellerProfile, User } from '@/data/auth';
import AdminOverviewTab from '@/pages/admin/AdminOverviewTab';
import AdminShopsTab from '@/pages/admin/AdminShopsTab';
import AdminBuyersTab from '@/pages/admin/AdminBuyersTab';
import AdminContentTab from '@/pages/admin/AdminContentTab';
import AdminLeadsTab from '@/pages/admin/AdminLeadsTab';
import { useLeads } from '@/context/LeadsContext';

interface AdminPageProps {
  onNavigate: (page: string) => void;
}

type AdminTab = 'overview' | 'shops' | 'buyers' | 'content' | 'leads';

export default function AdminPage({ onNavigate }: AdminPageProps) {
  const { user } = useAuth();
  const { leads } = useLeads();
  const newLeadsCount = leads.filter(l => l.status === 'new').length;
  const [tab, setTab] = useState<AdminTab>('overview');

  /* ─ shops state ─ */
  const [shops, setShops]               = useState<SellerProfile[]>(MOCK_SELLER_PROFILES);
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
  const [buyers, setBuyers]               = useState<User[]>(MOCK_USERS);
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
  const approveShop  = (id: string) => { setShops(p => p.map(s => s.id === id ? { ...s, status: 'approved' } : s)); setSelectedShop(p => p?.id === id ? { ...p, status: 'approved' } : p); };
  const rejectShop   = (id: string) => { if (!rejectReason.trim()) return; setShops(p => p.map(s => s.id === id ? { ...s, status: 'rejected', rejectionReason: rejectReason } : s)); setSelectedShop(p => p?.id === id ? { ...p, status: 'rejected', rejectionReason: rejectReason } : p); setRejectReason(''); setShowRejectModal(false); };
  const blockShop    = (id: string) => { setShops(p => p.map(s => s.id === id ? { ...s, status: 'blocked' } : s)); setSelectedShop(p => p?.id === id ? { ...p, status: 'blocked' } : p); };
  const unblockShop  = (id: string) => { setShops(p => p.map(s => s.id === id ? { ...s, status: 'approved' } : s)); setSelectedShop(p => p?.id === id ? { ...p, status: 'approved' } : p); };
  const addShopBonus = (id: string) => { const n = Number(bonusInput); if (!n) return; setShops(p => p.map(s => s.id === id ? { ...s, bonusPoints: s.bonusPoints + n } : s)); setSelectedShop(p => p?.id === id ? { ...p, bonusPoints: (p.bonusPoints || 0) + n } : p); setBonusInput(''); setShowBonusModal(false); };

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
  const blockBuyer    = (id: string) => { setBuyers(p => p.map(u => u.id === id ? { ...u, status: 'blocked' } : u)); setSelectedBuyer(p => p?.id === id ? { ...p, status: 'blocked' } : p); };
  const unblockBuyer  = (id: string) => { setBuyers(p => p.map(u => u.id === id ? { ...u, status: 'active' } : u)); setSelectedBuyer(p => p?.id === id ? { ...p, status: 'active' } : p); };
  const addBuyerBonus = (id: string) => { const n = Number(buyerBonusInput); if (!n) return; setBuyers(p => p.map(u => u.id === id ? { ...u, bonusPoints: u.bonusPoints + n } : u)); setSelectedBuyer(p => p?.id === id ? { ...p, bonusPoints: (p.bonusPoints || 0) + n } : p); setBuyerBonusInput(''); setShowBuyerBonusModal(false); };

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
            { key: 'overview', label: 'Обзор',        emoji: '📊' },
            { key: 'leads',    label: 'Заявки',        emoji: '📋' },
            { key: 'shops',    label: 'Магазины',      emoji: '🏪' },
            { key: 'buyers',   label: 'Покупатели',    emoji: '👥' },
            { key: 'content',  label: 'Контент сайта', emoji: '🎨' },
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

        {tab === 'content' && <AdminContentTab />}
      </div>
    </div>
  );
}