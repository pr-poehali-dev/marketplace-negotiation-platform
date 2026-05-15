import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { useLeads, Lead, LeadStatus } from '@/context/LeadsContext';

const STATUS_MAP: Record<LeadStatus, { label: string; cls: string }> = {
  new:         { label: '🆕 Новая',      cls: 'bg-blue-100 text-blue-700 border-blue-300'   },
  in_progress: { label: '⏳ В работе',   cls: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  done:        { label: '✅ Выполнена',  cls: 'bg-green-100 text-green-700 border-green-300'  },
};

const TYPE_MAP = {
  buyer:  { label: 'Покупатель', cls: 'bg-blue-50 text-blue-700',   emoji: '🛍️' },
  seller: { label: 'Продавец',   cls: 'bg-purple-50 text-purple-700', emoji: '🏪' },
};

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'только что';
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  return date.toLocaleDateString('ru', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function AdminLeadsTab() {
  const { leads, updateStatus, deleteLead } = useLeads();
  const [filter, setFilter] = useState<'all' | LeadStatus>('all');
  const [selected, setSelected] = useState<Lead | null>(null);
  const [search, setSearch] = useState('');

  const filtered = leads.filter(l => {
    const fm = filter === 'all' || l.status === filter;
    const sm = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search) || l.email.toLowerCase().includes(search.toLowerCase());
    return fm && sm;
  });

  const counts = {
    all: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    in_progress: leads.filter(l => l.status === 'in_progress').length,
    done: leads.filter(l => l.status === 'done').length,
  };

  return (
    <div className="animate-fade-in grid lg:grid-cols-5 gap-5">
      {/* Список */}
      <div className="lg:col-span-2 space-y-3">
        {/* Поиск */}
        <div className="relative">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Имя, телефон, email..."
            className="w-full pl-8 pr-3 py-2.5 bg-white border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Фильтры */}
        <div className="grid grid-cols-4 gap-1.5">
          {([
            { key: 'all',         label: 'Все',      count: counts.all         },
            { key: 'new',         label: 'Новые',    count: counts.new         },
            { key: 'in_progress', label: 'В работе', count: counts.in_progress },
            { key: 'done',        label: 'Готово',   count: counts.done        },
          ] as const).map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-2 py-2 rounded-xl text-xs font-bold transition-all text-center ${
                filter === f.key ? 'bg-primary text-white shadow-sm' : 'bg-white border-2 border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              <div className="text-base font-black">{f.count}</div>
              <div className="opacity-80">{f.label}</div>
            </button>
          ))}
        </div>

        {/* Карточки */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <span className="text-4xl block mb-2">{leads.length === 0 ? '📭' : '🔍'}</span>
            <p className="text-sm">{leads.length === 0 ? 'Заявок пока нет' : 'Не найдено'}</p>
          </div>
        ) : filtered.map(lead => (
          <button
            key={lead.id}
            onClick={() => setSelected(lead)}
            className={`w-full text-left p-4 bg-white border-2 rounded-2xl transition-all hover:border-primary/50 ${selected?.id === lead.id ? 'border-primary shadow-md shadow-primary/10' : 'border-border'}`}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-base">{TYPE_MAP[lead.type].emoji}</span>
                <span className="font-black text-sm">{lead.name}</span>
              </div>
              {lead.status === 'new' && (
                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">{lead.phone}</p>
            {lead.comment && <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">«{lead.comment}»</p>}
            <div className="flex items-center justify-between mt-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_MAP[lead.status].cls}`}>
                {STATUS_MAP[lead.status].label}
              </span>
              <span className="text-xs text-muted-foreground/60">{timeAgo(lead.createdAt)}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Детали */}
      <div className="lg:col-span-3">
        {!selected ? (
          <div className="bg-white border-2 border-border rounded-3xl p-12 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
            <span className="text-5xl block mb-3">👈</span>
            <p className="text-sm">Выберите заявку</p>
          </div>
        ) : (
          <div className="bg-white border-2 border-border rounded-3xl overflow-hidden animate-fade-in">
            {/* Шапка */}
            <div className="p-5 border-b-2 border-border flex items-start gap-4">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                {TYPE_MAP[selected.type].emoji}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-black">{selected.name}</h2>
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TYPE_MAP[selected.type].cls}`}>
                    {TYPE_MAP[selected.type].label}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_MAP[selected.status].cls}`}>
                    {STATUS_MAP[selected.status].label}
                  </span>
                  <span className="text-xs text-muted-foreground/60">{timeAgo(selected.createdAt)}</span>
                </div>
              </div>
              <button
                onClick={() => { deleteLead(selected.id); setSelected(null); }}
                className="p-2 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0"
                title="Удалить заявку"
              >
                <Icon name="Trash2" size={15} className="text-red-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Контакты */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary rounded-xl p-3">
                  <div className="text-xs text-muted-foreground mb-0.5">Телефон</div>
                  <a href={`tel:${selected.phone}`} className="text-sm font-bold text-primary hover:underline">{selected.phone}</a>
                </div>
                {selected.email ? (
                  <div className="bg-secondary rounded-xl p-3">
                    <div className="text-xs text-muted-foreground mb-0.5">Email</div>
                    <a href={`mailto:${selected.email}`} className="text-sm font-bold text-primary hover:underline truncate block">{selected.email}</a>
                  </div>
                ) : (
                  <div className="bg-secondary rounded-xl p-3">
                    <div className="text-xs text-muted-foreground mb-0.5">Email</div>
                    <div className="text-sm text-muted-foreground">—</div>
                  </div>
                )}
              </div>

              {/* Комментарий */}
              {selected.comment && (
                <div className="bg-secondary rounded-xl p-4">
                  <div className="text-xs text-muted-foreground mb-1">Комментарий</div>
                  <p className="text-sm leading-relaxed">{selected.comment}</p>
                </div>
              )}

              {/* Смена статуса */}
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Статус заявки</div>
                <div className="grid grid-cols-3 gap-2">
                  {(['new', 'in_progress', 'done'] as LeadStatus[]).map(s => (
                    <button
                      key={s}
                      onClick={() => { updateStatus(selected.id, s); setSelected(prev => prev ? { ...prev, status: s } : prev); }}
                      className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                        selected.status === s
                          ? `${STATUS_MAP[s].cls} shadow-sm`
                          : 'border-border text-muted-foreground hover:border-primary/40 bg-white'
                      }`}
                    >
                      {STATUS_MAP[s].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Быстрые действия */}
              <div className="flex gap-3 pt-2">
                <a
                  href={`tel:${selected.phone}`}
                  className="btn-3d flex-1 py-3 bg-green-600 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2"
                  style={{ '--btn-shadow': '142 72% 30%' } as React.CSSProperties}
                >
                  <Icon name="Phone" size={15} /> Позвонить
                </a>
                {selected.email && (
                  <a
                    href={`mailto:${selected.email}`}
                    className="btn-3d flex-1 py-3 bg-blue-600 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2"
                    style={{ '--btn-shadow': '211 95% 30%' } as React.CSSProperties}
                  >
                    <Icon name="Mail" size={15} /> Написать
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
