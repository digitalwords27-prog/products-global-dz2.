import React from 'react';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Lock, 
  MessageCircle, 
  Sparkles, 
  ShieldCheck, 
  Truck,
  Heart
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS, generateWhatsAppLink } from '../i18n/translations';

interface FooterProps {
  language: Language;
  onOpenAdmin: () => void;
  onScrollToSection: (sectionId: string) => void;
  onNavigateCategory: (catId: string) => void;
  stealthMode?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  language,
  onOpenAdmin,
  onScrollToSection,
  onNavigateCategory,
  stealthMode = false,
}) => {
  const t = TRANSLATIONS[language];
  const whatsappUrl = generateWhatsAppLink({ language });

  return (
    <footer className="bg-[#080809] border-t border-[#D4AF37]/20 pt-16 pb-12 text-zinc-400 font-sans-clean">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Brand & Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-zinc-800/80">
          
          {/* Brand Info (Cols 1-5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#8C6D1F] shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center shrink-0">
                <img
                  src="/logo.png"
                  alt="Products Global Dz Logo"
                  className="w-full h-full object-cover rounded-full bg-black"
                />
              </div>
              <div>
                <span className="text-xl font-bold font-serif-luxury gold-gradient-text tracking-wider block">
                  Products Global Dz
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              {t.footer.description}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18181C] border border-[#D4AF37]/30 text-[11px] text-[#F3E5AB]">
                <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
                {language === 'ar' ? 'توصيل مضمون لكافة الـ 69 ولاية' : 'Livraison garantie dans les 69 Wilayas'}
              </span>
            </div>
          </div>

          {/* Quick Navigation Links (Cols 6-8) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif-luxury text-sm font-bold text-white uppercase tracking-wider">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => onScrollToSection('hero')} 
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  {t.nav.home}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateCategory('perfumes')} 
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  {t.nav.perfumes}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateCategory('cosmetics')} 
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  {t.nav.cosmetics}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateCategory('skincare')} 
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  {t.nav.skincare}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateCategory('watches-men')} 
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  {t.nav.watchesMen}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateCategory('watches-women')} 
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  {t.nav.watchesWomen}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onScrollToSection('order-form')} 
                  className="hover:text-[#D4AF37] transition-colors text-[#F3E5AB] font-medium"
                >
                  {t.nav.orderNow}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details (Cols 9-12) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-serif-luxury text-sm font-bold text-white uppercase tracking-wider">
              {t.footer.contactUs}
            </h4>
            
            <div className="space-y-2.5 text-xs">
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-zinc-300 hover:text-[#25D366] transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>WhatsApp : <strong>+213 696 54 48 55</strong></span>
              </a>

              <a 
                href="tel:+213696544855"
                className="flex items-center gap-2.5 text-zinc-300 hover:text-[#D4AF37] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Service Téléphonique : 0696 54 48 55</span>
              </a>

              <div className="flex items-center gap-2.5 text-zinc-400">
                <Clock className="w-4 h-4 text-zinc-500 shrink-0" />
                <span>{t.footer.hours}</span>
              </div>

              <div className="flex items-center gap-2.5 text-zinc-400">
                <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
                <span>{language === 'ar' ? 'الجزائر — تغطية وطنية تشمل الـ 69 ولاية' : 'Algérie — Couverture nationale 69 Wilayas'}</span>
              </div>
            </div>

            {/* Admin Access Discreet Link (Hidden in Stealth Mode) */}
            {!stealthMode && (
              <div className="pt-2">
                <button
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-[#D4AF37] transition-colors bg-[#121215] px-3 py-1.5 rounded-lg border border-zinc-800 cursor-pointer"
                >
                  <Lock className="w-3 h-3" />
                  <span>{t.footer.adminAccess}</span>
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Bottom Copyright & Guarantee Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>
            © {new Date().getFullYear()} <strong>Products Global Dz</strong>. {t.footer.rights}
          </p>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Paiement à la livraison (COD)</span>
            <span>•</span>
            <span>Garantie colis conforme</span>
            <span>•</span>
            <span>Algérie</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
