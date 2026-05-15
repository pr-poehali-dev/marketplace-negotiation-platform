import { useState, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { useBanner, HeroBanner } from '@/context/BannerContext';

const GRADIENT_PRESETS = [
  { label: 'Оранжево-фиолетовый', value: 'linear-gradient(135deg, hsl(24,95%,53%) 0%, hsl(330,85%,60%) 50%, hsl(271,76%,60%) 100%)' },
  { label: 'Синий-фиолетовый',    value: 'linear-gradient(135deg, hsl(211,95%,55%) 0%, hsl(271,76%,60%) 100%)' },
  { label: 'Зелёный-бирюзовый',   value: 'linear-gradient(135deg, hsl(142,72%,45%) 0%, hsl(174,80%,40%) 100%)' },
  { label: 'Розово-красный',      value: 'linear-gradient(135deg, hsl(330,85%,60%) 0%, hsl(0,84%,60%) 100%)' },
  { label: 'Тёмно-синий',        value: 'linear-gradient(135deg, hsl(220,80%,40%) 0%, hsl(240,60%,30%) 100%)' },
];

const EMPTY_BANNER: Omit<HeroBanner, 'id'> = {
  title: 'Новый баннер',
  subtitle: 'Описание баннера',
  badge: '🆕 Новинка',
  btnPrimary: 'Смотреть',
  btnSecondary: 'Подробнее',
  gradient: GRADIENT_PRESETS[0].value,
};

export default function AdminContentTab() {
  const { banners, addBanner, updateBanner, deleteBanner, resetBanners } = useBanner();
  const [selected, setSelected] = useState<string | null>(banners[0]?.id ?? null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const current = banners.find(b => b.id === selected) ?? banners[0];

  const patch = (field: keyof HeroBanner, value: string) => {
    if (!current) return;
    updateBanner(current.id, { [field]: value });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !current) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      updateBanner(current.id, { imageUrl: dataUrl });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !current) return;
    const reader = new FileReader();
    reader.onload = ev => updateBanner(current.id, { imageUrl: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  if (!current) return null;

  return (
    <div className="animate-fade-in space-y-5">
      {/* Список баннеров */}
      <div className="bg-white border-2 border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black flex items-center gap-2"><span>🖼️</span> Баннеры главной страницы</h3>
          <div className="flex gap-2">
            <button
              onClick={() => { addBanner(EMPTY_BANNER); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-xl text-xs font-bold"
            >
              <Icon name="Plus" size={12} /> Добавить
            </button>
            <button onClick={resetBanners} className="px-3 py-1.5 border-2 border-border rounded-xl text-xs font-bold text-muted-foreground hover:border-foreground/30">
              Сбросить
            </button>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          {banners.map((b, idx) => (
            <div
              key={b.id}
              onClick={() => setSelected(b.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selected === b.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
            >
              <div
                className="w-16 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold"
                style={{ background: b.gradient }}
              >
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{b.title.replace('\n', ' ')}</div>
                <div className="text-xs text-muted-foreground truncate">{b.badge}</div>
              </div>
              {selected === b.id && <Icon name="Check" size={14} className="text-primary flex-shrink-0" />}
              {banners.length > 1 && (
                <button
                  onClick={e => { e.stopPropagation(); deleteBanner(b.id); setSelected(banners.find(x => x.id !== b.id)?.id ?? null); }}
                  className="p-1 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Icon name="Trash2" size={12} className="text-red-400" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Preview */}
        <div
          className="rounded-xl overflow-hidden mb-5 relative"
          style={{ background: current.gradient, minHeight: 100, aspectRatio: '970/250' }}
        >
          {current.imageUrl && (
            <img src={current.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          )}
          <div className="absolute top-3 right-4 w-12 h-12 bg-white/10 rounded-full" />
          <div className="relative z-10 px-5 py-4">
            <span className="inline-flex bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 backdrop-blur-sm">{current.badge}</span>
            <div className="text-white font-black text-sm leading-tight mb-1" style={{ whiteSpace: 'pre-line' }}>{current.title}</div>
            <div className="text-white/80 text-[10px] mb-2" style={{ whiteSpace: 'pre-line' }}>{current.subtitle}</div>
            <div className="flex gap-1.5">
              <span className="px-3 py-1 bg-white text-primary rounded-lg text-[10px] font-black">{current.btnPrimary}</span>
              <span className="px-3 py-1 bg-white/20 text-white rounded-lg text-[10px] font-bold">{current.btnSecondary}</span>
            </div>
          </div>
        </div>

        {/* Image upload 970×250 */}
        <div className="mb-4">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">
            Фоновое изображение <span className="text-muted-foreground/60 font-normal normal-case">970 × 250 px</span>
          </label>
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-primary/30 rounded-xl p-4 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all"
          >
            {current.imageUrl ? (
              <div className="relative">
                <img src={current.imageUrl} alt="banner" className="w-full h-20 object-cover rounded-lg mb-2" />
                <button
                  onClick={e => { e.stopPropagation(); updateBanner(current.id, { imageUrl: undefined }); }}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg"
                >
                  <Icon name="X" size={10} />
                </button>
              </div>
            ) : (
              <>
                <Icon name="ImagePlus" size={20} className="mx-auto text-muted-foreground/40 mb-1" />
                <div className="text-xs text-muted-foreground">Перетащите или нажмите для загрузки</div>
                <div className="text-[10px] text-muted-foreground/50 mt-0.5">Рекомендуется 970 × 250 px</div>
              </>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>

        {/* Fields */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1 block">Значок-бейдж</label>
            <input value={current.badge} onChange={e => patch('badge', e.target.value)} className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1 block">Заголовок</label>
            <textarea value={current.title} onChange={e => patch('title', e.target.value)} rows={2} className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary resize-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1 block">Подзаголовок</label>
            <textarea value={current.subtitle} onChange={e => patch('subtitle', e.target.value)} rows={2} className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1 block">Кнопка 1</label>
              <input value={current.btnPrimary} onChange={e => patch('btnPrimary', e.target.value)} className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1 block">Кнопка 2</label>
              <input value={current.btnSecondary} onChange={e => patch('btnSecondary', e.target.value)} className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1 block">Цвет фона</label>
            <div className="grid grid-cols-1 gap-1.5">
              {GRADIENT_PRESETS.map(p => (
                <button
                  key={p.value}
                  onClick={() => patch('gradient', p.value)}
                  className={`flex items-center gap-3 p-2 rounded-xl border-2 text-left transition-colors ${current.gradient === p.value ? 'border-primary' : 'border-border hover:border-primary/40'}`}
                >
                  <div className="w-10 h-5 rounded-lg flex-shrink-0" style={{ background: p.value }} />
                  <span className="text-xs font-semibold">{p.label}</span>
                  {current.gradient === p.value && <Icon name="Check" size={13} className="ml-auto text-primary" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button onClick={handleSave} className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all ${saved ? 'bg-green-600 text-white' : 'bg-primary text-white hover:opacity-90'}`}>
            {saved ? '✓ Сохранено!' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}
