import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  MessageCircle, 
  FileText, 
  ArrowRight,
  Truck
} from 'lucide-react';
import { CartItem, Language } from '../types';
import { TRANSLATIONS, generateWhatsAppLink } from '../i18n/translations';
import { ALGERIA_WILAYAS } from '../data/wilayas';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  language: Language;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToOrderForm: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  language,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToOrderForm,
}) => {
  const t = TRANSLATIONS[language];
  const [selectedWilayaCode, setSelectedWilayaCode] = useState('16'); // Default Alger

  if (!isOpen) return null;

  const formatPrice = (val: number) => new Intl.NumberFormat('fr-DZ').format(val);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const selectedWilaya = ALGERIA_WILAYAS.find((w) => w.code === selectedWilayaCode) || ALGERIA_WILAYAS[15];
  const estimatedTotal = subtotal + selectedWilaya.homeDeliveryFee;

  const whatsappOrderUrl = generateWhatsAppLink({
    language,
    cartItems: cartItems.map((ci) => ({
      name: (language === 'ar' && ci.product.nameAr) ? ci.product.nameAr : ci.product.name,
      price: ci.product.price,
      quantity: ci.quantity,
    })),
    wilaya: language === 'ar' ? selectedWilaya.nameAr : selectedWilaya.name,
    total: estimatedTotal,
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm animate-fade-in flex justify-end rtl:justify-start">
      <div 
        className="w-full max-w-md bg-[#121215] border-l rtl:border-l-0 rtl:border-r border-[#D4AF37]/30 h-full flex flex-col shadow-2xl animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Cart Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-[#151519]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="font-serif-luxury text-lg font-bold text-white">
              {t.cart.title} ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length > 0 ? (
            cartItems.map((item) => {
              const productName = (language === 'ar' && item.product.nameAr) ? item.product.nameAr : item.product.name;
              return (
                <div
                  key={item.product.id}
                  className="p-3 rounded-xl bg-[#18181C] border border-zinc-800 flex items-center gap-3"
                >
                  <img
                    src={item.product.image}
                    alt={productName}
                    className="w-16 h-16 rounded-lg object-cover border border-zinc-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">
                      {productName}
                    </h4>
                    <span className="text-xs text-[#F3E5AB] font-bold block mt-0.5">
                      {formatPrice(item.product.price)} {t.product.da}
                    </span>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center bg-black/40 border border-zinc-700 rounded-md">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-zinc-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-6 text-center text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-zinc-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-[11px] text-zinc-400">
                        = {formatPrice(item.product.price * item.quantity)} {t.product.da}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
              <ShoppingBag className="w-16 h-16 text-zinc-700 mb-3" />
              <h4 className="font-serif-luxury text-base font-bold text-white mb-1">
                {t.cart.emptyTitle}
              </h4>
              <p className="text-xs text-zinc-500 max-w-xs mb-5">
                {t.cart.emptySubtitle}
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg bg-[#D4AF37] text-black font-semibold text-xs hover:bg-[#F3E5AB] transition-colors"
              >
                {t.cart.continueShopping}
              </button>
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-zinc-800 bg-[#151519] space-y-3">
            
            {/* Wilaya Quick Delivery Estimator */}
            <div className="p-2.5 rounded-lg bg-black/40 border border-zinc-800 text-xs">
              <div className="flex items-center justify-between mb-1 text-zinc-400">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Livraison estimée :
                </span>
                <select
                  value={selectedWilayaCode}
                  onChange={(e) => setSelectedWilayaCode(e.target.value)}
                  className="bg-[#18181C] border border-zinc-700 text-[11px] rounded px-1.5 py-0.5 text-white"
                >
                  {ALGERIA_WILAYAS.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.code} - {w.name.split('-')[1]?.trim() || w.name} ({w.homeDeliveryFee} DA)
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between text-zinc-400 text-[11px]">
                <span>Sous-total articles :</span>
                <span className="text-white font-medium">{formatPrice(subtotal)} {t.product.da}</span>
              </div>
              <div className="flex justify-between text-zinc-400 text-[11px]">
                <span>Frais livraison :</span>
                <span className="text-[#D4AF37] font-medium">{formatPrice(selectedWilaya.homeDeliveryFee)} {t.product.da}</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-sm font-semibold text-white">Total estimé :</span>
              <span className="text-xl font-bold font-serif-luxury text-[#F3E5AB]">
                {formatPrice(estimatedTotal)} {t.product.da}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  onClose();
                  onProceedToOrderForm();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] hover:from-[#F3E5AB] hover:to-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>{t.cart.proceedOrderForm}</span>
              </button>

              <a
                href={whatsappOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-bold text-xs flex items-center justify-center gap-2 shadow transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>{t.cart.orderCartWhatsApp}</span>
              </a>

              <button
                onClick={onClearCart}
                className="w-full py-1.5 text-zinc-500 hover:text-red-400 text-[11px] text-center"
              >
                {t.cart.clearCart}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
