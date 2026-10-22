import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  MessageCircle, 
  Truck, 
  ShieldCheck, 
  Plus, 
  Minus, 
  Check, 
  Star, 
  Share2,
  FileText
} from 'lucide-react';
import { Product, Language } from '../types';
import { TRANSLATIONS, generateWhatsAppLink } from '../i18n/translations';

interface ProductDetailModalProps {
  product: Product | null;
  language: Language;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onOrderDirectInForm: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  language,
  onClose,
  onAddToCart,
  onOrderDirectInForm,
}) => {
  if (!product) return null;

  const t = TRANSLATIONS[language];
  const [quantity, setQuantity] = useState(1);
  const [selectedImg, setSelectedImg] = useState(product.image);
  const [added, setAdded] = useState(false);

  // Localized title & description
  const productName = 
    (language === 'ar' && product.nameAr) ? product.nameAr :
    (language === 'en' && product.nameEn) ? product.nameEn : product.name;

  const productDesc = 
    (language === 'ar' && product.descriptionAr) ? product.descriptionAr :
    (language === 'en' && product.descriptionEn) ? product.descriptionEn : product.description;

  const formatPrice = (val: number) => new Intl.NumberFormat('fr-DZ').format(val);

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const whatsappUrl = generateWhatsAppLink({
    language,
    productName,
    price: product.price,
    quantity,
  });

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const allImages = [product.image, ...(product.secondaryImages || [])];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-[#121215] border border-[#D4AF37]/30 rounded-2xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-10 p-2 rounded-full bg-black/60 text-zinc-300 hover:text-white hover:bg-black/90 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Column: Image gallery */}
          <div className="p-4 sm:p-6 bg-[#0E0E10] flex flex-col items-center justify-between border-b md:border-b-0 md:border-r md:rtl:border-r-0 md:rtl:border-l border-zinc-800">
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
              <img
                src={selectedImg}
                alt={productName}
                className="w-full h-full object-cover object-center"
              />
              {discountPercent && (
                <span className="absolute top-3 left-3 bg-[#D4AF37] text-black font-bold text-xs px-2.5 py-1 rounded shadow">
                  -{discountPercent}% {t.product.save}
                </span>
              )}
            </div>

            {/* Thumbnail switcher if multiple images */}
            {allImages.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto w-full pb-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImg(img)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImg === img ? 'border-[#D4AF37]' : 'border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Aperçu" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Wilaya delivery promise footer */}
            <div className="w-full mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400 font-sans-clean">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#D4AF37]" />
                {language === 'ar' ? 'توصيل 69 ولاية' : 'Livraison 69 Wilayas'}
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                Paiement à la livraison
              </span>
            </div>
          </div>

          {/* Right Column: Information & Actions */}
          <div className="p-5 sm:p-8 flex flex-col justify-between space-y-5">
            <div>
              {/* Category & Status */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                  {t.categoriesSection[product.category as keyof typeof t.categoriesSection] || 'Collection Prestige'}
                </span>
                {product.inStock ? (
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {t.product.inStock}
                  </span>
                ) : (
                  <span className="text-xs text-red-400 font-medium">{t.product.outOfStock}</span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-serif-luxury font-bold text-white mb-2">
                {productName}
              </h2>

              {/* Rating and Volume */}
              <div className="flex items-center gap-4 text-xs text-zinc-400 mb-4 font-sans-clean">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold text-white">{product.rating || 4.9}</span>
                  <span className="text-zinc-500">({product.salesCount || 100}+ vendus)</span>
                </div>
                {product.volumeOrSize && (
                  <span className="bg-zinc-800 text-zinc-200 px-2 py-0.5 rounded text-[11px]">
                    {product.volumeOrSize}
                  </span>
                )}
              </div>

              {/* Price display */}
              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 mb-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-bold font-serif-luxury text-[#F3E5AB]">
                    {formatPrice(product.price)} {t.product.da}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="line-through text-sm text-zinc-500 font-sans-clean">
                      {formatPrice(product.originalPrice)} {t.product.da}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Prix en Dinars Algériens. Paiement en espèces lors de la réception de votre colis.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2 mb-4">
                <h4 className="text-xs uppercase tracking-wider text-zinc-400 font-semibold font-sans-clean">
                  Description du produit :
                </h4>
                <p className="text-sm text-zinc-300 leading-relaxed font-sans-clean whitespace-pre-line">
                  {productDesc}
                </p>
              </div>

              {/* Quantity selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-xs font-semibold text-zinc-300">{t.product.quantity}</span>
                <div className="flex items-center bg-[#1A1A1E] border border-zinc-700 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-zinc-400 hover:text-white transition-colors"
                    aria-label="Diminuer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-zinc-400 hover:text-white transition-colors"
                    aria-label="Augmenter"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs text-zinc-400 font-sans-clean">
                  Total : <strong className="text-[#F3E5AB]">{formatPrice(product.price * quantity)} {t.product.da}</strong>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2 border-t border-zinc-800">
              
              {/* WhatsApp VIP Direct Order */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>{t.product.orderWhatsApp}</span>
              </a>

              <div className="grid grid-cols-2 gap-2">
                {/* Add to cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`py-3 px-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : product.inStock
                      ? 'bg-[#1E1E24] hover:bg-zinc-800 text-[#F3E5AB] border border-[#D4AF37]/40'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Ajouté au panier</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                      <span>{t.product.addToCart}</span>
                    </>
                  )}
                </button>

                {/* Direct Order in Form */}
                <button
                  onClick={() => {
                    onOrderDirectInForm(product, quantity);
                    onClose();
                  }}
                  className="py-3 px-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] hover:from-[#F3E5AB] hover:to-[#D4AF37] text-black font-bold text-xs transition-all flex items-center justify-center gap-2 shadow"
                >
                  <FileText className="w-4 h-4" />
                  <span>Remplir le Bon</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
