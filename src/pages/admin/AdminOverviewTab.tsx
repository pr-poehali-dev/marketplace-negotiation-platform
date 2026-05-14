import Icon from '@/components/ui/icon';
import { MOCK_SALES, SellerProfile, User } from '@/data/auth';

const SALE_STATUS = {
  completed:  { label: 'Завершена',  cls: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Отменена',   cls: 'bg-red-100 text-red-700'     },
  processing: { label: 'В процессе', cls: 'bg-yellow-100 text-yellow-700'},
};

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

interface AdminOverviewTabProps {
  shops: SellerProfile[];
  buyers: User[];
  onOpenShop: (shop: SellerProfile) => void;
  onGoToShopsTab: () => void;
}

export default function AdminOverviewTab({ shops, buyers, onOpenShop, onGoToShopsTab }: AdminOverviewTabProps) {
  const totalRevenue = shops.reduce((a, s) => a + s.totalRevenue, 0);
  const totalSales   = MOCK_SALES.length;
  const buyers_only  = buyers.filter(u => u.role !== 'moderator' && u.role !== 'seller');

  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard emoji="🏪" label="Магазинов"   value={String(shops.filter(s => s.status === 'approved').length)} sub={`${shops.filter(s => s.status === 'pending').length} на проверке`} />
        <StatCard emoji="👥" label="Покупателей" value={String(buyers_only.length)} sub={`${buyers_only.filter(u => u.status === 'blocked').length} заблокировано`} />
        <StatCard emoji="🤝" label="Продаж"      value={String(totalSales)} sub="за всё время" />
        <StatCard emoji="💰" label="Оборот"      value={`${(totalRevenue / 1000000).toFixed(1)} млн ₽`} sub="суммарно" />
      </div>

      <div className="bg-white border-2 border-border rounded-2xl p-5">
        <h3 className="font-black mb-4 flex items-center gap-2"><span>📋</span> Последние продажи</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wide">
                <th className="text-left pb-3 pr-4">Товар</th>
                <th className="text-left pb-3 pr-4">Магазин</th>
                <th className="text-left pb-3 pr-4">Покупатель</th>
                <th className="text-left pb-3 pr-4">Сумма</th>
                <th className="text-left pb-3">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_SALES.slice(0, 6).map(sale => {
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
          {shops.filter(s => s.status === 'pending').length === 0
            ? <p className="text-sm text-muted-foreground">Нет новых заявок</p>
            : shops.filter(s => s.status === 'pending').map(s => (
              <button key={s.id} onClick={() => { onGoToShopsTab(); onOpenShop(s); }}
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
          {buyers.filter(u => u.status === 'blocked').length === 0
            ? <p className="text-sm text-muted-foreground">Нет заблокированных</p>
            : buyers.filter(u => u.status === 'blocked').map(u => (
              <div key={u.id} className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl mb-2">
                <div className="w-8 h-8 bg-red-400 text-white rounded-lg flex items-center justify-center text-xs font-black">{u.avatar}</div>
                <div><div className="font-bold text-sm">{u.name}</div><div className="text-xs text-muted-foreground">{u.phone}</div></div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
