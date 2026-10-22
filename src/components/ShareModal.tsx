import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  QrCode, 
  Download, 
  Globe, 
  Smartphone, 
  Sparkles, 
  ExternalLink,
  MessageCircle,
  Instagram
} from 'lucide-react';
import QRCode from 'qrcode';
import { Language } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Determine current active URL or default to the live production domain
  const defaultDomain = 'https://products-global-dz2.vercel.app';
  const currentUrl = typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost') && !window.location.origin.includes('run.app')
    ? window.location.origin
    : defaultDomain;

  // Generate QR Code on canvas
  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(currentUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FBF9F3'
        }
      })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('QR code generation error:', err);
      });
    }
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, typeKey: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedType(typeKey);
      setTimeout(() => setCopiedType(null), 2500);
    } else {
      // Fallback
      const input = document.createElement('textarea');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedType(typeKey);
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  const downloadQrCode = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = 'products-global-dz-qrcode.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Products Global Dz',
          text: 'متجر Products Global Dz - أرقى العطور والساعات ومستحضرات التجميل العالمية في الجزائر مع التوصيل لـ 58 ولاية',
          url: currentUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      copyToClipboard(currentUrl, 'native_url');
    }
  };

  const instagramBioText = `✨ Products Global Dz 🇩🇿\n💎 أفخر العطور الأصلية | ساعات راقية | مستحضرات تجميل عالمية\n🚚 توصيل سريع لجميع الولايات والدفع عند الاستلام\n👇 تسوق واطلب مباشرة من متجرنا:\n${currentUrl}`;

  const facebookPostText = `🛍️ مرحباً بكم في متجر Products Global Dz!\nيسعدنا خدمتكم بأفضل تشكيلة من العطور العالمية، مستحضرات التجميل، والساعات الفاخرة.\n🚚 توصيل سريع متوفر لـ 58 ولاية.\n💵 الدفع نقداً عند استلام طلبيتك.\n🔗 تصفح المتجر واطلب الآن عبر الرابط:\n${currentUrl}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-[#0F0F13] border border-[#D4AF37]/50 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/90 overflow-hidden my-auto text-[#F5F2EB]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="bg-gradient-to-r from-[#17171C] via-[#24231E] to-[#17171C] p-4 sm:p-6 border-b border-[#D4AF37]/25 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#8C6D1F] p-0.5 shadow-md flex items-center justify-center text-black">
              <Share2 className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-serif-luxury text-[#F3E5AB]">
                {language === 'ar' ? 'رابط المتجر ونشره على صفحاتك' : 'Lien de la boutique & Réseaux sociaux'}
              </h3>
              <p className="text-xs text-zinc-400">
                {language === 'ar' ? 'ضع الرابط في بايو إنستغرام، تيك توك، وصفحة فيسبوك' : 'Copiez le lien pour votre bio Instagram, TikTok et page Facebook'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/80 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto font-sans-clean">
          
          {/* Main Store Link Box */}
          <div className="p-4 rounded-2xl bg-[#141419] border border-[#D4AF37]/30 shadow-inner">
            <div className="flex items-center justify-between gap-2 mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'الرابط المباشر لمتجرك الرسمي' : 'Lien direct officiel'}</span>
              </label>
              <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                ● {language === 'ar' ? 'شغال ومفعل 24/7' : 'En ligne 24/7'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 bg-black/60 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm font-mono text-[#F3E5AB] select-all break-all flex items-center gap-2">
                <span className="text-zinc-500 text-xs select-none">🌐</span>
                <span className="font-semibold">{currentUrl}</span>
              </div>

              <button
                onClick={() => copyToClipboard(currentUrl, 'main_url')}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shrink-0 ${
                  copiedType === 'main_url'
                    ? 'bg-emerald-500 text-black shadow-emerald-500/25 scale-102'
                    : 'bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-black hover:from-[#F3E5AB] hover:to-[#D4AF37]'
                }`}
              >
                {copiedType === 'main_url' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{language === 'ar' ? 'تم النسخ بنجاح!' : 'Copié !'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>{language === 'ar' ? 'نسخ الرابط' : 'Copier'}</span>
                  </>
                )}
              </button>
            </div>
            
            {copiedType === 'main_url' && (
              <p className="mt-2 text-xs text-emerald-400 font-medium animate-fade-in flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'تم نسخ الرابط إلى الحافظة! يمكنك الآن لصقه مباشرة في صفحاتك.' : 'Lien copié dans le presse-papier !'}</span>
              </p>
            )}
          </div>

          {/* Quick Share to Social Apps */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{language === 'ar' ? 'مشاركة فورية بنقرة واحدة' : 'Partage rapide en 1 clic'}</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent('✨ متجر Products Global Dz - تفضل بزيارة متجرنا:\n' + currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] hover:border-[#25D366] transition-all flex flex-col items-center justify-center gap-1.5 text-center group"
              >
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">{language === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
              </a>

              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] hover:border-[#1877F2] transition-all flex flex-col items-center justify-center gap-1.5 text-center group"
              >
                <svg className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-xs font-bold">{language === 'ar' ? 'فيسبوك' : 'Facebook'}</span>
              </a>

              {/* Telegram */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent('Products Global Dz - متجر العطور والساعات الفاخرة')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-[#229ED9]/10 hover:bg-[#229ED9]/20 border border-[#229ED9]/30 text-[#229ED9] hover:border-[#229ED9] transition-all flex flex-col items-center justify-center gap-1.5 text-center group"
              >
                <svg className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                <span className="text-xs font-bold">{language === 'ar' ? 'تيليغرام' : 'Telegram'}</span>
              </a>

              {/* Native Mobile Share */}
              <button
                onClick={handleNativeShare}
                className="p-3 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#F3E5AB] hover:border-[#D4AF37] transition-all flex flex-col items-center justify-center gap-1.5 text-center group cursor-pointer"
              >
                <Smartphone className="w-5 h-5 group-hover:scale-110 transition-transform text-[#D4AF37]" />
                <span className="text-xs font-bold">{language === 'ar' ? 'مشاركة بالهاتف' : 'Partager'}</span>
              </button>
            </div>
          </div>

          {/* Copy Ready Bio for Instagram & TikTok */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Instagram className="w-3.5 h-3.5 text-pink-400" />
              <span>{language === 'ar' ? 'قوالب جاهزة للنسخ في البايو والصفحات' : 'Textes prêts à coller dans votre Bio'}</span>
            </h4>

            {/* Template 1: Instagram / TikTok Bio */}
            <div className="p-4 rounded-xl bg-[#141419] border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#F3E5AB] flex items-center gap-1">
                  <span>📌 {language === 'ar' ? 'نص احترافي لبايو إنستغرام وتيك توك (Instagram / TikTok Bio):' : 'Pour Bio Instagram & TikTok :'}</span>
                </span>
                <button
                  onClick={() => copyToClipboard(instagramBioText, 'bio_template')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    copiedType === 'bio_template'
                      ? 'bg-emerald-500 text-black'
                      : 'bg-[#D4AF37]/20 text-[#F3E5AB] hover:bg-[#D4AF37] hover:text-black'
                  }`}
                >
                  {copiedType === 'bio_template' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedType === 'bio_template' ? (language === 'ar' ? 'تم نسخ النص!' : 'Copié !') : (language === 'ar' ? 'نسخ النص' : 'Copier')}</span>
                </button>
              </div>

              <pre className="text-xs font-sans text-zinc-300 bg-black/50 p-3 rounded-lg whitespace-pre-wrap border border-zinc-800 leading-relaxed font-arabic-cairo">
                {instagramBioText}
              </pre>
            </div>

            {/* Template 2: Facebook Post Template */}
            <div className="p-4 rounded-xl bg-[#141419] border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#F3E5AB] flex items-center gap-1">
                  <span>📢 {language === 'ar' ? 'نص إعلاني لمنشور فيسبوك أو واتساب:' : 'Texte pour publication Facebook / WhatsApp :'}</span>
                </span>
                <button
                  onClick={() => copyToClipboard(facebookPostText, 'fb_template')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    copiedType === 'fb_template'
                      ? 'bg-emerald-500 text-black'
                      : 'bg-[#D4AF37]/20 text-[#F3E5AB] hover:bg-[#D4AF37] hover:text-black'
                  }`}
                >
                  {copiedType === 'fb_template' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedType === 'fb_template' ? (language === 'ar' ? 'تم نسخ النص!' : 'Copié !') : (language === 'ar' ? 'نسخ النص' : 'Copier')}</span>
                </button>
              </div>

              <pre className="text-xs font-sans text-zinc-300 bg-black/50 p-3 rounded-lg whitespace-pre-wrap border border-zinc-800 leading-relaxed font-arabic-cairo">
                {facebookPostText}
              </pre>
            </div>
          </div>

          {/* QR Code Section for Packaging & Printing */}
          <div className="p-4 rounded-2xl bg-[#141419] border border-[#D4AF37]/30 flex flex-col sm:flex-row items-center gap-5">
            {qrDataUrl ? (
              <div className="p-2 bg-white rounded-xl shadow-lg shrink-0">
                <img 
                  src={qrDataUrl} 
                  alt="QR Code Products Global Dz" 
                  className="w-36 h-36 object-contain"
                />
              </div>
            ) : (
              <div className="w-36 h-36 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                <QrCode className="w-10 h-10 text-zinc-600 animate-pulse" />
              </div>
            )}

            <div className="flex-1 space-y-2.5 text-center sm:text-left rtl:sm:text-right">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-sm font-bold text-[#F3E5AB]">
                <QrCode className="w-4 h-4 text-[#D4AF37]" />
                <span>{language === 'ar' ? 'رمز QR Code لطباعته على الملصقات وعلب التوصيل' : 'Code QR pour vos emballages et cartes'}</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {language === 'ar' 
                  ? 'يمكن لزبائنك مسح الرمز بكاميرا الهاتف لفتح متجرك مباشرة! مناسب جداً لطباعته على بطاقات العمل (Cartes de visite) أو ملصقات العلب والطرود.' 
                  : 'Vos clients peuvent scanner ce QR code avec leur appareil photo pour accéder directement à la boutique.'}
              </p>

              <button
                onClick={downloadQrCode}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-[#D4AF37] text-zinc-200 hover:text-black border border-zinc-700 hover:border-[#D4AF37] font-semibold text-xs transition-all cursor-pointer shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'تحميل صورة الرمز (PNG)' : 'Télécharger le code QR (PNG)'}</span>
              </button>
            </div>
          </div>

          {/* Instructions on How to Add Link to Instagram & Facebook */}
          <div className="p-4 rounded-xl bg-[#111115] border border-zinc-800/80 space-y-3">
            <h5 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
              <span>💡 {language === 'ar' ? 'طريقة وضع الرابط في حساباتك خطوة بخطوة:' : 'Comment ajouter le lien à vos profils :'}</span>
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-zinc-300">
              <div className="p-3 rounded-lg bg-black/40 border border-zinc-800 space-y-1.5">
                <span className="font-bold text-white flex items-center gap-1">
                  📸 {language === 'ar' ? 'في إنستغرام (Instagram):' : 'Sur Instagram :'}
                </span>
                <ol className="list-decimal list-inside space-y-1 text-zinc-400 text-[11px] leading-relaxed">
                  <li>{language === 'ar' ? 'ادخل لحسابك واضغط "Edit Profile" (تعديل الملف الشخصي)' : 'Cliquez sur Modifier le profil'}</li>
                  <li>{language === 'ar' ? 'اختر "Links" (الروابط) ثم "Add external link" (إضافة رابط خارجي)' : 'Sélectionnez Liens > Ajouter un lien externe'}</li>
                  <li>{language === 'ar' ? 'ألصق الرابط وضع عنوان المتجر: Products Global Dz' : 'Collez le lien et validez'}</li>
                </ol>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-zinc-800 space-y-1.5">
                <span className="font-bold text-white flex items-center gap-1">
                  📘 {language === 'ar' ? 'في صفحة فيسبوك (Facebook):' : 'Sur Facebook :'}
                </span>
                <ol className="list-decimal list-inside space-y-1 text-zinc-400 text-[11px] leading-relaxed">
                  <li>{language === 'ar' ? 'ادخل لصفحتك واضغط "تعديل زر الإجراء" (Action Button)' : 'Cliquez sur Modifier le bouton d\'action'}</li>
                  <li>{language === 'ar' ? 'اختر "تسوق الآن" (Shop Now) أو "عرض موقع الويب"' : 'Choisissez Acheter ou Visiter le site web'}</li>
                  <li>{language === 'ar' ? 'ألصق الرابط واضغط حفظ ليظهر للزبائن مباشرة' : 'Collez votre lien et enregistrez'}</li>
                </ol>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-[#121217] p-4 border-t border-[#D4AF37]/20 flex items-center justify-between">
          <span className="text-xs text-zinc-500 font-mono">
            products-global-dz2.vercel.app
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition cursor-pointer"
          >
            {language === 'ar' ? 'إغلاق' : 'Fermer'}
          </button>
        </div>
      </div>
    </div>
  );
};
