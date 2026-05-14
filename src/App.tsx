import { useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomePage from '@/pages/HomePage';
import CatalogPage from '@/pages/CatalogPage';
import ProductPage from '@/pages/ProductPage';
import SellerPage from '@/pages/SellerPage';
import CartPage from '@/pages/CartPage';
import ChatPage from '@/pages/ChatPage';
import ProfilePage from '@/pages/ProfilePage';
import SupportPage from '@/pages/SupportPage';
import StoresPage from '@/pages/StoresPage';
import BonusesPage from '@/pages/BonusesPage';
import AuthPage from '@/pages/AuthPage';
import SellerRegisterPage from '@/pages/SellerRegisterPage';
import ModeratorPage from '@/pages/ModeratorPage';
import AdminPage from '@/pages/AdminPage';
import NotificationToast from '@/components/NotificationToast';
import { Product } from '@/data/products';
import { UserRole } from '@/data/auth';

interface CartItem extends Product {
  quantity: number;
}

interface NavState {
  page: string;
  params: Record<string, string>;
}

function AppInner() {
  const [nav, setNav] = useState<NavState>({ page: 'home', params: {} });
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showAuth, setShowAuth] = useState(false);

  const navigate = (page: string, params: Record<string, string> = {}) => {
    setNav({ page, params });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const handleAuthSuccess = (role: UserRole) => {
    setShowAuth(false);
    if (role === 'moderator') {
      navigate('admin');
    } else {
      navigate('profile');
    }
  };

  const renderPage = () => {
    const { page, params } = nav;
    switch (page) {
      case 'home':
        return <HomePage onNavigate={navigate} onAddToCart={addToCart} />;
      case 'catalog':
        return (
          <CatalogPage
            onNavigate={navigate}
            onAddToCart={addToCart}
            initialCategory={params.category || 'Все'}
            initialSearch={params.search || ''}
          />
        );
      case 'product':
        return (
          <ProductPage
            productId={Number(params.id) || 1}
            onNavigate={navigate}
            onAddToCart={addToCart}
          />
        );
      case 'seller':
        return (
          <SellerPage
            sellerId={Number(params.id) || 1}
            onNavigate={navigate}
            onAddToCart={addToCart}
          />
        );
      case 'cart':
        return (
          <CartPage
            cartItems={cartItems}
            onUpdateCart={setCartItems}
            onNavigate={navigate}
          />
        );
      case 'chat':
        return (
          <ChatPage
            initialSellerId={params.sellerId ? Number(params.sellerId) : undefined}
            offerPrice={params.offerPrice}
            productName={params.productName}
            onNavigate={navigate}
          />
        );
      case 'profile':
        return <ProfilePage onNavigate={navigate} onShowAuth={() => setShowAuth(true)} />;
      case 'support':
        return <SupportPage onNavigate={navigate} />;
      case 'stores':
        return <StoresPage onNavigate={navigate} />;
      case 'bonuses':
        return <BonusesPage onNavigate={navigate} />;
      case 'seller-register':
        return <SellerRegisterPage onNavigate={navigate} />;
      case 'moderator':
        return <ModeratorPage onNavigate={navigate} />;
      case 'admin':
        return <AdminPage onNavigate={navigate} />;
      default:
        return <HomePage onNavigate={navigate} onAddToCart={addToCart} />;
    }
  };

  const isAdmin = nav.page === 'admin';

  return (
    <>
      {isAdmin ? (
        renderPage()
      ) : (
        <div className="min-h-screen bg-background flex flex-col">
          <Header currentPage={nav.page} onNavigate={navigate} cartCount={cartCount} onShowAuth={() => setShowAuth(true)} />
          <div className="flex-1">
            {renderPage()}
          </div>
          <Footer onNavigate={navigate} />
        </div>
      )}
      <NotificationToast onNavigateAdmin={() => navigate('admin')} />
      {showAuth && (
        <AuthPage onSuccess={handleAuthSuccess} onClose={() => setShowAuth(false)} />
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppInner />
        </TooltipProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}