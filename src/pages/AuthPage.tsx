import { useState, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/data/auth';

interface AuthPageProps {
  onSuccess: (role: UserRole) => void;
  onClose: () => void;
}

type Step = 'phone' | 'otp' | 'register_name';
type Mode = 'login' | 'register';

// Форматирует номер при вводе
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').substring(0, 11);
  if (digits.length === 0) return '';
  let result = '+7';
  if (digits.length > 1) result += ' ' + digits.substring(1, 4);
  if (digits.length > 4) result += ' ' + digits.substring(4, 7);
  if (digits.length > 7) result += '-' + digits.substring(7, 9);
  if (digits.length > 9) result += '-' + digits.substring(9, 11);
  return result;
}

export default function AuthPage({ onSuccess, onClose }: AuthPageProps) {
  const { login, register, isLoading } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 11) { setError('Введите полный номер телефона'); return; }

    // Имитируем отправку SMS
    await new Promise(r => setTimeout(r, 600));
    setOtpSent(true);
    if (mode === 'register') {
      setStep('register_name');
    } else {
      setStep('otp');
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) { setError('Введите ваше имя'); return; }
    setError('');
    setStep('otp');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 3) otpRefs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const code = otp.join('');
    if (code.length < 4) { setError('Введите код из 4 цифр'); return; }

    if (mode === 'login') {
      const result = await login(phone, code);
      if (result.success && result.role) {
        onSuccess(result.role);
      } else {
        setError('Неверный код или номер не зарегистрирован');
      }
    } else {
      const ok = await register(phone, name, code);
      if (ok) onSuccess('buyer');
      else setError('Ошибка регистрации. Попробуйте снова.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-md p-8 animate-scale-in shadow-2xl">
        {/* Close */}
        <button onClick={onClose} className="absolute top-5 right-5 p-2 hover:bg-secondary rounded-xl transition-colors">
          <Icon name="X" size={18} className="text-muted-foreground" />
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/30">
            <span className="text-white text-2xl font-black">О'</span>
          </div>
          <h2 className="text-2xl font-black">
            {mode === 'login' ? 'Войти в О\'kak' : 'Регистрация'}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {step === 'phone' && 'Введите номер телефона'}
            {step === 'register_name' && 'Как вас зовут?'}
            {step === 'otp' && `Код отправлен на ${phone}`}
          </p>
        </div>

        {/* Step: Phone */}
        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block uppercase tracking-wide">Номер телефона</label>
              <div className="relative">
                <Icon name="Phone" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(formatPhone(e.target.value))}
                  placeholder="+7 900 000-00-00"
                  className="w-full pl-10 pr-4 py-3.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors font-medium"
                  autoFocus
                />
              </div>
            </div>
            {error && <p className="text-xs text-destructive font-medium">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-primary text-white rounded-xl font-black text-sm hover:opacity-90 disabled:opacity-60 transition-all shadow-md shadow-primary/30"
            >
              {isLoading ? 'Отправка...' : 'Получить код →'}
            </button>

            <div className="text-center text-sm text-muted-foreground">
              {mode === 'login' ? (
                <>Нет аккаунта?{' '}
                  <button type="button" onClick={() => { setMode('register'); setError(''); }} className="text-primary font-bold hover:underline">
                    Зарегистрироваться
                  </button>
                </>
              ) : (
                <>Уже есть аккаунт?{' '}
                  <button type="button" onClick={() => { setMode('login'); setError(''); }} className="text-primary font-bold hover:underline">
                    Войти
                  </button>
                </>
              )}
            </div>
          </form>
        )}

        {/* Step: Name (register only) */}
        {step === 'register_name' && (
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block uppercase tracking-wide">Ваше имя</label>
              <div className="relative">
                <Icon name="User" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Иван Петров"
                  className="w-full pl-10 pr-4 py-3.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors font-medium"
                  autoFocus
                />
              </div>
            </div>
            {error && <p className="text-xs text-destructive font-medium">{error}</p>}
            <button
              type="submit"
              className="w-full py-3.5 bg-primary text-white rounded-xl font-black text-sm hover:opacity-90 transition-all shadow-md shadow-primary/30"
            >
              Далее →
            </button>
            <button type="button" onClick={() => setStep('phone')} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Изменить номер
            </button>
          </form>
        )}

        {/* Step: OTP */}
        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-4 block uppercase tracking-wide text-center">
                Введите 4-значный код из SMS
              </label>
              <div className="flex gap-3 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={otpRefs[i]}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="w-14 h-14 text-center text-2xl font-black border-2 border-border rounded-2xl focus:outline-none focus:border-primary transition-colors"
                    autoFocus={i === 0}
                  />
                ))}
              </div>
              <p className="text-center text-xs text-muted-foreground mt-3">
                Тест: введи любые 4 цифры{mode === 'login' && <><br/>Тел. для входа: <span className="font-bold text-primary">+7 900 000-00-01</span></>}
              </p>
            </div>
            {error && <p className="text-xs text-destructive font-medium text-center">{error}</p>}
            <button
              type="submit"
              disabled={isLoading || otp.join('').length < 4}
              className="w-full py-3.5 bg-primary text-white rounded-xl font-black text-sm hover:opacity-90 disabled:opacity-60 transition-all shadow-md shadow-primary/30"
            >
              {isLoading ? 'Проверка...' : mode === 'login' ? 'Войти 🚀' : 'Зарегистрироваться 🎉'}
            </button>
            <button type="button" onClick={() => setStep('phone')} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Назад
            </button>
          </form>
        )}

        {/* Hint */}
        {mode === 'login' && step === 'phone' && (
          <div className="mt-4 p-3 bg-secondary rounded-xl text-xs text-muted-foreground">
            <p className="font-semibold mb-2">Тестовые аккаунты:</p>
            <div className="space-y-1.5">
              <button type="button" onClick={() => setPhone('+7 900 000-00-01')} className="w-full text-left px-2 py-1.5 bg-white rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-between">
                <span>🛍️ Покупатель</span><span className="font-bold text-primary">+7 900 000-00-01</span>
              </button>
              <button type="button" onClick={() => setPhone('+7 900 000-00-02')} className="w-full text-left px-2 py-1.5 bg-white rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-between">
                <span>🏪 Продавец</span><span className="font-bold text-primary">+7 900 000-00-02</span>
              </button>
            </div>
            <p className="mt-2 text-center opacity-70">Нажми на нужный аккаунт → код любой</p>
          </div>
        )}
      </div>
    </div>
  );
}