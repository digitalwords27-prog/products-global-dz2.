import React, { useState, useEffect, useCallback } from 'react';
import { 
  Crown, 
  LogOut, 
  Settings, 
  Sparkles 
} from 'lucide-react';
import { Language, CategoryId, Product, CartItem, SecurityConfig } from './types';
import { 
  getStoredProducts, 
  getSecurityConfig, 
  isSiteUnlocked,
  isAdminAuthenticated,
  logoutAdmin
} from './services/storage';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryBar } from './components/CategoryBar';
import { FeaturedAndOffers } from './components/FeaturedAndOffers';
import { WhyChooseUs } from './components/WhyChooseUs';
import { OrderFormSection } from './components/OrderFormSection';
import { WhatsAppVIPSection } from './components/WhatsAppVIPSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { AdminModal } from './components/AdminModal';
import { QuickEditProductModal } from './components/QuickEditProductModal';
import { SiteLockScreen } from './components/SiteLockScreen';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';

const CART_STORAGE_KEY = 'products_global_dz_cart_v1';

export default function App() {
  // Multilingual State: French default, Arabic with RTL, English
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('products_global_dz_lang');
    return (saved === 'ar' || saved === 'en' || saved === 'fr') ? saved : 'fr';
  });

  // Security and Lock States
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>(() => getSecurityConfig());
  const [siteUnlocked, setSiteUnlocked] = useState<boolean>(() => isSiteUnlocked());

  // Category Filter
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');

  // Products from persistent storage
  const [products, setProducts] = useState<Product[]>(() => getStoredProducts());

  // Cart State with persistent localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Modal and Drawer States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // Admin Session & Quick Edit States
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => isAdminAuthenticated());
  const [quickEditProduct, setQuickEditProduct] = useState<Product | null>(null);

  // Direct order item handoff from product detail to order form
  const [directFormItem, setDirectFormItem] = useState<{ product: Product; quantity: number } | null>(null);


  // Handle Language changes and update HTML dir/lang attributes
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('products_global_dz_lang', lang);
    if (lang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', lang);
    }
  };

  useEffect(() => {
    handleLanguageChange(language);
  }, []);

  // Save Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cartItems]);

  // Sync Products from storage
  const syncProducts = useCallback(() => {
    setProducts(getStoredProducts());
  }, []);

  useEffect(() => {
    const handleUpdate = () => syncProducts();
    window.addEventListener('products_updated', handleUpdate);
    return () => window.removeEventListener('products_updated', handleUpdate);
  }, [syncProducts]);

  // Sync Security Config, Site Lock, and Admin Auth State
  useEffect(() => {
    const handleSecurityUpdate = () => {
      setSecurityConfig(getSecurityConfig());
      setSiteUnlocked(isSiteUnlocked());
      setIsAdminLoggedIn(isAdminAuthenticated());
    };
    window.addEventListener('security_updated', handleSecurityUpdate);
    window.addEventListener('admin_auth_changed', handleSecurityUpdate);
    return () => {
      window.removeEventListener('security_updated', handleSecurityUpdate);
      window.removeEventListener('admin_auth_changed', handleSecurityUpdate);
    };
  }, []);

  const handleAdminLogout = () => {
    logoutAdmin();
    setIsAdminLoggedIn(false);
  };

  // Listen to URL hash (#admin or ?admin=true) for discreet admin access
  useEffect(() => {
    const checkAdminHash = () => {
      if (window.location.hash === '#admin' || window.location.search.includes('admin=true')) {
        setIsAdminOpen(true);
      }
    };
    checkAdminHash();
    window.addEventListener('hashchange', checkAdminHash);
    return () => window.removeEventListener('hashchange', checkAdminHash);
  }, []);

  // Keyboard shortcut (Ctrl + Shift + A) to toggle Admin modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  // Smooth scroll helper
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Category navigation from header or bar
  const handleNavigateCategory = (catId: string) => {
    setSelectedCategory(catId as CategoryId);
    scrollToSection('catalog');
  };

  // Cart Operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.product.id !== productId);
      }
      return prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Direct order in form
  const handleDirectOrder = (product: Product, quantity = 1) => {
    setDirectFormItem({ product, quantity });
    scrollToSection('order-form');
  };

  const cartTotalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F5F2EB] flex flex-col font-sans-clean">
      
      {/* 1. Header with brand logo, nav, language selector, cart count, admin toggle */}
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onNavigateCategory={handleNavigateCategory}
        onScrollToSection={scrollToSection}
        stealthMode={securityConfig.stealthMode}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* 2. Hero Section */}
        <Hero
          language={language}
          onExploreClick={() => scrollToSection('catalog')}
          onOrderClick={() => scrollToSection('order-form')}
        />

        {/* 3. Product Categories Bar */}
        <CategoryBar
          language={language}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            scrollToSection('catalog');
          }}
        />

        {/* 4, 5, 6. Featured Products, New Arrivals, Special Offers, and Catalog with Filters */}
        <FeaturedAndOffers
          products={products}
          language={language}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onAddToCart={(p) => handleAddToCart(p, 1)}
          onQuickView={(p) => setDetailProduct(p)}
          onDirectOrder={(p) => handleDirectOrder(p, 1)}
          isAdminLoggedIn={isAdminLoggedIn}
          onQuickEditProduct={(p) => setQuickEditProduct(p)}
        />

        {/* 7. Why Choose Us Section */}
        <WhyChooseUs language={language} />

        {/* 8. Customer Order Form Section (Method B - 69 Wilayas & COD) */}
        <OrderFormSection
          products={products}
          cartItems={cartItems}
          language={language}
          onClearCart={handleClearCart}
          directSelectedProduct={directFormItem}
        />

        {/* 9. WhatsApp Ordering Section (Method A - VIP direct ordering) */}
        <WhatsAppVIPSection language={language} />

      </main>

      {/* 10. Footer */}
      <Footer
        language={language}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onScrollToSection={scrollToSection}
        onNavigateCategory={handleNavigateCategory}
        stealthMode={securityConfig.stealthMode}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Floating WhatsApp Action Button */}
      <FloatingWhatsApp language={language} />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={detailProduct}
        language={language}
        onClose={() => setDetailProduct(null)}
        onAddToCart={(p, q) => handleAddToCart(p, q)}
        onOrderDirectInForm={(p, q) => handleDirectOrder(p, q)}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        language={language}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onProceedToOrderForm={() => scrollToSection('order-form')}
      />

      {/* Admin Dashboard Modal (Protected Product & Order Management) */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          setIsAdminLoggedIn(isAdminAuthenticated());
        }}
        language={language}
        onProductsUpdated={syncProducts}
        onSecurityUpdated={() => {
          setSecurityConfig(getSecurityConfig());
          setSiteUnlocked(isSiteUnlocked());
          setIsAdminLoggedIn(isAdminAuthenticated());
        }}
      />

      {/* Quick Edit Modal for Admin to instantly change price, photo, and stock */}
      <QuickEditProductModal
        product={quickEditProduct}
        isOpen={Boolean(quickEditProduct)}
        onClose={() => setQuickEditProduct(null)}
        language={language}
        onOpenFullAdmin={() => {
          setQuickEditProduct(null);
          setIsAdminOpen(true);
        }}
        onProductUpdated={syncProducts}
      />

      {/* Exclusive Admin Floating Control Bar (Visible ONLY when logged in as Admin) */}
      {isAdminLoggedIn && (
        <aside 
          aria-label="Admin Control Bar"
          className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto z-50 bg-[#121216]/95 backdrop-blur-md border border-[#D4AF37] rounded-2xl p-2.5 sm:px-5 sm:py-3 shadow-2xl shadow-black/90 flex items-center justify-between sm:gap-4 animate-slide-up"
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#F3E5AB] flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{language === 'ar' ? 'وضع المدير نشط' : 'Mode Administrateur'}</span>
              </span>
              <span className="text-[10px] text-zinc-400 hidden sm:inline">
                {language === 'ar' ? 'أزرار التعديل ظاهرة لك فقط' : 'Boutons d\'édition visibles uniquement pour vous'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-black text-xs font-bold hover:brightness-110 transition shadow flex items-center gap-1 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'لوحة التحكم' : 'Tableau de bord'}</span>
            </button>
            <button
              onClick={handleAdminLogout}
              className="px-2.5 py-1.5 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-semibold hover:bg-red-900 transition flex items-center gap-1 cursor-pointer"
              title={language === 'ar' ? 'خروج من وضع المدير والعودة لمشاهدة المتجر كزبون' : 'Quitter le mode gérant'}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'خروج' : 'Déconnexion'}</span>
            </button>
          </div>
        </aside>
      )}

      {/* Private Site Lock Screen (Active when Site-Wide Lock is enabled) */}
      {securityConfig.siteLockEnabled && !siteUnlocked && (
        <SiteLockScreen
          language={language}
          onLanguageChange={handleLanguageChange}
          onUnlockSuccess={() => setSiteUnlocked(true)}
          onOpenAdminDirect={() => setIsAdminOpen(true)}
        />
      )}


    </div>
  );
}
