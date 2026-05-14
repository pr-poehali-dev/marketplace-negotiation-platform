import Icon from '@/components/ui/icon';
import { MOCK_SALES, SellerProfile, Sale } from '@/data/auth';

const STATUS_MAP = {
  pending:  { label: 'На проверке',  cls: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  approved: { label: 'Одобрен',      cls: 'bg-green-100 text-green-700 border-green-300'    },
  rejected: { label: 'Отклонён',     cls: 'bg-red-100 text-red-700 border-red-300'          },
  blocked:  { label: 'Заблокирован', cls: 'bg-gray-100 text-gray-700 border-gray-300'       },
};

const SALE_STATUS = {
  completed:  { label: 'Завершена',  cls: 'bg-green-100 text-green-700'  },
  cancelled:  { label: 'Отменена',   cls: 'bg-red-100 text-red-700'      },
  processing: { label: 'В процессе', cls: 'bg-yellow-100 text-yellow-700' },
};

const DOC_ICONS: Record<string, string> = { inn: '📄', ogrn: '📋', passport: '🪪', license: '📜', other: '📎' };

interface AdminShopsTabProps {
  shops: SellerProfile[];
  selectedShop: SellerProfile | null;
  shopTab: 'info' | 'docs' | 'sales' | 'content';
  shopFilter: 'all' | 'pending' | 'approved' | 'rejected' | 'blocked';
  shopSearch: string;
  rejectReason: string;
  showRejectModal: boolean;
  bonusInput: string;
  showBonusModal: boolean;
  editBannerTitle: string;
  editBannerSubtitle: string;
  editBannerUrl: string;
  editLogoUrl: string;
  editDesc: string;
  contentSaved: boolean;

  onSelectShop: (shop: SellerProfile) => void;
  onSetShopTab: (t: 'info' | 'docs' | 'sales' | 'content') => void;
  onSetShopFilter: (f: 'all' | 'pending' | 'approved' | 'rejected' | 'blocked') => void;
  onSetShopSearch: (v: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onBlock: (id: string) => void;
  onUnblock: (id: string) => void;
  onSetRejectReason: (v: string) => void;
  onSetShowRejectModal: (v: boolean) => void;
  onSetBonusInput: (v: string) => void;
  onSetShowBonusModal: (v: boolean) => void;
  onAddShopBonus: (id: string) => void;
  onSetEditBannerTitle: (v: string) => void;
  onSetEditBannerSubtitle: (v: string) => void;
  onSetEditBannerUrl: (v: string) => void;
  onSetEditLogoUrl: (v: string) => void;
  onSetEditDesc: (v: string) => void;
  onSaveContent: (id: string) => void;
}

export default function AdminShopsTab({
  shops, selectedShop, shopTab, shopFilter, shopSearch,
  rejectReason, showRejectModal, bonusInput, showBonusModal,
  editBannerTitle, editBannerSubtitle, editBannerUrl, editLogoUrl, editDesc, contentSaved,
  onSelectShop, onSetShopTab, onSetShopFilter, onSetShopSearch,
  onApprove, onReject, onBlock, onUnblock,
  onSetRejectReason, onSetShowRejectModal,
  onSetBonusInput, onSetShowBonusModal, onAddShopBonus,
  onSetEditBannerTitle, onSetEditBannerSubtitle, onSetEditBannerUrl, onSetEditLogoUrl, onSetEditDesc, onSaveContent,
}: AdminShopsTabProps) {

  const filteredShops = shops.filter(s => {
    const fm = shopFilter === 'all' || s.status === shopFilter;
    const sm = !shopSearch || s.shopName.toLowerCase().includes(shopSearch.toLowerCase()) || s.sellerCode.toLowerCase().includes(shopSearch.toLowerCase());
    return fm && sm;
  });

  const shopSales = (shopId: string): Sale[] => MOCK_SALES.filter(s => s.shopId === shopId);

  return (
    <>
      <div className="animate-fade-in grid lg:grid-cols-5 gap-5">
        {/* left: list */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={shopSearch} onChange={e => onSetShopSearch(e.target.value)} placeholder="Поиск..." className="w-full pl-8 pr-3 py-2.5 bg-white border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
            </div>
            <select value={shopFilter} onChange={e => onSetShopFilter(e.target.value as typeof shopFilter)} className="px-3 py-2.5 bg-white border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary cursor-pointer">
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
              <button key={shop.id} onClick={() => onSelectShop(shop)}
                className={`w-full text-left p-4 bg-white border-2 rounded-2xl transition-all hover:border-primary/50 ${selectedShop?.id === shop.id ? 'border-primary shadow-md shadow-primary/10' : 'border-border'}`}
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
          {filteredShops.length === 0 && (
            <div className="text-center py-10 text-muted-foreground"><span className="text-4xl block mb-2">🔍</span><p className="text-sm">Не найдено</p></div>
          )}
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
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${(STATUS_MAP[selectedShop.status as keyof typeof STATUS_MAP] || STATUS_MAP.pending).cls}`}>
                      {(STATUS_MAP[selectedShop.status as keyof typeof STATUS_MAP] || STATUS_MAP.pending).label}
                    </span>
                  </div>
                </div>
                {/* quick actions */}
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  {selectedShop.status === 'pending' && <>
                    <button onClick={() => onApprove(selectedShop.id)} className="px-3 py-1.5 bg-green-600 text-white rounded-xl text-xs font-black hover:bg-green-700 transition-colors">✓ Одобрить</button>
                    <button onClick={() => onSetShowRejectModal(true)} className="px-3 py-1.5 bg-red-500 text-white rounded-xl text-xs font-black hover:bg-red-600 transition-colors">✗ Отклонить</button>
                  </>}
                  {selectedShop.status === 'approved' && <button onClick={() => onBlock(selectedShop.id)} className="px-3 py-1.5 bg-gray-600 text-white rounded-xl text-xs font-black hover:bg-gray-700 transition-colors">🚫 Заблокировать</button>}
                  {selectedShop.status === 'blocked'  && <button onClick={() => onUnblock(selectedShop.id)} className="px-3 py-1.5 bg-green-600 text-white rounded-xl text-xs font-black hover:bg-green-700 transition-colors">✓ Разблокировать</button>}
                  <button onClick={() => onSetShowBonusModal(true)} className="px-3 py-1.5 bg-orange-400 text-white rounded-xl text-xs font-black hover:bg-orange-500 transition-colors">🎁 Бонусы</button>
                </div>
              </div>

              {/* inner tabs */}
              <div className="flex border-b-2 border-border overflow-x-auto">
                {([
                  { key: 'info',    label: 'Информация' },
                  { key: 'docs',    label: 'Документы' },
                  { key: 'sales',   label: `Продажи (${shopSales(selectedShop.id).length})` },
                  { key: 'content', label: 'Контент' },
                ] as const).map(t => (
                  <button key={t.key} onClick={() => onSetShopTab(t.key)}
                    className={`px-5 py-3 text-sm font-bold border-b-2 flex-shrink-0 transition-colors ${shopTab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                  >{t.label}</button>
                ))}
              </div>

              <div className="p-5 max-h-[60vh] overflow-y-auto">
                {/* INFO */}
                {shopTab === 'info' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { l: 'Город',     v: selectedShop.city },
                        { l: 'Адрес',     v: selectedShop.address },
                        { l: 'Телефон',   v: selectedShop.phone },
                        { l: 'Дата рег.', v: selectedShop.createdAt },
                        { l: 'Продаж',    v: String(selectedShop.totalSales) },
                        { l: 'Выручка',   v: `${selectedShop.totalRevenue.toLocaleString('ru')} ₽` },
                        { l: 'Товаров',   v: String(selectedShop.productsCount) },
                        { l: 'Бонусы',    v: String(selectedShop.bonusPoints) },
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
                      <div key={doc.id} className={`flex items-center gap-3 p-4 rounded-2xl border-2 ${doc.status === 'approved' ? 'border-green-200 bg-green-50' : doc.status === 'rejected' ? 'border-red-200 bg-red-50' : 'border-border bg-white'}`}>
                        <span className="text-2xl">{DOC_ICONS[doc.type] || '📎'}</span>
                        <div className="flex-1">
                          <div className="font-bold text-sm">{doc.name}</div>
                          <div className="text-xs text-muted-foreground">{doc.fileName} · {doc.uploadedAt}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="text-xs text-primary hover:underline flex items-center gap-1"><Icon name="Eye" size={12} />Просмотр</button>
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
                        <div className="text-lg font-black text-green-700">{shopSales(selectedShop.id).filter(s => s.status === 'completed').length}</div>
                        <div className="text-xs text-muted-foreground">Завершено</div>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
                        <div className="text-lg font-black text-yellow-700">{shopSales(selectedShop.id).filter(s => s.status === 'processing').length}</div>
                        <div className="text-xs text-muted-foreground">В процессе</div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                        <div className="text-lg font-black text-red-700">{shopSales(selectedShop.id).filter(s => s.status === 'cancelled').length}</div>
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
                      <input value={editBannerTitle} onChange={e => onSetEditBannerTitle(e.target.value)} placeholder={selectedShop.bannerTitle || 'Заголовок баннера'} className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Баннер — подзаголовок</label>
                      <input value={editBannerSubtitle} onChange={e => onSetEditBannerSubtitle(e.target.value)} placeholder={selectedShop.bannerSubtitle || 'Подзаголовок баннера'} className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Картинка баннера (URL)</label>
                      <input value={editBannerUrl} onChange={e => onSetEditBannerUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
                      <div className="mt-2 text-xs text-muted-foreground">или загрузить файл:</div>
                      <label className="mt-1 flex items-center gap-2 cursor-pointer">
                        <div className="px-3 py-2 border-2 border-dashed border-border rounded-xl text-xs text-muted-foreground hover:border-primary transition-colors flex items-center gap-2">
                          <Icon name="Upload" size={13} /> Выбрать изображение
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) onSetEditBannerUrl(URL.createObjectURL(e.target.files[0])); }} />
                      </label>
                      {editBannerUrl && editBannerUrl.startsWith('blob:') && (
                        <img src={editBannerUrl} alt="preview" className="mt-2 h-24 w-full object-cover rounded-xl border" />
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Логотип магазина (URL или файл)</label>
                      <input value={editLogoUrl} onChange={e => onSetEditLogoUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
                      <label className="mt-2 flex items-center gap-2 cursor-pointer">
                        <div className="px-3 py-2 border-2 border-dashed border-border rounded-xl text-xs text-muted-foreground hover:border-primary transition-colors flex items-center gap-2">
                          <Icon name="Upload" size={13} /> Загрузить логотип
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) onSetEditLogoUrl(URL.createObjectURL(e.target.files[0])); }} />
                      </label>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Описание магазина</label>
                      <textarea value={editDesc} onChange={e => onSetEditDesc(e.target.value)} rows={3} placeholder={selectedShop.shopDescription} className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors resize-none" />
                    </div>
                    <button onClick={() => onSaveContent(selectedShop.id)} className={`w-full py-3 rounded-xl font-black text-sm transition-all ${contentSaved ? 'bg-green-600 text-white' : 'bg-primary text-white hover:opacity-90 shadow-md shadow-primary/30'}`}>
                      {contentSaved ? '✓ Сохранено!' : 'Сохранить изменения'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Reject */}
      {showRejectModal && selectedShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onSetShowRejectModal(false)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-md animate-scale-in shadow-2xl">
            <h3 className="text-lg font-black mb-2">Причина отклонения</h3>
            <p className="text-sm text-muted-foreground mb-4">Продавец увидит причину и сможет исправить документы.</p>
            <textarea value={rejectReason} onChange={e => onSetRejectReason(e.target.value)} rows={3} placeholder="Например: ИНН не читается..." className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary resize-none mb-4" autoFocus />
            <div className="flex gap-3">
              <button onClick={() => onSetShowRejectModal(false)} className="flex-1 py-3 border-2 border-border rounded-xl font-bold text-sm">Отмена</button>
              <button onClick={() => onReject(selectedShop.id)} disabled={!rejectReason.trim()} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black text-sm hover:bg-red-600 disabled:opacity-50">Отклонить</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Bonus shop */}
      {showBonusModal && selectedShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onSetShowBonusModal(false)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-sm animate-scale-in shadow-2xl">
            <h3 className="text-lg font-black mb-1">🎁 Бонусы магазину</h3>
            <p className="text-sm text-muted-foreground mb-1">Магазин: <span className="font-bold">{selectedShop.shopName}</span></p>
            <p className="text-sm text-muted-foreground mb-4">Текущий баланс: <span className="font-bold text-primary">{selectedShop.bonusPoints} баллов</span></p>
            <input type="number" value={bonusInput} onChange={e => onSetBonusInput(e.target.value)} placeholder="Количество баллов" className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary mb-4" autoFocus />
            <div className="flex gap-3">
              <button onClick={() => onSetShowBonusModal(false)} className="flex-1 py-3 border-2 border-border rounded-xl font-bold text-sm">Отмена</button>
              <button onClick={() => onAddShopBonus(selectedShop.id)} disabled={!bonusInput} className="flex-1 py-3 bg-orange-400 text-white rounded-xl font-black text-sm hover:bg-orange-500 disabled:opacity-50">Начислить</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
