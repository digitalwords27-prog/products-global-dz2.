import React from 'react';
import { 
  ShoppingBag, 
  MessageCircle, 
  Eye, 
  Check, 
  Star 
} from 'lucide-react';
import { Product, Language } from '../types';
import { TRANSLATIONS, generateWhatsAppLink } from '../i18n/translations';

interface ProductCardProps {
  product: Product;
  language: Language;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onDirectOrder: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  language,
  onAddToCart,
  onQuickView,
  onDirectOrder,
}) => {
  const t = TRANSLATIONS[language];
  const [addedAnimation, setAddedAnimation] = React.useState(false);

  // Localized title & description
  const productName = 
    (language === 'ar' && product.nameAr) ? product.nameAr :
    (language === 'en' && product.nameEn) ? product.nameEn : product.name;

  const productDesc = 
    (language === 'ar' && product.descriptionAr) ? product.descriptionAr :
    (language === 'en' && product.descriptionEn) ? product.descriptionEn : product.description;

  // Format price with space separator (e.g. 8 900 DA)
  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('fr-DZ').format(val);
  };

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  // Direct WhatsApp link for this product
  const whatsappUrl = generateWhatsAppLink({
    language,
    productName,
    price: product.price,
    quantity: 1,
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  return (
    <div 
      onClick={() => onQuickView(product)}
      className="group relative bg-[#121215] rounded-2xl border border-zinc-800/80 hover:border-[#D4AF37]/50 shadow-md hover:shadow-2xl hover:shadow-[#D4AF37]/5 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#18181C]">
        <img
          src={product.image}
          alt={productName}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none gap-1">
          <div className="flex flex-col gap-1 items-start">
            {discountPercent && (
              <span className="bg-[#D4AF37] text-black font-bold text-[10px] tracking-wider px-2 py-0.5 rounded shadow">
                -{discountPercent}%
              </span>
            )}
            {product.isNewArrival && (
              <span className="bg-emerald-600 text-white font-semibold text-[10px] px-2 py-0.5 rounded shadow">
                {t.product.new}
              </span>
            )}
            {product.isFeatured && !discountPercent && (
              <span className="bg-amber-600/90 text-white font-semibold text-[10px] px-2 py-0.5 rounded shadow">
                {t.product.featured}
              </span>
            )}
          </div>

          {!product.inStock && (
            <span className="bg-red-900/90 text-white text-[10px] px-2 py-0.5 rounded font-bold">
              {t.product.outOfStock}
            </span>
          )}
        </div>

        {/* Floating Quick View Eye Icon */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="p-3 rounded-full bg-black/80 text-[#D4AF37] border border-[#D4AF37]/40 backdrop-blur-sm transform translate-y-3 group-hover:translate-y-0 transition-transform">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        {/* Size / Volume Pill */}
        {product.volumeOrSize && (
          <span className="absolute bottom-2.5 right-2.5 rtl:right-auto rtl:left-2.5 bg-black/70 backdrop-blur-md text-[10px] text-zinc-300 px-2 py-0.5 rounded border border-zinc-700 font-sans-clean">
            {product.volumeOrSize}
          </span>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-1.5 text-xs text-amber-400">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${i < Math.floor(product.rating || 5) ? 'fill-current' : 'text-zinc-600'}`} 
                />
              ))}
            </div>
            <span className="text-[11px] text-zinc-400 font-sans-clean">
              {product.rating || 4.9} ({product.salesCount || 85})
            </span>
          </div>

          {/* Title */}
          <h3 className="font-serif-luxury text-base sm:text-lg font-bold text-white group-hover:text-[#F3E5AB] transition-colors line-clamp-1 leading-snug">
            {productName}
          </h3>

          {/* Description Snippet */}
          <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed font-sans-clean">
            {productDesc}
          </p>
        </div>

        {/* Price & Action Buttons */}
        <div className="pt-2 border-t border-zinc-800/80">
          
          {/* Price Block */}
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-lg sm:text-xl font-bold font-serif-luxury text-[#F3E5AB]">
                {formatPrice(product.price)} {t.product.da}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="line-through text-xs text-zinc-500 ml-2 rtl:mr-2 rtl:ml-0 font-sans-clean">
                  {formatPrice(product.originalPrice)} {t.product.da}
                </span>
              )}
            </div>
            {product.inStock ? (
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {t.product.inStock}
              </span>
            ) : null}
          </div>

          {/* Dual Action Buttons */}
          <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
            
            {/* 1. Direct WhatsApp Order Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Commander ce produit par WhatsApp"
              className="py-2.5 px-2 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-black border border-[#25D366]/40 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current shrink-0" />
              <span className="truncate">WhatsApp</span>
            </a>

            {/* 2. Add to Cart / Fast Form Button */}
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`py-2.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow ${
                addedAnimation
                  ? 'bg-emerald-600 text-white'
                  : product.inStock
                  ? 'bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-bold'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span className="truncate">Ajouté !</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{t.product.addToCart}</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
