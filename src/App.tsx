import React, { useState, useEffect, useCallback } from 'react';
import { Language, CategoryId, Product, CartItem } from './types';
import { getStoredProducts } from './services/storage';
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
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';

const CART_STORAGE_KEY = 'products_global_dz_cart_v1';

export default function App() {
  // Multilingual State: French default, Arabic with RTL, English
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('products_global_dz_lang');
    return (saved === 'ar' || saved === 'en' || saved === 'fr') ? saved : 'fr';
  });

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
        />

        {/* 7. Why Choose Us Section */}
        <WhyChooseUs language={language} />

        {/* 8. Customer Order Form Section (Method B - 58 Wilayas & COD) */}
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
        onClose={() => setIsAdminOpen(false)}
        language={language}
        onProductsUpdated={syncProducts}
      />

    </div>
  );
}
