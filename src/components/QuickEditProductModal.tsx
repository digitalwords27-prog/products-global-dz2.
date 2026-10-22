import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Check, 
  AlertCircle, 
  DollarSign, 
  Image as ImageIcon,
  ExternalLink,
  Sparkles,
  Package
} from 'lucide-react';
import { Product, Language } from '../types';
import { updateProduct } from '../services/storage';

interface QuickEditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onOpenFullAdmin: () => void;
  onProductUpdated: () => void;
}

export const QuickEditProductModal: React.FC<QuickEditProductModalProps> = ({
  product,
  isOpen,
  onClose,
  language,
  onOpenFullAdmin,
  onProductUpdated,
}) => {
  const [price, setPrice] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [inStock, setInStock] = useState<boolean>(true);
  const [nameAr, setNameAr] = useState<string>('');
  const [nameFr, setNameFr] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product && isOpen) {
      setPrice(product.price);
      setOriginalPrice(product.originalPrice);
      setImageUrl(product.image);
      setInStock(product.inStock);
      setNameAr(product.nameAr || '');
      setNameFr(product.name || '');
      setSavedSuccess(false);
      setErrorMessage('');
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  // Handle Image Upload (from phone gallery/camera or file picker)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setImageUrl(compressed);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || price <= 0) {
      setErrorMessage(language === 'ar' ? 'يرجى إدخال سعر صحيح للمنتج' : 'Veuillez saisir un prix valide');
      return;
    }
    if (!imageUrl) {
      setErrorMessage(language === 'ar' ? 'يرجى تحديد صورة للمنتج' : 'Veuillez sélectionner une image');
      return;
    }

    const updated: Product = {
      ...product,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      image: imageUrl,
      inStock,
      nameAr: nameAr || product.nameAr,
      name: nameFr || product.name,
    };

    updateProduct(updated);
    setSavedSuccess(true);
    setErrorMessage('');
    onProductUpdated();

    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-[#141418] border border-[#D4AF37]/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1C1C22] to-[#141418] border-b border-[#D4AF37]/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37]">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-serif-luxury text-base sm:text-lg font-bold text-white">
                {language === 'ar' ? 'تعديل سريع للمنتج (خاص بالمدير)' : 'Modification Rapide (Gérant)'}
              </h3>
              <p className="text-xs text-[#F3E5AB]">
                {product.nameAr || product.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {savedSuccess && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{language === 'ar' ? 'تم حفظ التعديلات بنجاح وتم تحديث المتجر فوراً!' : 'Modifications enregistrées avec succès !'}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-950/80 border border-red-500 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Image Preview & Upload */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">
              {language === 'ar' ? 'صورة المنتج الحالية :' : 'Image du Produit :'}
            </label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-xl border border-[#D4AF37]/40 bg-black/60 overflow-hidden shrink-0 flex items-center justify-center relative">
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-zinc-600" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#222129] border border-[#D4AF37]/40 text-xs font-semibold text-[#F3E5AB] hover:bg-[#D4AF37]/20 transition flex items-center justify-center gap-2 cursor-pointer shadow"
                >
                  <Upload className="w-4 h-4 text-[#D4AF37]" />
                  <span>{language === 'ar' ? 'رفع صورة جديدة من الهاتف' : 'Changer photo (Galerie)'}</span>
                </button>

                <input
                  type="url"
                  placeholder={language === 'ar' ? 'أو ضع رابط صورة مباشر (URL)' : 'Ou collez une URL d\'image'}
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-black/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Price Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                {language === 'ar' ? 'سعر البيع الحالي (د.ج) *' : 'Prix de Vente Actuel (DA) *'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2.5 bg-black/50 border border-[#D4AF37]/60 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-[#D4AF37]"
                />
                <span className="absolute right-3 rtl:right-auto rtl:left-3 top-2.5 text-xs text-[#D4AF37] font-bold">
                  DA
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                {language === 'ar' ? 'السعر القديم قبل التخفيض (اختياري)' : 'Ancien Prix Barré (Optionnel)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={originalPrice || ''}
                  placeholder="Ex: 9500"
                  onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2.5 bg-black/50 border border-zinc-700 rounded-xl text-zinc-300 text-sm focus:outline-none focus:border-[#D4AF37]"
                />
                <span className="absolute right-3 rtl:right-auto rtl:left-3 top-2.5 text-xs text-zinc-500 font-bold">
                  DA
                </span>
              </div>
            </div>
          </div>

          {/* 3. Availability Toggle */}
          <div className="p-3 rounded-xl bg-[#18181F] border border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-200">
              {language === 'ar' ? 'حالة توفر المنتج في المخزون :' : 'Disponibilité en stock :'}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              <span className="ml-3 rtl:mr-3 rtl:ml-0 text-xs font-bold text-white">
                {inStock 
                  ? (language === 'ar' ? 'متوفر' : 'En stock') 
                  : (language === 'ar' ? 'نفذت الكمية' : 'Épuisé')}
              </span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-black font-bold text-sm hover:from-[#F3E5AB] hover:to-[#D4AF37] transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{language === 'ar' ? 'حفظ التعديلات فوراً' : 'Enregistrer immédiatement'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFullAdmin();
              }}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'لوحة التحكم الكاملة' : 'Tableau complet'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
