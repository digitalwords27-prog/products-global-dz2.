import React from 'react';
import { MessageCircle, CheckCircle, Sparkles, Send, PhoneCall } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS, generateWhatsAppLink } from '../i18n/translations';

interface WhatsAppVIPSectionProps {
  language: Language;
}

export const WhatsAppVIPSection: React.FC<WhatsAppVIPSectionProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const whatsappUrl = generateWhatsAppLink({ language });

  const steps = [
    {
      num: '01',
      title: t.whatsappSection.step1Title,
      description: t.whatsappSection.step1Desc,
    },
    {
      num: '02',
      title: t.whatsappSection.step2Title,
      description: t.whatsappSection.step2Desc,
    },
    {
      num: '03',
      title: t.whatsappSection.step3Title,
      description: t.whatsappSection.step3Desc,
    },
  ];

  return (
    <section id="whatsapp-vip" className="py-16 bg-gradient-to-b from-[#0E0E10] via-[#111612] to-[#0E0E10] border-t border-zinc-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="rounded-3xl bg-gradient-to-br from-[#131E15] via-[#111612] to-[#121215] border border-[#25D366]/30 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#25D366]/10 rounded-full blur-3xl pointer-events-none -z-0" />
          
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] text-xs font-bold uppercase tracking-wider mb-4">
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>{t.whatsappSection.badge}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-white mb-3">
              {t.whatsappSection.title}
            </h2>

            <p className="text-sm sm:text-base text-zinc-300 mb-8 font-sans-clean">
              {t.whatsappSection.subtitle}
            </p>

            {/* 3 Step Process Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-left rtl:text-right">
              {steps.map((st, idx) => (
                <div 
                  key={idx}
                  className="p-5 rounded-2xl bg-black/40 border border-zinc-800 backdrop-blur-sm relative"
                >
                  <span className="text-2xl font-serif-luxury font-bold text-[#D4AF37] block mb-2 opacity-90">
                    {st.num}
                  </span>
                  <h4 className="text-sm font-bold text-white mb-1.5">
                    {st.title}
                  </h4>
                  <p className="text-xs text-zinc-400 font-sans-clean leading-relaxed">
                    {st.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Action CTA with WhatsApp hotline number */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-bold text-sm sm:text-base tracking-wide transition-all shadow-xl hover:shadow-[#25D366]/20 flex items-center justify-center gap-3 cursor-pointer transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>{t.whatsappSection.btnChat}</span>
              </a>

              <a
                href="tel:+213696544855"
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#1C1C22] hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-[#D4AF37]" />
                <span>Appel direct : 0696 54 48 55</span>
              </a>
            </div>

            <p className="text-[11px] text-zinc-500 mt-4">
              Disponible 7 jours sur 7 de 09h00 à 22h00 pour vous conseiller et prendre vos commandes.
            </p>

          </div>

        </div>

      </div>
    </section>
  );
};
