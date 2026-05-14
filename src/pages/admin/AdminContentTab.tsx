import Icon from '@/components/ui/icon';

export default function AdminContentTab() {
  return (
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
                <Icon name="Upload" size={14} /> Загрузить изображение
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
            { title: 'Баннер «Торг»',       subtitle: 'Механика торга',              active: true  },
            { title: 'Баннер «Бесплатно»',  subtitle: 'О бесплатности платформы',    active: true  },
            { title: 'Новый баннер акции',  subtitle: 'Не активен',                  active: false },
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

      <button className="w-full py-3.5 bg-primary text-white rounded-xl font-black text-sm hover:opacity-90 transition-all shadow-md shadow-primary/30">
        Сохранить все изменения
      </button>
    </div>
  );
}
