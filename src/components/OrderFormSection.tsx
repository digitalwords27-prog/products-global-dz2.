import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  MessageCircle, 
  CheckCircle2, 
  Truck, 
  AlertCircle, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { Product, CartItem, Language, Order } from '../types';
import { ALGERIA_WILAYAS } from '../data/wilayas';
import { TRANSLATIONS, generateWhatsAppLink } from '../i18n/translations';
import { createOrder } from '../services/storage';

interface OrderFormSectionProps {
  products: Product[];
  cartItems: CartItem[];
  language: Language;
  onClearCart: () => void;
  directSelectedProduct?: { product: Product; quantity: number } | null;
}

export const OrderFormSection: React.FC<OrderFormSectionProps> = ({
  products,
  cartItems,
  language,
  onClearCart,
  directSelectedProduct,
}) => {
  const t = TRANSLATIONS[language];

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [wilayaCode, setWilayaCode] = useState('16'); // Default to 16 Alger
  const [commune, setCommune] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryType, setDeliveryType] = useState<'home' | 'desk'>('home');
  const [notes, setNotes] = useState('');

  // Selected products for the form (local line items)
  const [lineItems, setLineItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [selectedAddProductId, setSelectedAddProductId] = useState('');

  // Status and confirmation modal
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Sync lineItems from directSelectedProduct or cartItems
  useEffect(() => {
    if (directSelectedProduct) {
      setLineItems([
        {
          productId: directSelectedProduct.product.id,
          quantity: directSelectedProduct.quantity,
        },
      ]);
    } else if (cartItems.length > 0 && lineItems.length === 0) {
      setLineItems(
        cartItems.map((ci) => ({
          productId: ci.product.id,
          quantity: ci.quantity,
        }))
      );
    } else if (lineItems.length === 0 && products.length > 0) {
      // Default to the first product if cart is empty
      setLineItems([{ productId: products[0].id, quantity: 1 }]);
    }
  }, [directSelectedProduct, cartItems, products]);

  // Selected Wilaya Object
  const selectedWilaya = useMemo(() => {
    return ALGERIA_WILAYAS.find((w) => w.code === wilayaCode) || ALGERIA_WILAYAS[15]; // Default Alger
  }, [wilayaCode]);

  // Delivery fee based on type
  const deliveryFee = deliveryType === 'home' ? selectedWilaya.homeDeliveryFee : selectedWilaya.deskDeliveryFee;

  // Calculate Subtotal
  const resolvedItems = useMemo(() => {
    return lineItems
      .map((li) => {
        const prod = products.find((p) => p.id === li.productId);
        if (!prod) return null;
        return {
          product: prod,
          quantity: li.quantity,
          total: prod.price * li.quantity,
        };
      })
      .filter(Boolean) as { product: Product; quantity: number; total: number }[];
  }, [lineItems, products]);

  const subtotal = resolvedItems.reduce((acc, item) => acc + item.total, 0);
  const grandTotal = subtotal + deliveryFee;

  const formatPrice = (val: number) => new Intl.NumberFormat('fr-DZ').format(val);

  // Item quantity modifications in form
  const handleUpdateQty = (productId: string, delta: number) => {
    setLineItems((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { productId: string; quantity: number }[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setLineItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleAddProductToForm = () => {
    if (!selectedAddProductId) return;
    setLineItems((prev) => {
      const exists = prev.find((i) => i.productId === selectedAddProductId);
      if (exists) {
        return prev.map((i) =>
          i.productId === selectedAddProductId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { productId: selectedAddProductId, quantity: 1 }];
    });
    setSelectedAddProductId('');
  };

  // Submit Order Form (Method B - Save COD)
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validation
    if (!fullName.trim() || fullName.trim().length < 3) {
      setErrorMsg('Veuillez entrer votre nom complet (au moins 3 caractères).');
      return;
    }

    // Algerian phone format check: must have at least 9 or 10 digits
    const cleanedPhone = phone.replace(/[^0-9]/g, '');
    if (cleanedPhone.length < 9) {
      setErrorMsg('Veuillez entrer un numéro de téléphone valide (ex: 0550123456).');
      return;
    }

    if (!commune.trim()) {
      setErrorMsg('Veuillez préciser votre commune ou ville de livraison.');
      return;
    }

    if (resolvedItems.length === 0) {
      setErrorMsg(t.orderForm.noItemsInForm);
      return;
    }

    setIsSubmitting(true);

    try {
      const orderRecord = createOrder({
        customerName: fullName.trim(),
        phone: cleanedPhone,
        wilayaCode: selectedWilaya.code,
        wilayaName: language === 'ar' ? selectedWilaya.nameAr : selectedWilaya.name,
        commune: commune.trim(),
        address: address.trim() || commune.trim(),
        deliveryType,
        items: resolvedItems.map((ri) => ({
          productId: ri.product.id,
          productName: (language === 'ar' && ri.product.nameAr) ? ri.product.nameAr : ri.product.name,
          price: ri.product.price,
          quantity: ri.quantity,
          total: ri.total,
        })),
        subtotal,
        deliveryFee,
        total: grandTotal,
        notes: notes.trim(),
      });

      setCompletedOrder(orderRecord);
      onClearCart();
    } catch (err: any) {
      setErrorMsg('Une erreur est survenue lors de l\'enregistrement. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Direct WhatsApp Order from Form
  const handleDirectWhatsAppOrder = () => {
    if (resolvedItems.length === 0) {
      setErrorMsg(t.orderForm.noItemsInForm);
      return;
    }

    const itemsSummary = resolvedItems.map((ri) => ({
      name: (language === 'ar' && ri.product.nameAr) ? ri.product.nameAr : ri.product.name,
      price: ri.product.price,
      quantity: ri.quantity,
    }));

    const url = generateWhatsAppLink({
      language,
      cartItems: itemsSummary,
      customerName: fullName || undefined,
      wilaya: language === 'ar' ? selectedWilaya.nameAr : selectedWilaya.name,
      address: commune ? `${commune} - ${address}` : undefined,
      total: grandTotal,
    });

    window.open(url, '_blank');
  };

  return (
    <section id="order-form" className="py-16 bg-[#09090A] border-t border-zinc-800/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18181C] border border-[#D4AF37]/30 text-xs font-semibold text-[#D4AF37] mb-2.5">
            <FileText className="w-3.5 h-3.5" />
            <span>Paiement Cash à la Réception</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-white mb-2">
            {t.orderForm.title}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-sans-clean">
            {t.orderForm.subtitle}
          </p>
        </div>

        {/* Error message banner */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/70 border border-red-700/80 text-red-200 text-xs sm:text-sm flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmitOrder} className="bg-[#121215] border border-zinc-800 rounded-2xl p-5 sm:p-8 shadow-2xl">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Column 1: Customer Details & Wilaya */}
            <div className="space-y-5">
              <h3 className="text-sm font-semibold tracking-wider uppercase text-[#D4AF37] border-b border-zinc-800 pb-2 flex items-center gap-2">
                <span>{t.orderForm.step1}</span>
              </h3>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  {t.orderForm.fullName} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.orderForm.fullNamePlaceholder}
                  className="w-full bg-[#18181C] border border-zinc-700 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  {t.orderForm.phone} <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.orderForm.phonePlaceholder}
                  className="w-full bg-[#18181C] border border-zinc-700 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors font-mono"
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  {t.orderForm.phoneHint}
                </span>
              </div>

              <h3 className="text-sm font-semibold tracking-wider uppercase text-[#D4AF37] border-b border-zinc-800 pb-2 pt-2 flex items-center gap-2">
                <span>{t.orderForm.step2}</span>
              </h3>

              {/* Wilaya Selector (58 Wilayas) */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  {t.orderForm.wilaya} <span className="text-red-400">*</span>
                </label>
                <select
                  value={wilayaCode}
                  onChange={(e) => setWilayaCode(e.target.value)}
                  className="w-full bg-[#18181C] border border-zinc-700 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors cursor-pointer"
                >
                  {ALGERIA_WILAYAS.map((w) => (
                    <option key={w.code} value={w.code} className="bg-[#18181C] text-white">
                      {language === 'ar' ? w.nameAr : w.name} (Domicile: {w.homeDeliveryFee} DA / Bureau: {w.deskDeliveryFee} DA)
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between text-[11px] text-[#F3E5AB] mt-1.5 px-1 font-sans-clean">
                  <span>Délai estimé : {selectedWilaya.deliveryTimeDays}</span>
                </div>
              </div>

              {/* Delivery Type Option (Domicile vs Stop Desk) */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  {t.orderForm.deliveryType}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                    deliveryType === 'home'
                      ? 'bg-[#1D1B16] border-[#D4AF37] text-white ring-1 ring-[#D4AF37]'
                      : 'bg-[#18181C] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="deliveryType"
                        checked={deliveryType === 'home'}
                        onChange={() => setDeliveryType('home')}
                        className="accent-[#D4AF37]"
                      />
                      <span className="text-xs font-semibold">{t.orderForm.homeDelivery}</span>
                    </div>
                    <span className="text-xs font-bold text-[#F3E5AB] mt-2">
                      {selectedWilaya.homeDeliveryFee} {t.product.da}
                    </span>
                  </label>

                  <label className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                    deliveryType === 'desk'
                      ? 'bg-[#1D1B16] border-[#D4AF37] text-white ring-1 ring-[#D4AF37]'
                      : 'bg-[#18181C] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="deliveryType"
                        checked={deliveryType === 'desk'}
                        onChange={() => setDeliveryType('desk')}
                        className="accent-[#D4AF37]"
                      />
                      <span className="text-xs font-semibold">Bureau / Stop Desk</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 mt-2">
                      {selectedWilaya.deskDeliveryFee} {t.product.da} (Économique)
                    </span>
                  </label>
                </div>
              </div>

              {/* Commune */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  {t.orderForm.commune} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  placeholder={t.orderForm.communePlaceholder}
                  className="w-full bg-[#18181C] border border-zinc-700 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Detailed Address */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  {t.orderForm.address}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t.orderForm.addressPlaceholder}
                  className="w-full bg-[#18181C] border border-zinc-700 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  {t.orderForm.notes}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.orderForm.notesPlaceholder}
                  className="w-full bg-[#18181C] border border-zinc-700 focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
                />
              </div>

            </div>

            {/* Column 2: Selected Items & Order Total Summary */}
            <div className="flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-sm font-semibold tracking-wider uppercase text-[#D4AF37] border-b border-zinc-800 pb-2 flex items-center justify-between">
                  <span>{t.orderForm.step3}</span>
                  <span className="text-xs text-zinc-400 font-sans-clean font-normal">
                    {resolvedItems.length} article(s)
                  </span>
                </h3>

                {/* List of items */}
                <div className="space-y-3 mt-4 max-h-72 overflow-y-auto pr-1">
                  {resolvedItems.length > 0 ? (
                    resolvedItems.map((item) => (
                      <div
                        key={item.product.id}
                        className="p-3 rounded-xl bg-[#18181C] border border-zinc-800 flex items-center justify-between gap-3"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-14 h-14 rounded-lg object-cover shrink-0 border border-zinc-700"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-white truncate">
                            {(language === 'ar' && item.product.nameAr) ? item.product.nameAr : item.product.name}
                          </h4>
                          <span className="text-[11px] text-[#F3E5AB]">
                            {formatPrice(item.product.price)} {t.product.da}
                          </span>
                        </div>

                        {/* Quantity adjusters */}
                        <div className="flex items-center gap-1.5 bg-black/40 border border-zinc-700 rounded-lg px-1.5 py-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.product.id, -1)}
                            className="text-zinc-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-5 text-center text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.product.id, 1)}
                            className="text-zinc-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Remove item */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.product.id)}
                          className="text-zinc-500 hover:text-red-400 p-1"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center rounded-xl bg-[#18181C] border border-zinc-800 text-zinc-400 text-xs">
                      {t.orderForm.noItemsInForm}
                    </div>
                  )}
                </div>

                {/* Dropdown to add more items from the catalog directly */}
                <div className="mt-4 pt-4 border-t border-zinc-800/80">
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    {t.orderForm.chooseProduct}
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedAddProductId}
                      onChange={(e) => setSelectedAddProductId(e.target.value)}
                      className="flex-1 bg-[#18181C] border border-zinc-700 text-xs rounded-xl px-3 py-2 text-white focus:outline-none"
                    >
                      <option value="">{t.orderForm.selectAProduct}</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} - {formatPrice(p.price)} DA
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={!selectedAddProductId}
                      onClick={handleAddProductToForm}
                      className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-[#D4AF37] hover:text-black text-zinc-300 text-xs font-semibold disabled:opacity-50 transition-colors"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>

                {/* Price Breakdown Calculation */}
                <div className="mt-6 p-4 rounded-xl bg-black/40 border border-zinc-800 space-y-2.5">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>{t.orderForm.subtotal}</span>
                    <span className="font-semibold text-white">{formatPrice(subtotal)} {t.product.da}</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>{t.orderForm.totalDelivery} ({selectedWilaya.name.split('-')[1]?.trim() || selectedWilaya.name})</span>
                    <span className="font-semibold text-[#D4AF37]">{formatPrice(deliveryFee)} {t.product.da}</span>
                  </div>
                  <div className="pt-2 border-t border-zinc-800 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-white">{t.orderForm.totalToPay}</span>
                    <span className="text-xl sm:text-2xl font-bold font-serif-luxury text-[#F3E5AB]">
                      {formatPrice(grandTotal)} {t.product.da}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="space-y-3 pt-4">
                {/* 1. Main Confirm COD Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || resolvedItems.length === 0}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#DFBF58] to-[#AA7C11] hover:from-[#F3E5AB] hover:to-[#D4AF37] text-black font-bold text-sm tracking-wider uppercase transition-all shadow-xl hover:shadow-[#D4AF37]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{isSubmitting ? 'Traitement en cours...' : t.orderForm.btnConfirmCod}</span>
                </button>

                {/* 2. Direct WhatsApp Order Button */}
                <button
                  type="button"
                  onClick={handleDirectWhatsAppOrder}
                  className="w-full py-3.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-black border border-[#25D366]/50 font-bold text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>{t.orderForm.btnOrderViaWhatsApp}</span>
                </button>

                <p className="text-[11px] text-zinc-500 text-center font-sans-clean">
                  🔒 Vos données personnelles sont strictement confidentielles et ne seront utilisées que pour l'expédition.
                </p>
              </div>

            </div>

          </div>

        </form>

        {/* Order Success Modal Confirmation */}
        {completedOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="relative w-full max-w-lg bg-[#141417] border border-[#D4AF37]/50 rounded-2xl p-6 sm:p-8 text-center shadow-2xl">
              
              <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <h3 className="text-xl sm:text-2xl font-serif-luxury font-bold text-white mb-2">
                {t.orderForm.orderSuccessTitle}
              </h3>

              <div className="my-4 p-4 rounded-xl bg-[#1A1A1E] border border-zinc-800">
                <span className="text-xs text-zinc-400 block mb-1">{t.orderForm.orderSuccessMsg}</span>
                <span className="text-lg font-mono font-bold text-[#F3E5AB] tracking-widest">
                  {completedOrder.id}
                </span>
                <div className="mt-3 pt-2 border-t border-zinc-800 text-xs text-zinc-300 flex justify-between">
                  <span>Montant à régler à la livraison :</span>
                  <strong className="text-[#D4AF37]">{formatPrice(completedOrder.total)} {t.product.da}</strong>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 mb-6 font-sans-clean leading-relaxed">
                {t.orderForm.orderSuccessCallInfo}
              </p>

              <div className="space-y-3">
                {/* Send WhatsApp confirmation link */}
                <a
                  href={generateWhatsAppLink({
                    language,
                    orderId: completedOrder.id,
                    customerName: completedOrder.customerName,
                    wilaya: completedOrder.wilayaName,
                    address: `${completedOrder.commune} - ${completedOrder.address}`,
                    total: completedOrder.total,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>{t.orderForm.sendSummaryWhatsApp}</span>
                </a>

                <button
                  onClick={() => setCompletedOrder(null)}
                  className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
                >
                  {t.orderForm.orderAnother}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
