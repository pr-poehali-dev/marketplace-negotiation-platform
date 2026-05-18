import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, UserProfile } from '@/api/auth';
import { api } from '@/api/client';

type UserRole = 'buyer' | 'seller' | 'moderator';

interface AuthContextType {
  user: UserProfile | null;
  login: (phone: string, otp: string) => Promise<{ success: boolean; role?: UserRole }>;
  register: (phone: string, name: string, otp: string) => Promise<boolean>;
  sendOtp: (phone: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      authApi.me()
        .then(u => setUser(u))
        .catch(() => api.clearToken())
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const sendOtp = async (phone: string): Promise<boolean> => {
    try {
      const normalized = phone.replace(/\D/g, '');
      await authApi.sendOtp(normalized);
      return true;
    } catch {
      return false;
    }
  };

  const login = async (phone: string, otp: string): Promise<{ success: boolean; role?: UserRole }> => {
    setIsLoading(true);
    try {
      const normalized = phone.replace(/\D/g, '');
      const res = await authApi.login(normalized, otp);
      api.setToken(res.token);
      const me = await authApi.me();
      setUser(me);
      return { success: true, role: me.role };
    } catch {
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (phone: string, name: string, otp: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const normalized = phone.replace(/\D/g, '');
      const res = await authApi.register(normalized, name, otp);
      api.setToken(res.token);
      const me = await authApi.me();
      setUser(me);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    api.clearToken();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, sendOtp, logout, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
