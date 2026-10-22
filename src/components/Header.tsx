import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Menu, 
  X, 
  ShieldCheck, 
  Phone, 
  Sparkles, 
  Lock, 
  Globe, 
  Check, 
  Crown,
  Share2
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onNavigateCategory: (catId: string) => void;
  onScrollToSection: (sectionId: string) => void;
  onOpenShare?: () => void;
  stealthMode?: boolean;
  isAdminLoggedIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  cartCount,
  onOpenCart,
  onOpenAdmin,
  onNavigateCategory,
  onScrollToSection,
  onOpenShare,
  stealthMode = false,
  isAdminLoggedIn = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logoClickRef = React.useRef<{ count: number; timer: any }>({ count: 0, timer: null });
  const t = TRANSLATIONS[language];

  const handleNavClick = (sectionId: string) => {
    onScrollToSection(sectionId);
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    // Secret 3-tap gesture to open Admin even if stealth mode is active!
    logoClickRef.current.count += 1;
    if (logoClickRef.current.timer) {
      clearTimeout(logoClickRef.current.timer);
    }

    if (logoClickRef.current.count >= 3) {
      logoClickRef.current.count = 0;
      onOpenAdmin();
      return;
    }

    logoClickRef.current.timer = setTimeout(() => {
      logoClickRef.current.count = 0;
    }, 1200);

    handleNavClick('hero');
  };


  const handleCategoryClick = (catId: string) => {
    onNavigateCategory(catId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B0B0C]/95 backdrop-blur-md border-b border-[#D4AF37]/25 transition-all duration-300">
      
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-[#17171A] via-[#22211B] to-[#17171A] text-xs py-2 px-3 border-b border-[#D4AF37]/15">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-[#D4AF37]">
          
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 text-[#F3E5AB] shrink-0 animate-pulse" />
            <span className="font-medium text-[#F3E5AB] text-[11px] sm:text-xs">
              {t.announcement}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 text-xs font-sans-clean ml-auto">
            <a 
              href="tel:+213696544855" 
              className="hidden sm:flex items-center gap-1.5 text-zinc-300 hover:text-[#D4AF37] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>+213 696 54 48 55</span>
            </a>

            {/* Quick Language Toggle in Top Bar (French / Arabic / English) */}
            <div className="flex items-center bg-[#101012] border border-[#D4AF37]/40 rounded-full p-0.5 shadow-sm">
              <button
                onClick={() => onLanguageChange('fr')}
                className={`text-[11px] px-2.5 py-0.5 rounded-full transition-all font-semibold flex items-center gap-1 ${
                  language === 'fr' 
                    ? 'text-black bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] shadow' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>Français</span>
              </button>
              
              <button
                onClick={() => onLanguageChange('ar')}
                className={`text-[11px] px-2.5 py-0.5 rounded-full transition-all font-semibold flex items-center gap-1 ${
                  language === 'ar' 
                    ? 'text-black bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] shadow font-arabic-cairo' 
                    : 'text-zinc-400 hover:text-white font-arabic-cairo'
                }`}
              >
                <span>العربية</span>
              </button>

              <button
                onClick={() => onLanguageChange('en')}
                className={`text-[11px] px-2 py-0.5 rounded-full transition-all font-semibold ${
                  language === 'en' 
                    ? 'text-black bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] shadow' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <span>EN</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">
          
          {/* Official Brand Logo */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogoClick} 
              title="Products Global Dz"
              className="text-left rtl:text-right flex items-center gap-3 group focus:outline-none cursor-pointer select-none"
            >
              <div className="relative w-13 h-13 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#8C6D1F] shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center group-hover:scale-105 group-hover:shadow-[#D4AF37]/40 transition-all duration-300 shrink-0">
                <img
                  src="/logo.png"
                  alt="Products Global Dz Logo"
                  className="w-full h-full object-cover rounded-full bg-black"
                />
              </div>

              <div>
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-wider font-serif-luxury gold-gradient-text block leading-none">
                  Products Global Dz
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 rtl:space-x-reverse font-sans-clean text-sm font-medium text-zinc-300">
            <button 
              onClick={() => handleNavClick('hero')} 
              className="hover:text-[#D4AF37] transition-colors"
            >
              {t.nav.home}
            </button>
            <button 
              onClick={() => handleCategoryClick('perfumes')} 
              className="hover:text-[#D4AF37] transition-colors"
            >
              {t.nav.perfumes}
            </button>
            <button 
              onClick={() => handleCategoryClick('cosmetics')} 
              className="hover:text-[#D4AF37] transition-colors"
            >
              {t.nav.cosmetics}
            </button>
            <button 
              onClick={() => handleCategoryClick('skincare')} 
              className="hover:text-[#D4AF37] transition-colors"
            >
              {t.nav.skincare}
            </button>
            <button 
              onClick={() => handleCategoryClick('watches-men')} 
              className="hover:text-[#D4AF37] transition-colors"
            >
              {t.nav.watchesMen}
            </button>
            <button 
              onClick={() => handleCategoryClick('watches-women')} 
              className="hover:text-[#D4AF37] transition-colors"
            >
              {t.nav.watchesWomen}
            </button>
            <button 
              onClick={() => handleNavClick('catalog')} 
              className="hover:text-[#D4AF37] transition-colors flex items-center gap-1 text-[#F3E5AB]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              {t.nav.specialOffers}
            </button>
          </nav>

          {/* Right Action Icons: Language switch button, Order CTA, Cart & Admin */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            
            {/* Prominent Header Language Switcher (Quick Toggle AR / FR) */}
            <div className="flex items-center bg-[#141418] border border-[#D4AF37]/40 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => onLanguageChange(language === 'ar' ? 'fr' : 'ar')}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 hover:from-[#D4AF37] hover:text-black text-[#F3E5AB] border border-[#D4AF37]/30 transition-all flex items-center gap-1.5"
                title="Changer de langue / تغيير اللغة"
              >
                <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="font-bold">
                  {language === 'ar' ? 'Français' : 'العربية'}
                </span>
              </button>
            </div>

            {/* Quick Order Button */}
            <button
              onClick={() => handleNavClick('order-form')}
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-black font-semibold text-xs tracking-wider uppercase shadow-md hover:from-[#F3E5AB] hover:to-[#D4AF37] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>{t.nav.orderNow}</span>
            </button>

            {/* Quick Share Store Link Button */}
            {onOpenShare && (
              <button
                onClick={onOpenShare}
                title={language === 'ar' ? 'مشاركة رابط المتجر' : 'Partager la boutique'}
                aria-label="Partager la boutique"
                className="p-2.5 sm:p-3 rounded-full bg-[#17171A] border border-[#D4AF37]/40 text-[#D4AF37] hover:text-black hover:bg-[#D4AF37] hover:scale-105 transition-all shadow-md cursor-pointer flex items-center justify-center"
              >
                <Share2 className="w-5 h-5" />
              </button>
            )}

            {/* Shopping Cart Icon with Badge */}
            <button
              onClick={onOpenCart}
              aria-label="Shopping Cart"
              className="relative p-2.5 sm:p-3 rounded-full bg-[#17171A] border border-[#D4AF37]/40 text-[#F3E5AB] hover:text-white hover:border-[#D4AF37] hover:scale-105 transition-all shadow-md"
            >
              <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#D4AF37] text-black text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin Portal Toggle (Shown ONLY when already logged in as Admin) */}
            {isAdminLoggedIn && (
              <button
                onClick={onOpenAdmin}
                title={language === 'ar' ? 'لوحة تحكم المدير' : 'Espace Administrateur'}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/80 text-[#F3E5AB] hover:text-black hover:bg-[#D4AF37] font-bold text-xs flex items-center gap-1.5 shadow-md transition-all animate-pulse cursor-pointer"
              >
                <Crown className="w-4 h-4 text-[#D4AF37]" />
                <span className="hidden sm:inline">{language === 'ar' ? 'لوحة المدير' : 'Admin'}</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0F0F12] border-b border-[#D4AF37]/30 px-4 pt-3 pb-6 space-y-4 animate-fade-in shadow-2xl">
          
          {/* Prominent Mobile Language Switch Card */}
          <div className="p-3 rounded-xl bg-[#17171C] border border-[#D4AF37]/30 flex items-center justify-between">
            <span className="text-xs text-zinc-300 font-semibold flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#D4AF37]" />
              <span>Langue / اللغة :</span>
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => { onLanguageChange('fr'); setMobileMenuOpen(false); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  language === 'fr' 
                    ? 'bg-[#D4AF37] text-black shadow' 
                    : 'bg-zinc-800 text-zinc-300 hover:text-white'
                }`}
              >
                Français
              </button>
              <button
                onClick={() => { onLanguageChange('ar'); setMobileMenuOpen(false); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all font-arabic-cairo ${
                  language === 'ar' 
                    ? 'bg-[#D4AF37] text-black shadow' 
                    : 'bg-zinc-800 text-zinc-300 hover:text-white'
                }`}
              >
                العربية
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm font-sans-clean">
            <button 
              onClick={() => handleNavClick('hero')} 
              className="p-2.5 text-left rtl:text-right rounded bg-[#17171A] text-zinc-200 hover:text-[#D4AF37]"
            >
              {t.nav.home}
            </button>
            <button 
              onClick={() => handleNavClick('catalog')} 
              className="p-2.5 text-left rtl:text-right rounded bg-[#17171A] text-zinc-200 hover:text-[#D4AF37]"
            >
              {t.nav.specialOffers}
            </button>
            <button 
              onClick={() => handleCategoryClick('perfumes')} 
              className="p-2.5 text-left rtl:text-right rounded bg-[#17171A] text-zinc-200 hover:text-[#D4AF37]"
            >
              {t.nav.perfumes}
            </button>
            <button 
              onClick={() => handleCategoryClick('cosmetics')} 
              className="p-2.5 text-left rtl:text-right rounded bg-[#17171A] text-zinc-200 hover:text-[#D4AF37]"
            >
              {t.nav.cosmetics}
            </button>
            <button 
              onClick={() => handleCategoryClick('skincare')} 
              className="p-2.5 text-left rtl:text-right rounded bg-[#17171A] text-zinc-200 hover:text-[#D4AF37]"
            >
              {t.nav.skincare}
            </button>
            <button 
              onClick={() => handleCategoryClick('watches-men')} 
              className="p-2.5 text-left rtl:text-right rounded bg-[#17171A] text-zinc-200 hover:text-[#D4AF37]"
            >
              {t.nav.watchesMen}
            </button>
            <button 
              onClick={() => handleCategoryClick('watches-women')} 
              className="p-2.5 text-left rtl:text-right rounded bg-[#17171A] text-zinc-200 hover:text-[#D4AF37]"
            >
              {t.nav.watchesWomen}
            </button>
            <button 
              onClick={() => handleNavClick('why-us')} 
              className="p-2.5 text-left rtl:text-right rounded bg-[#17171A] text-zinc-200 hover:text-[#D4AF37]"
            >
              {t.nav.whyUs}
            </button>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {onOpenShare && (
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenShare(); }}
                className="w-full py-2.5 rounded-xl bg-[#17171C] border border-[#D4AF37]/50 text-[#F3E5AB] hover:bg-[#D4AF37] hover:text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <Share2 className="w-4 h-4 text-[#D4AF37]" />
                <span>{language === 'ar' ? '🔗 مشاركة رابط المتجر والبايو' : '🔗 Partager le lien de la boutique'}</span>
              </button>
            )}
            <button
              onClick={() => handleNavClick('order-form')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-black font-bold text-sm text-center uppercase tracking-wide cursor-pointer"
            >
              {t.nav.orderNow}
            </button>
            {/* Mobile Admin Link (Visible ONLY when logged in as Admin) */}
            {isAdminLoggedIn && (
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAdmin(); }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Crown className="w-4 h-4" />
                <span>{language === 'ar' ? '👑 لوحة تحكم المدير' : '👑 Espace Administrateur'}</span>
              </button>
            )}
          </div>

        </div>
      )}
    </header>
  );
};
