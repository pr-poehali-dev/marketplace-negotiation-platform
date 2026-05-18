import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/context/AuthContext';
import { sellersApi } from '@/api/products';

interface SellerRegisterPageProps {
  onNavigate: (page: string) => void;
}

interface DocFile {
  id: string;
  label: string;
  type: string;
  required: boolean;
  file: File | null;
  uploaded: boolean;
}

const DOC_LIST: Omit<DocFile, 'file' | 'uploaded'>[] = [
  { id: 'inn', label: 'ИНН (скан или фото)', type: 'inn', required: true },
  { id: 'ogrn', label: 'ОГРН / ОГРНИП', type: 'ogrn', required: true },
  { id: 'passport', label: 'Паспорт руководителя (стр. 2-3)', type: 'passport', required: true },
  { id: 'license', label: 'Лицензия (если требуется)', type: 'license', required: false },
  { id: 'other', label: 'Прочие документы', type: 'other', required: false },
];

type FormStep = 'info' | 'docs' | 'done';

export default function SellerRegisterPage({ onNavigate }: SellerRegisterPageProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<FormStep>('info');
  const [shopName, setShopName] = useState('');
  const [shopDesc, setShopDesc] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [docs, setDocs] = useState<DocFile[]>(DOC_LIST.map(d => ({ ...d, file: null, uploaded: false })));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!user) {
    return (
      <main className="max-w-xl mx-auto px-4 py-20 text-center">
        <span className="text-5xl block mb-4">🔒</span>
        <h2 className="text-xl font-black mb-2">Нужна авторизация</h2>
        <p className="text-muted-foreground mb-6 text-sm">Войдите в аккаунт, чтобы зарегистрировать магазин</p>
        <button onClick={() => onNavigate('home')} className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all">
          На главную
        </button>
      </main>
    );
  }

  const validateInfo = () => {
    const e: Record<string, string> = {};
    if (!shopName.trim()) e.shopName = 'Введите название магазина';
    if (!city.trim()) e.city = 'Укажите город';
    if (!address.trim()) e.address = 'Укажите адрес';
    if (!contactPhone.trim()) e.contactPhone = 'Укажите контактный телефон';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileChange = (docId: string, file: File | null) => {
    setDocs(prev => prev.map(d => d.id === docId ? { ...d, file, uploaded: !!file } : d));
  };

  const requiredDocsUploaded = docs.filter(d => d.required).every(d => d.uploaded);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      await sellersApi.register({
        shop_name: shopName.trim(),
        description: shopDesc.trim() || undefined,
        contact_phone: contactPhone.trim() || undefined,
        city: city.trim() || undefined,
        address: address.trim() || undefined,
      });
      setStep('done');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Ошибка при отправке заявки';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const STEPS = [
    { key: 'info', label: 'Информация о магазине' },
    { key: 'docs', label: 'Документы' },
    { key: 'done', label: 'Готово' },
  ];

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => onNavigate('profile')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <Icon name="ArrowLeft" size={14} /> Назад в профиль
      </button>

      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl">🏪</span>
        <div>
          <h1 className="text-2xl font-black">Регистрация магазина</h1>
          <p className="text-sm text-muted-foreground">Бесплатно. Без скрытых платежей.</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => {
          const stepIndex = STEPS.findIndex(x => x.key === step);
          const done = i < stepIndex;
          const active = s.key === step;
          return (
            <div key={s.key} className="flex items-center gap-2 flex-1">
              <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${done ? 'bg-green-500 text-white' : active ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}>
                {done ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-semibold truncate ${active ? 'text-primary' : 'text-muted-foreground'}`}>{s.label}</span>
              {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 rounded-full ${done ? 'bg-green-400' : 'bg-border'}`} />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Info */}
      {step === 'info' && (
        <div className="space-y-5 animate-fade-in">
          <div className="bg-orange-50 border-2 border-primary/20 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-xl flex-shrink-0">💡</span>
            <div className="text-sm text-muted-foreground">
              После проверки документов модератором вашему магазину присвоят уникальный код.
              Регистрация бесплатна — без скрытых платежей.
            </div>
          </div>

          {[
            { id: 'shopName', label: 'Название магазина *', value: shopName, set: setShopName, placeholder: 'Например: СпортЛэнд', icon: 'Store' },
            { id: 'city', label: 'Город *', value: city, set: setCity, placeholder: 'Москва', icon: 'MapPin' },
            { id: 'address', label: 'Адрес *', value: address, set: setAddress, placeholder: 'ул. Ленина, 1', icon: 'Navigation' },
            { id: 'contactPhone', label: 'Контактный телефон *', value: contactPhone, set: setContactPhone, placeholder: '+7 900 000-00-00', icon: 'Phone' },
          ].map(field => (
            <div key={field.id}>
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block uppercase tracking-wide">{field.label}</label>
              <div className="relative">
                <Icon name={field.icon as Parameters<typeof Icon>[0]['name']} size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={field.value}
                  onChange={e => field.set(e.target.value)}
                  placeholder={field.placeholder}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors ${errors[field.id] ? 'border-destructive' : 'border-border'}`}
                />
              </div>
              {errors[field.id] && <p className="text-xs text-destructive mt-1">{errors[field.id]}</p>}
            </div>
          ))}

          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1.5 block uppercase tracking-wide">Описание магазина</label>
            <textarea
              value={shopDesc}
              onChange={e => setShopDesc(e.target.value)}
              rows={3}
              placeholder="Расскажите о вашем магазине и товарах..."
              className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          <button
            onClick={() => { if (validateInfo()) setStep('docs'); }}
            className="w-full py-3.5 bg-primary text-white rounded-xl font-black text-sm hover:opacity-90 transition-all shadow-md shadow-primary/30"
          >
            Далее: загрузка документов →
          </button>
        </div>
      )}

      {/* Step 2: Docs */}
      {step === 'docs' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 text-sm text-blue-800">
            <p className="font-bold mb-1">📋 Требуемые документы</p>
            <p className="text-xs">Загрузите сканы или чёткие фото документов. Форматы: PDF, JPG, PNG. Максимум 10 МБ на файл.</p>
          </div>

          {docs.map(doc => (
            <div key={doc.id} className={`border-2 rounded-2xl p-4 transition-all ${doc.uploaded ? 'border-green-400 bg-green-50' : 'border-border bg-white'}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-semibold text-sm">{doc.label}</span>
                  {doc.required && <span className="ml-2 text-xs text-destructive font-bold">*обязательно</span>}
                </div>
                {doc.uploaded && <span className="text-green-600 text-xs font-bold flex items-center gap-1"><Icon name="CheckCircle" size={13} />Загружен</span>}
              </div>
              <label className="cursor-pointer">
                <div className={`border-2 border-dashed rounded-xl p-3 text-center hover:border-primary transition-colors ${doc.uploaded ? 'border-green-400' : 'border-border'}`}>
                  {doc.file ? (
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Icon name="FileText" size={16} className="text-green-600" />
                      <span className="text-green-700 font-medium truncate max-w-xs">{doc.file.name}</span>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-xs">
                      <Icon name="Upload" size={18} className="mx-auto mb-1" />
                      Нажмите для выбора файла
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={e => handleFileChange(doc.id, e.target.files?.[0] || null)}
                />
              </label>
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep('info')} className="flex-1 py-3 border-2 border-border rounded-xl font-bold text-sm hover:bg-secondary transition-colors">
              ← Назад
            </button>
            <button
              onClick={handleSubmit}
              disabled={!requiredDocsUploaded || submitting}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-black text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-primary/30"
            >
              {submitting ? 'Отправка...' : 'Отправить на проверку 🚀'}
            </button>
          </div>
          {!requiredDocsUploaded && (
            <p className="text-xs text-muted-foreground text-center">Загрузите все обязательные документы</p>
          )}
          {submitError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 text-xs text-red-700 text-center">
              {submitError}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Done */}
      {step === 'done' && (
        <div className="text-center py-8 animate-fade-in">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-black mb-2">Заявка отправлена!</h2>
          <p className="text-muted-foreground mb-4">
            Модераторы проверят ваши данные в течение 1–2 рабочих дней.<br />
            Статус заявки можно отслеживать в личном кабинете.
          </p>
          <div className="bg-primary/10 border-2 border-primary/30 rounded-2xl p-5 mb-6">
            <p className="text-sm font-bold text-primary mb-1">Магазин «{shopName}»</p>
            <p className="text-xs text-muted-foreground">Код будет присвоен после одобрения модератором</p>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => onNavigate('profile')} className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all">
              В личный кабинет
            </button>
          </div>
        </div>
      )}
    </main>
  );
}