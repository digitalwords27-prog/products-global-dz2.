import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Language } from '../types';
import { generateWhatsAppLink } from '../i18n/translations';

interface FloatingWhatsAppProps {
  language: Language;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ language }) => {
  const [showTooltip, setShowTooltip] = useState(true);
  const whatsappUrl = generateWhatsAppLink({ language });

  const tooltipText = 
    language === 'ar' ? 'طلب فوري واستفسار عبر واتساب' :
    language === 'en' ? 'Quick order & chat on WhatsApp' :
    'Commander ou poser une question sur WhatsApp';

  return (
    <div className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-40 flex flex-col items-end rtl:items-start group">
      
      {/* Speech Bubble Tooltip */}
      {showTooltip && (
        <div className="mb-2 bg-[#141417] text-white text-xs py-1.5 px-3 rounded-xl border border-[#25D366]/40 shadow-xl flex items-center gap-2 animate-bounce-subtle">
          <span className="w-2 h-2 rounded-full bg-[#25D366] shrink-0" />
          <span className="font-medium text-[11px] font-sans-clean">{tooltipText}</span>
          <button 
            onClick={() => setShowTooltip(false)} 
            className="text-zinc-500 hover:text-white p-0.5"
            aria-label="Fermer infobulle"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Discuter sur WhatsApp (+213 696 54 48 55)"
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-black shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 ring-4 ring-[#25D366]/20"
      >
        <span className="absolute -top-1 -right-1 rtl:-right-auto rtl:-left-1 w-4 h-4 bg-[#D4AF37] text-black text-[9px] font-bold rounded-full flex items-center justify-center shadow">
          1
        </span>
        <MessageCircle className="w-7 h-7 fill-current" />
      </a>
    </div>
  );
};
