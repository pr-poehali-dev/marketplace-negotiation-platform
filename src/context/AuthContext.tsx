import { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, MOCK_USERS, generateBuyerCode } from '@/data/auth';

interface AuthContextType {
  user: User | null;
  login: (phone: string, otp: string) => Promise<{ success: boolean; role?: UserRole }>;
  register: (phone: string, name: string, otp: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (phone: string, _otp: string): Promise<{ success: boolean; role?: UserRole }> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));

    // Мок: проверяем по номеру телефона
    const normalized = phone.replace(/\s/g, '');
    const found = MOCK_USERS.find(u => u.phone.replace(/\s/g, '') === normalized);

    if (found) {
      setUser(found);
      setIsLoading(false);
      return { success: true, role: found.role };
    }

    setIsLoading(false);
    return { success: false };
  };

  const register = async (phone: string, name: string, _otp: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));

    const newUser: User = {
      id: `u_${Date.now()}`,
      phone,
      name,
      role: 'buyer',
      buyerCode: generateBuyerCode(),
      avatar: name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(),
      bonusPoints: 200, // бонус за первую регистрацию
      createdAt: new Date().toISOString().split('T')[0],
    };

    setUser(newUser);
    setIsLoading(false);
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
