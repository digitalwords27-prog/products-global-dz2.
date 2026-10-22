import React from 'react';
import { 
  Truck, 
  Banknote, 
  ShieldCheck, 
  Headphones, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface WhyChooseUsProps {
  language: Language;
}

export const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ language }) => {
  const t = TRANSLATIONS[language];

  const benefits = [
    {
      icon: Truck,
      title: t.whyUs.item1Title,
      description: t.whyUs.item1Desc,
      tag: '58 Wilayas',
    },
    {
      icon: Banknote,
      title: t.whyUs.item2Title,
      description: t.whyUs.item2Desc,
      tag: 'Paiement à la réception',
    },
    {
      icon: ShieldCheck,
      title: t.whyUs.item3Title,
      description: t.whyUs.item3Desc,
      tag: '100% Authentique',
    },
    {
      icon: Headphones,
      title: t.whyUs.item4Title,
      description: t.whyUs.item4Desc,
      tag: 'WhatsApp 7j/7',
    },
  ];

  return (
    <section id="why-us" className="py-16 bg-[#0E0E11] border-t border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18181C] border border-[#D4AF37]/30 text-xs font-semibold text-[#D4AF37] mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nos Engagements d'Excellence</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-white mb-3">
            {t.whyUs.title}
          </h2>
          <p className="text-sm text-zinc-400 font-sans-clean">
            {t.whyUs.subtitle}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div
                key={idx}
                className="relative bg-[#141417] border border-zinc-800/80 hover:border-[#D4AF37]/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#1C1C22] border border-[#D4AF37]/25 flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-[#F3E5AB]">
                      {benefit.tag}
                    </span>
                  </div>

                  <h3 className="font-serif-luxury text-lg font-bold text-white mb-2 group-hover:text-[#F3E5AB] transition-colors">
                    {benefit.title}
                  </h3>

                  <p className="text-xs text-zinc-400 leading-relaxed font-sans-clean">
                    {benefit.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-zinc-800/60 flex items-center gap-1.5 text-[11px] text-[#D4AF37]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Garantie Products Global Dz</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
