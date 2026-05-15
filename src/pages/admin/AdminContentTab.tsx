import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { useBanner } from '@/context/BannerContext';

const GRADIENT_PRESETS = [
  { label: 'Оранжево-фиолетовый', value: 'linear-gradient(135deg, hsl(24,95%,53%) 0%, hsl(330,85%,60%) 50%, hsl(271,76%,60%) 100%)' },
  { label: 'Синий-фиолетовый',    value: 'linear-gradient(135deg, hsl(211,95%,55%) 0%, hsl(271,76%,60%) 100%)' },
  { label: 'Зелёный-бирюзовый',   value: 'linear-gradient(135deg, hsl(142,72%,45%) 0%, hsl(174,80%,40%) 100%)' },
  { label: 'Розово-красный',      value: 'linear-gradient(135deg, hsl(330,85%,60%) 0%, hsl(0,84%,60%) 100%)' },
  { label: 'Тёмно-синий',        value: 'linear-gradient(135deg, hsl(220,80%,40%) 0%, hsl(240,60%,30%) 100%)' },
];

export default function AdminContentTab() {
  const { banner, updateBanner, resetBanner } = useBanner();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="animate-fade-in max-w-3xl space-y-5">
      {/* Hero-баннер */}
      <div className="bg-white border-2 border-border rounded-2xl p-5">
        <h3 className="font-black mb-1 flex items-center gap-2"><span>🏠</span> Hero-баннер главной страницы</h3>
        <p className="text-xs text-muted-foreground mb-4">Изменения применяются мгновенно — посетители увидят их сразу</p>

        {/* Preview */}
        <div className="rounded-2xl overflow-hidden mb-5 relative" style={{ background: banner.gradient, minHeight: 120 }}>
          <div className="absolute top-4 right-6 w-16 h-16 bg-white/10 rounded-full" />
          <div className="relative z-10 px-6 py-5">
            <span className="inline-flex bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2 backdrop-blur-sm">{banner.badge}</span>
            <div className="text-white font-black text-lg leading-tight mb-1" style={{ whiteSpace: 'pre-line' }}>{banner.title}</div>
            <div className="text-white/80 text-xs mb-3" style={{ whiteSpace: 'pre-line' }}>{banner.subtitle}</div>
            <div className="flex gap-2">
              <span className="px-4 py-1.5 bg-white text-primary rounded-lg text-xs font-black">{banner.btnPrimary}</span>
              <span className="px-4 py-1.5 bg-white/20 text-white rounded-lg text-xs font-bold">{banner.btnSecondary}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Значок-бейдж</label>
            <input value={banner.badge} onChange={e => updateBanner({ badge: e.target.value })} className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Заголовок</label>
            <textarea value={banner.title} onChange={e => updateBanner({ title: e.target.value })} rows={2} className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors resize-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Подзаголовок</label>
            <textarea value={banner.subtitle} onChange={e => updateBanner({ subtitle: e.target.value })} rows={2} className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Кнопка 1 (основная)</label>
              <input value={banner.btnPrimary} onChange={e => updateBanner({ btnPrimary: e.target.value })} className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Кнопка 2 (вторичная)</label>
              <input value={banner.btnSecondary} onChange={e => updateBanner({ btnSecondary: e.target.value })} className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Цвет фона</label>
            <div className="grid grid-cols-1 gap-2">
              {GRADIENT_PRESETS.map(p => (
                <button
                  key={p.value}
                  onClick={() => updateBanner({ gradient: p.value })}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border-2 transition-colors text-left ${banner.gradient === p.value ? 'border-primary' : 'border-border hover:border-primary/50'}`}
                >
                  <div className="w-10 h-6 rounded-lg flex-shrink-0" style={{ background: p.value }} />
                  <span className="text-xs font-semibold">{p.label}</span>
                  {banner.gradient === p.value && <Icon name="Check" size={14} className="ml-auto text-primary" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={resetBanner} className="flex-1 py-2.5 border-2 border-border rounded-xl text-sm font-bold text-muted-foreground hover:border-foreground/30 transition-colors">
            Сбросить
          </button>
          <button onClick={handleSave} className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all ${saved ? 'bg-green-600 text-white' : 'bg-primary text-white hover:opacity-90 shadow-md shadow-primary/30'}`}>
            {saved ? '✓ Сохранено!' : 'Сохранить'}
          </button>
        </div>
      </div>

      {/* Баннеры и акции */}
      <div className="bg-white border-2 border-border rounded-2xl p-5">
        <h3 className="font-black mb-4 flex items-center gap-2"><span>📢</span> Баннеры и акции</h3>
        <div className="space-y-3">
          {[
            { title: 'Баннер «Торг»',      subtitle: 'Механика торга',           active: true  },
            { title: 'Баннер «Бесплатно»', subtitle: 'О бесплатности платформы', active: true  },
            { title: 'Новый баннер акции', subtitle: 'Не активен',               active: false },
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

      {/* Медиатека */}
      <div className="bg-white border-2 border-border rounded-2xl p-5">
        <h3 className="font-black mb-4 flex items-center gap-2"><span>📸</span> Медиатека сайта</h3>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="aspect-video bg-secondary rounded-xl border-2 border-border overflow-hidden relative group cursor-pointer hover:border-primary transition-colors">
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40 text-xs">Изображение {i}</div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button className="p-1.5 bg-white rounded-lg"><Icon name="Eye" size={12} /></button>
                <button className="p-1.5 bg-white rounded-lg"><Icon name="Trash2" size={12} /></button>
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
    </div>
  );
}
