import React from 'react';
import { 
  Sparkles, 
  Truck, 
  ShieldCheck, 
  MessageCircle, 
  ArrowRight, 
  Clock, 
  Award 
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS, generateWhatsAppLink } from '../i18n/translations';

interface HeroProps {
  language: Language;
  onExploreClick: () => void;
  onOrderClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  language,
  onExploreClick,
  onOrderClick,
}) => {
  const t = TRANSLATIONS[language];
  const generalWhatsAppUrl = generateWhatsAppLink({ language });

  return (
    <section id="hero" className="relative overflow-hidden pt-6 pb-16 lg:pt-14 lg:pb-24">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/8 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-[#B38728]/10 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left rtl:lg:text-right">
            
            {/* Prestige Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#18181C] border border-[#D4AF37]/40 shadow-sm">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#F3E5AB]">
                {t.hero.badge}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight font-serif-luxury text-white leading-tight">
              <span className="gold-gradient-text block mb-1">
                {t.hero.titleHighlight}
              </span>
              <span className="text-zinc-100 font-light text-2xl sm:text-4xl lg:text-5xl">
                {t.hero.titleRest}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto lg:mx-0 font-sans-clean font-light leading-relaxed">
              {t.hero.subtitle}
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto px-8 py-4 rounded-lg bg-gradient-to-r from-[#D4AF37] via-[#DFBF58] to-[#AA7C11] text-black font-bold text-sm sm:text-base tracking-wider uppercase shadow-xl hover:shadow-[#D4AF37]/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.hero.ctaDiscover}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>

              <a
                href={generalWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-4 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/50 text-[#25D366] hover:text-white font-semibold text-sm sm:text-base tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:border-[#25D366]"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>{t.hero.ctaWhatsApp}</span>
              </a>
            </div>

            {/* Trust Highlights Grid */}
            <div className="pt-8 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans-clean">
              <div className="flex items-center gap-2.5 text-zinc-300 justify-center lg:justify-start">
                <div className="p-2 rounded-full bg-[#1A1A1E] text-[#D4AF37] border border-[#D4AF37]/20 shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <span className="font-medium text-left rtl:text-right">{t.hero.trustDelivery}</span>
              </div>

              <div className="flex items-center gap-2.5 text-zinc-300 justify-center lg:justify-start">
                <div className="p-2 rounded-full bg-[#1A1A1E] text-[#D4AF37] border border-[#D4AF37]/20 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-medium text-left rtl:text-right">{t.hero.trustCod}</span>
              </div>

              <div className="flex items-center gap-2.5 text-zinc-300 justify-center lg:justify-start">
                <div className="p-2 rounded-full bg-[#1A1A1E] text-[#D4AF37] border border-[#D4AF37]/20 shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <span className="font-medium text-left rtl:text-right">{t.hero.trustOriginal}</span>
              </div>

              <div className="flex items-center gap-2.5 text-zinc-300 justify-center lg:justify-start">
                <div className="p-2 rounded-full bg-[#1A1A1E] text-[#D4AF37] border border-[#D4AF37]/20 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="font-medium text-left rtl:text-right">{t.hero.trustSupport}</span>
              </div>
            </div>

          </div>

          {/* Right Column: Luxury Product Showcase Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer Golden Border Glow */}
              <div className="relative rounded-2xl p-1 bg-gradient-to-tr from-[#D4AF37] via-[#5C450C] to-[#D4AF37] shadow-2xl shadow-black/80">
                <div className="relative rounded-[14px] overflow-hidden bg-[#121214]">
                  <img
                    src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=85"
                    alt="Products Global Dz Haute Parfumerie"
                    className="w-full h-[400px] sm:h-[480px] object-cover object-center transform hover:scale-105 transition-transform duration-700"
                    loading="eager"
                  />
                  
                  {/* Glassmorphism Product Overlay Badge */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/75 backdrop-blur-md border border-[#D4AF37]/30 text-white flex items-center justify-between">
                    <div>
                      <span className="text-[10px] tracking-widest text-[#D4AF37] uppercase font-bold block">
                        Édition Limitée
                      </span>
                      <h3 className="font-serif-luxury text-base sm:text-lg font-bold text-white">
                        Oud Royal Sahara Intense
                      </h3>
                      <p className="text-xs text-zinc-300">
                        8 900 DA <span className="line-through text-zinc-500 text-[11px] ml-1">11 500 DA</span>
                      </p>
                    </div>

                    <button
                      onClick={onOrderClick}
                      className="px-3.5 py-2 rounded-lg bg-[#D4AF37] text-black font-semibold text-xs hover:bg-[#F3E5AB] transition-colors shrink-0"
                    >
                      Commander
                    </button>
                  </div>
                </div>
              </div>

              {/* Decorative Floating Luxury Pill & Brand Seal */}
              <div className="absolute -top-5 -left-4 sm:-left-6 bg-[#161619]/90 border border-[#D4AF37]/50 p-2 sm:px-3 sm:py-2 rounded-2xl shadow-2xl flex items-center gap-2.5 backdrop-blur-md">
                <div className="w-8 h-8 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-[#D4AF37] to-[#F3E5AB]">
                  <img src="/logo.png" alt="Logo Products Global Dz" className="w-full h-full object-cover rounded-full bg-black" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-bold block leading-none">Boutique Officielle</span>
                  <span className="text-[11px] text-zinc-300 font-medium">WhatsApp : +213 696 54 48 55</span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse sm:hidden" />
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
