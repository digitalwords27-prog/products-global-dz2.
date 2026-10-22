import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Eye, EyeOff, ShieldAlert, KeyRound, CheckCircle2, MessageCircle, AlertTriangle } from 'lucide-react';
import { Language } from '../types';
import { 
  verifySiteLockKey, 
  getRemainingLockoutSeconds, 
  unlockSiteSession 
} from '../services/storage';

interface SiteLockScreenProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onUnlockSuccess: () => void;
  onOpenAdminDirect: () => void;
}

export const SiteLockScreen: React.FC<SiteLockScreenProps> = ({
  language,
  onLanguageChange,
  onUnlockSuccess,
  onOpenAdminDirect,
}) => {
  const [accessKey, setAccessKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

  // Check lockout on mount and tick
  useEffect(() => {
    const checkLockout = () => {
      const remaining = getRemainingLockoutSeconds();
      setLockoutRemaining(remaining);
      if (remaining > 0) {
        setErrorMsg(
          language === 'ar'
            ? `تم تجميد الدخول لأسباب أمنية. يرجى الانتظار ${remaining} ثانية.`
            : `Accès temporairement bloqué par sécurité. Veuillez patienter ${remaining} secondes.`
        );
      }
    };

    checkLockout();
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          setErrorMsg('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [language]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemaining > 0) return;
    setErrorMsg('');

    const res = verifySiteLockKey(accessKey);
    if (res.success) {
      onUnlockSuccess();
    } else {
      if (res.locked) {
        setLockoutRemaining(res.remainingSeconds || 300);
        setErrorMsg(
          language === 'ar'
            ? `⚠️ تم تجاوز الحد الأقصى للمحاولات! تم تجميد الدخول لمدة 5 دقائق للحماية من الاختراق.`
            : `⚠️ Trop de tentatives infructueuses ! Accès bloqué pendant 5 minutes par sécurité.`
        );
      } else {
        setAttemptsRemaining(res.attemptsLeft ?? 0);
        setErrorMsg(
          language === 'ar'
            ? `كلمة المرور غير صحيحة. متبقي ${res.attemptsLeft} محاولة قبل التجميد المؤقت.`
            : `Mot de passe incorrect. Il vous reste ${res.attemptsLeft} tentative(s) avant verrouillage.`
        );
      }
    }
  };

  const isRtl = language === 'ar';

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#0B0B0C] flex flex-col justify-between overflow-y-auto px-4 py-8 sm:p-12 text-[#F5F2EB]"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Top Bar: Brand Badge & Language Toggle */}
      <div className="w-full max-w-xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
            {language === 'ar' ? 'وضع الحماية المشددة' : 'Accès Sécurisé Restreint'}
          </span>
        </div>

        <button
          onClick={() => onLanguageChange(language === 'ar' ? 'fr' : 'ar')}
          className="text-xs px-3 py-1.5 rounded-lg bg-[#16161A] border border-[#D4AF37]/30 text-[#F3E5AB] hover:border-[#D4AF37] transition-all font-semibold"
        >
          {language === 'ar' ? 'Français' : 'العربية'}
        </button>
      </div>

      {/* Main Lock Card */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="relative bg-[#121215] border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 text-center">
          
          {/* Glowing Aura Accent */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-[#D4AF37]/15 rounded-full blur-2xl pointer-events-none" />

          {/* Brand Logo & Lock Shield */}
          <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full p-0.5 bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#8C6D1F] shadow-lg shadow-[#D4AF37]/25 flex items-center justify-center mb-5">
            <img
              src="/logo.png"
              alt="Products Global Dz"
              className="w-full h-full object-cover rounded-full bg-black"
            />
            <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-black border border-[#D4AF37] text-[#D4AF37] shadow">
              <Lock className="w-4 h-4" />
            </div>
          </div>

          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold tracking-wider gold-gradient-text mb-2">
            Products Global Dz
          </h1>

          <div className="inline-block px-3 py-1 rounded-full bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs font-semibold mb-4">
            {language === 'ar' ? '🔐 متجر خاص — وصول مخصص للمدير والمصرح لهم' : '🔐 Espace Privé — Accès Réservé'}
          </div>

          <p className="text-xs text-zinc-400 font-sans-clean leading-relaxed mb-6">
            {language === 'ar'
              ? 'المتجر مغلق حالياً بكلمة مرور رئيسية بناءً على إعدادات الأمان. إذا كنت صاحب المتجر أو مدعواً لتصفحه، يرجى إدخال مفتاح الوصول.'
              : 'La boutique est actuellement verrouillée par mesure de sécurité. Si vous êtes le gérant ou un visiteur autorisé, veuillez entrer la clé d\'accès.'}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left rtl:text-right">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                {language === 'ar' ? 'مفتاح المرور السري / كلمة المرور :' : 'Clé secrète / Mot de passe :'}
              </label>

              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  required
                  disabled={lockoutRemaining > 0}
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  placeholder={language === 'ar' ? 'أدخل كلمة المرور...' : 'Entrez le mot de passe...'}
                  className="w-full bg-[#18181C] border border-[#D4AF37]/40 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 transition-all font-mono tracking-wider disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute top-1/2 -translate-y-1/2 end-3 text-zinc-400 hover:text-white p-1"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error or Lockout notification */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-start gap-2 animate-shake">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <div className="flex-1 leading-snug font-sans-clean">
                  {errorMsg}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={lockoutRemaining > 0 || !accessKey.trim()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B38728] text-black font-bold text-sm tracking-wide uppercase hover:opacity-95 active:scale-98 transition-all shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>
                {lockoutRemaining > 0
                  ? (language === 'ar' ? `انتظر (${lockoutRemaining} ثانية)` : `Patientez (${lockoutRemaining}s)`)
                  : (language === 'ar' ? 'فتح المتجر والدخول' : 'Déverrouiller la Boutique')}
              </span>
            </button>
          </form>

          {/* Quick link for Owner */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80 flex flex-col items-center gap-2">
            <button
              onClick={onOpenAdminDirect}
              className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>
                {language === 'ar'
                  ? 'هل أنت صاحب المتجر؟ افتح لوحة التحكم مباشرة'
                  : 'Vous êtes le gérant ? Accéder directement à l\'administration'}
              </span>
            </button>

            <a
              href="https://wa.me/213696544855"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-zinc-500 hover:text-[#25D366] transition-colors flex items-center gap-1 mt-1"
            >
              <MessageCircle className="w-3 h-3 text-[#25D366]" />
              <span>WhatsApp : +213 696 54 48 55</span>
            </a>
          </div>

        </div>
      </div>

      {/* Bottom Footer Mention */}
      <div className="w-full max-w-xl mx-auto text-center text-[11px] text-zinc-600">
        © {new Date().getFullYear()} Products Global Dz • Algérie (69 Wilayas) • Protection Cryptographique Anti-Intrusion
      </div>
    </div>
  );
};
