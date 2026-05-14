import Icon from '@/components/ui/icon';
import { User } from '@/data/auth';

interface AdminBuyersTabProps {
  buyers: User[];
  selectedBuyer: User | null;
  buyerFilter: 'all' | 'active' | 'blocked';
  buyerSearch: string;
  buyerBonusInput: string;
  showBuyerBonusModal: boolean;

  onSelectBuyer: (u: User) => void;
  onSetBuyerFilter: (f: 'all' | 'active' | 'blocked') => void;
  onSetBuyerSearch: (v: string) => void;
  onBlockBuyer: (id: string) => void;
  onUnblockBuyer: (id: string) => void;
  onSetBuyerBonusInput: (v: string) => void;
  onSetShowBuyerBonusModal: (v: boolean) => void;
  onAddBuyerBonus: (id: string) => void;
}

export default function AdminBuyersTab({
  buyers, selectedBuyer, buyerFilter, buyerSearch,
  buyerBonusInput, showBuyerBonusModal,
  onSelectBuyer, onSetBuyerFilter, onSetBuyerSearch,
  onBlockBuyer, onUnblockBuyer,
  onSetBuyerBonusInput, onSetShowBuyerBonusModal, onAddBuyerBonus,
}: AdminBuyersTabProps) {

  const filteredBuyers = buyers.filter(u => {
    const roles = buyerFilter === 'all' ? true : u.status === buyerFilter;
    const sm = !buyerSearch || u.name.toLowerCase().includes(buyerSearch.toLowerCase()) || u.phone.includes(buyerSearch) || u.buyerCode.toLowerCase().includes(buyerSearch.toLowerCase());
    return roles && sm && u.role !== 'moderator';
  });

  return (
    <>
      <div className="animate-fade-in grid lg:grid-cols-5 gap-5">
        {/* list */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={buyerSearch} onChange={e => onSetBuyerSearch(e.target.value)} placeholder="Имя, телефон, код..." className="w-full pl-8 pr-3 py-2.5 bg-white border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
            </div>
            <select value={buyerFilter} onChange={e => onSetBuyerFilter(e.target.value as typeof buyerFilter)} className="px-3 py-2.5 bg-white border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary cursor-pointer">
              <option value="all">Все</option>
              <option value="active">Активные</option>
              <option value="blocked">Заблокированные</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { l: 'Всего',    v: buyers.filter(u => u.role !== 'moderator').length,                              cls: 'bg-white'    },
              { l: 'Активных', v: buyers.filter(u => u.status === 'active' && u.role !== 'moderator').length,    cls: 'bg-green-50' },
              { l: 'Заблок.',  v: buyers.filter(u => u.status === 'blocked').length,                             cls: 'bg-red-50'   },
            ].map(s => (
              <div key={s.l} className={`${s.cls} border-2 border-border rounded-xl p-3`}>
                <div className="font-black text-lg">{s.v}</div>
                <div className="text-xs text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
          {filteredBuyers.map(u => (
            <button key={u.id} onClick={() => onSelectBuyer(u)}
              className={`w-full text-left p-4 bg-white border-2 rounded-2xl transition-all hover:border-primary/50 ${selectedBuyer?.id === u.id ? 'border-primary shadow-md shadow-primary/10' : 'border-border'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${u.status === 'blocked' ? 'bg-gray-300 text-gray-600' : 'bg-primary text-white'}`}>{u.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm truncate">{u.name}</span>
                    {u.status === 'blocked' && <span className="text-xs font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full">🚫</span>}
                    {u.role === 'seller' && <span className="text-xs font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-full">продавец</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{u.phone} · {u.buyerCode}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">🎁 {u.bonusPoints} · {u.ordersCount} заказов</p>
                </div>
              </div>
            </button>
          ))}
          {filteredBuyers.length === 0 && (
            <div className="text-center py-10 text-muted-foreground"><span className="text-4xl block mb-2">🔍</span><p className="text-sm">Не найдено</p></div>
          )}
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
              <div className="p-5 border-b-2 border-border flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black ${selectedBuyer.status === 'blocked' ? 'bg-gray-300 text-gray-600' : 'bg-primary text-white'}`}>{selectedBuyer.avatar}</div>
                <div className="flex-1">
                  <h2 className="text-xl font-black">{selectedBuyer.name}</h2>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold">{selectedBuyer.buyerCode}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${selectedBuyer.status === 'blocked' ? 'bg-red-100 text-red-700 border-red-300' : 'bg-green-100 text-green-700 border-green-300'}`}>
                      {selectedBuyer.status === 'blocked' ? '🚫 Заблокирован' : '✅ Активен'}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${selectedBuyer.role === 'seller' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {selectedBuyer.role === 'seller' ? 'Продавец' : 'Покупатель'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { l: 'Телефон',          v: selectedBuyer.phone },
                    { l: 'Зарегистрирован',  v: selectedBuyer.createdAt },
                    { l: 'Заказов',          v: String(selectedBuyer.ordersCount) },
                    { l: 'Потрачено',        v: `${selectedBuyer.totalSpent.toLocaleString('ru')} ₽` },
                    { l: 'Бонусов',          v: String(selectedBuyer.bonusPoints) },
                    { l: 'Роль',             v: selectedBuyer.role === 'seller' ? 'Продавец' : selectedBuyer.role === 'moderator' ? 'Модератор' : 'Покупатель' },
                  ].map(f => (
                    <div key={f.l} className="bg-secondary rounded-xl p-3">
                      <div className="text-xs text-muted-foreground mb-0.5">{f.l}</div>
                      <div className="text-sm font-bold">{f.v}</div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  {selectedBuyer.status === 'active' ? (
                    <button onClick={() => onBlockBuyer(selectedBuyer.id)} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                      <Icon name="Ban" size={15} /> Заблокировать
                    </button>
                  ) : (
                    <button onClick={() => onUnblockBuyer(selectedBuyer.id)} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-black text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                      <Icon name="CheckCircle" size={15} /> Разблокировать
                    </button>
                  )}
                  <button onClick={() => onSetShowBuyerBonusModal(true)} className="flex-1 py-3 bg-orange-400 text-white rounded-xl font-black text-sm hover:bg-orange-500 transition-colors flex items-center justify-center gap-2">
                    🎁 Начислить бонусы
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Bonus buyer */}
      {showBuyerBonusModal && selectedBuyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onSetShowBuyerBonusModal(false)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-sm animate-scale-in shadow-2xl">
            <h3 className="text-lg font-black mb-1">🎁 Бонусы покупателю</h3>
            <p className="text-sm text-muted-foreground mb-1">Пользователь: <span className="font-bold">{selectedBuyer.name}</span></p>
            <p className="text-sm text-muted-foreground mb-4">Текущий баланс: <span className="font-bold text-primary">{selectedBuyer.bonusPoints} баллов</span></p>
            <input type="number" value={buyerBonusInput} onChange={e => onSetBuyerBonusInput(e.target.value)} placeholder="Количество баллов" className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary mb-4" autoFocus />
            <div className="flex gap-3">
              <button onClick={() => onSetShowBuyerBonusModal(false)} className="flex-1 py-3 border-2 border-border rounded-xl font-bold text-sm">Отмена</button>
              <button onClick={() => onAddBuyerBonus(selectedBuyer.id)} disabled={!buyerBonusInput} className="flex-1 py-3 bg-orange-400 text-white rounded-xl font-black text-sm hover:bg-orange-500 disabled:opacity-50">Начислить</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
