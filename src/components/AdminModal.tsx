import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Lock, 
  Unlock, 
  Package, 
  ShoppingBag, 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Image as ImageIcon, 
  Upload, 
  Check, 
  AlertCircle, 
  Phone, 
  MessageCircle, 
  Download, 
  RefreshCw, 
  Eye, 
  EyeOff,
  DollarSign, 
  Star, 
  Clock, 
  Flame,
  HelpCircle,
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  AlertTriangle,
  Fingerprint
} from 'lucide-react';
import { Product, Order, OrderStatus, CategoryId, Language, SecurityConfig } from '../types';
import { 
  getStoredProducts, 
  saveStoredProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  resetProducts,
  getStoredOrders, 
  updateOrderStatus, 
  deleteOrder, 
  getAdminPin, 
  setAdminPin, 
  verifyAdminPinWithProtection,
  getRemainingLockoutSeconds,
  resetAuthAttempts,
  getSecurityConfig,
  saveSecurityConfig,
  revokeAllSessions,
  isDefaultPinInUse,
  isAdminAuthenticated, 
  logoutAdmin,
  exportCatalogJson,
  importCatalogJson
} from '../services/storage';
import { TRANSLATIONS } from '../i18n/translations';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onProductsUpdated: () => void;
  onSecurityUpdated?: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  language,
  onProductsUpdated,
  onSecurityUpdated,
}) => {
  const t = TRANSLATIONS[language];

  // Auth states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [isDefaultPin, setIsDefaultPin] = useState(false);

  // Security configuration states
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>(() => getSecurityConfig());
  const [newMasterPassword, setNewMasterPassword] = useState('');
  const [confirmMasterPassword, setConfirmMasterPassword] = useState('');
  const [securityActionMsg, setSecurityActionMsg] = useState<{ success?: boolean; text: string } | null>(null);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'security' | 'settings' | 'guide'>('products');

  // Product management states
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [previewModalProduct, setPreviewModalProduct] = useState<Product | null>(null);
  const [productFormError, setProductFormError] = useState<string>('');

  // Orders management states
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');

  // Settings states
  const [importStatusMsg, setImportStatusMsg] = useState<{ success?: boolean; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize and check auth & lockout
  useEffect(() => {
    if (isOpen) {
      const auth = isAdminAuthenticated();
      setIsAuthenticated(auth);
      setIsDefaultPin(isDefaultPinInUse());
      setSecurityConfig(getSecurityConfig());

      const remainingLock = getRemainingLockoutSeconds();
      setLockoutRemaining(remainingLock);
      if (remainingLock > 0) {
        setPinError(
          language === 'ar'
            ? `⚠️ تم تجميد الدخول لأسباب أمنية. يرجى الانتظار ${remainingLock} ثانية.`
            : `Accès temporairement bloqué par sécurité. Veuillez patienter ${remainingLock} secondes.`
        );
      }

      if (auth) {
        refreshData();
      }
    }
  }, [isOpen, language]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const timer = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          setPinError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  const refreshData = () => {
    setProducts(getStoredProducts());
    setOrders(getStoredOrders());
    setIsDefaultPin(isDefaultPinInUse());
    setSecurityConfig(getSecurityConfig());
  };

  if (!isOpen) return null;

  // Handle Protected Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemaining > 0) return;
    setPinError('');

    const res = verifyAdminPinWithProtection(pinInput, rememberDevice);
    if (res.success) {
      setIsAuthenticated(true);
      setPinInput('');
      setIsDefaultPin(isDefaultPinInUse());
      refreshData();
      onSecurityUpdated?.();
    } else {
      if (res.locked) {
        setLockoutRemaining(res.remainingSeconds || 300);
        setPinError(
          language === 'ar'
            ? `⚠️ تم تجاوز الحد الأقصى للمحاولات! تم تجميد الدخول لمدة 5 دقائق لحماية المتجر من أي محاولة اختراق.`
            : `⚠️ Trop de tentatives erronées ! Accès bloqué pendant 5 minutes par mesure de sécurité.`
        );
      } else {
        setAttemptsRemaining(res.attemptsLeft ?? 0);
        setPinError(
          language === 'ar'
            ? `الرمز السري غير صحيح. لديك ${res.attemptsLeft} محاولة متبقية قبل الإغلاق الأمني.`
            : `Code secret incorrect. Il vous reste ${res.attemptsLeft} tentative(s) avant verrouillage temporaire.`
        );
      }
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
    setPinInput('');
    setAttemptsRemaining(null);
  };


  // Image Upload handler (from phone gallery or computer)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress image using canvas to ensure fast performance on Android
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setEditingProduct((prev) => (prev ? { ...prev, image: compressedDataUrl } : null));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Open Form to Add New Product
  const handleStartAddProduct = () => {
    setIsEditingExisting(false);
    setEditingProduct({
      name: '',
      nameAr: '',
      nameEn: '',
      description: '',
      descriptionAr: '',
      price: 5000,
      originalPrice: undefined,
      category: 'perfumes',
      image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
      inStock: true,
      isFeatured: false,
      isNewArrival: true,
      isSpecialOffer: false,
      volumeOrSize: '100 ml',
      gender: 'unisex',
    });
  };

  // Open Form to Edit Existing Product
  const handleStartEditProduct = (prod: Product) => {
    setIsEditingExisting(true);
    setEditingProduct({ ...prod });
  };

  // Save Product (Create or Update)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setProductFormError('');
    if (!editingProduct || !editingProduct.name || !editingProduct.price) {
      setProductFormError(language === 'ar' ? 'يرجى تحديد اسم وسعر صحيح للمنتج.' : 'Veuillez spécifier au moins un nom et un prix pour le produit.');
      return;
    }

    if (isEditingExisting && editingProduct.id) {
      updateProduct(editingProduct as Product);
    } else {
      addProduct({
        name: editingProduct.name,
        nameAr: editingProduct.nameAr || '',
        nameEn: editingProduct.nameEn || '',
        description: editingProduct.description || '',
        descriptionAr: editingProduct.descriptionAr || '',
        descriptionEn: editingProduct.descriptionEn || '',
        price: Number(editingProduct.price),
        originalPrice: editingProduct.originalPrice ? Number(editingProduct.originalPrice) : undefined,
        category: (editingProduct.category as CategoryId) || 'perfumes',
        image: editingProduct.image || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
        inStock: editingProduct.inStock ?? true,
        isFeatured: editingProduct.isFeatured ?? false,
        isNewArrival: editingProduct.isNewArrival ?? false,
        isSpecialOffer: editingProduct.isSpecialOffer ?? false,
        volumeOrSize: editingProduct.volumeOrSize || '',
        gender: editingProduct.gender || 'unisex',
        rating: 4.9,
        salesCount: 1,
      });
    }

    setEditingProduct(null);
    setProductFormError('');
    refreshData();
    onProductsUpdated();
  };

  // Delete Product
  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
    refreshData();
    onProductsUpdated();
  };

  // Update Order Status
  const handleOrderStatusChange = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    refreshData();
  };

  // Delete Order
  const handleDeleteOrder = (orderId: string) => {
    deleteOrder(orderId);
    refreshData();
  };

  // Security Actions
  const handleSaveMasterPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityActionMsg(null);
    const trimmed = newMasterPassword.trim();
    if (!trimmed || trimmed.length < 4) {
      setSecurityActionMsg({ 
        success: false, 
        text: language === 'ar' ? 'كلمة المرور يجب أن تتكون من 4 خانات على الأقل.' : 'Le mot de passe doit comporter au moins 4 caractères.' 
      });
      return;
    }
    if (newMasterPassword !== confirmMasterPassword) {
      setSecurityActionMsg({ 
        success: false, 
        text: language === 'ar' ? 'كلمتا المرور غير متطابقتين. يرجى إعادة التأكد.' : 'Les deux mots de passe ne correspondent pas.' 
      });
      return;
    }

    setAdminPin(trimmed);
    setIsDefaultPin(false);
    setNewMasterPassword('');
    setConfirmMasterPassword('');
    setSecurityActionMsg({ success: true, text: t.admin.pinUpdatedSuccess });
    onSecurityUpdated?.();
  };

  const handleToggleStealthMode = () => {
    const updated = saveSecurityConfig({ stealthMode: !securityConfig.stealthMode });
    setSecurityConfig(updated);
    onSecurityUpdated?.();
  };

  const handleToggleSiteLock = () => {
    const updated = saveSecurityConfig({ siteLockEnabled: !securityConfig.siteLockEnabled });
    setSecurityConfig(updated);
    onSecurityUpdated?.();
  };

  const handleRevokeSessions = () => {
    revokeAllSessions();
    setSecurityActionMsg({ success: true, text: t.admin.revokeSessionsSuccess });
    setIsAuthenticated(false);
    onSecurityUpdated?.();
  };

  const handleResetLockout = () => {
    resetAuthAttempts();
    setLockoutRemaining(0);
    setPinError('');
    setSecurityActionMsg({ 
      success: true, 
      text: language === 'ar' ? 'تمت إعادة ضبط عداد المحاولات وفك أي تجميد أمني بنجاح.' : 'Compteur de tentatives réinitialisé avec succès.' 
    });
  };


  // Export JSON Catalog
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(exportCatalogJson());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `products_global_dz_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON Catalog
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importCatalogJson(content);
      if (res.success) {
        setImportStatusMsg({ success: true, text: `Catalogue restauré avec succès (${res.count} produits).` });
        refreshData();
        onProductsUpdated();
      } else {
        setImportStatusMsg({ success: false, text: res.error || 'Erreur lors de l\'importation.' });
      }
    };
    reader.readAsText(file);
  };

  const formatPrice = (val: number) => new Intl.NumberFormat('fr-DZ').format(val);

  // Filtered products list in admin
  const filteredProducts = products.filter((p) => {
    if (productCategoryFilter !== 'all' && p.category !== productCategoryFilter) return false;
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.nameAr && p.nameAr.toLowerCase().includes(q));
    }
    return true;
  });

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    if (orderFilterStatus !== 'all' && o.status !== orderFilterStatus) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div 
        className="relative w-full max-w-5xl bg-[#121215] border border-[#D4AF37]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-[#16161A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-[#D4AF37] to-[#8C6D1F] shadow flex items-center justify-center shrink-0">
              <img
                src="/logo.png"
                alt="Products Global Dz Logo"
                className="w-full h-full object-cover rounded-full bg-black"
              />
            </div>
            <div>
              <h2 className="font-serif-luxury text-lg sm:text-xl font-bold text-white leading-tight">
                {t.admin.title}
              </h2>
              <span className="text-[11px] text-zinc-400 font-sans-clean block">
                Gestion mobile pour Products Global Dz
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
              >
                {t.admin.logout}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          
          {/* LOGIN SCREEN IF NOT AUTHENTICATED */}
          {!isAuthenticated ? (
            <div className="max-w-md mx-auto my-8 text-center px-2">
              <div className="relative w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#8C6D1F] shadow-xl shadow-[#D4AF37]/25 flex items-center justify-center mx-auto mb-4">
                <img
                  src="/logo.png"
                  alt="Products Global Dz Logo"
                  className="w-full h-full object-cover rounded-full bg-black"
                />
                <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-black border border-[#D4AF37] text-[#D4AF37] shadow">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-white mb-2 gold-gradient-text">
                {language === 'ar' ? 'بوابة الإدارة والأمان الفائق' : 'Accès Administrateur Sécurisé'}
              </h3>
              <p className="text-xs text-zinc-400 mb-6 font-sans-clean leading-relaxed">
                {language === 'ar'
                  ? 'هذه المنطقة مخصصة حصرياً لمدير المتجر. يرجى إدخال كلمة المرور الرئيسية للدخول.'
                  : 'Cet espace est strictement réservé au propriétaire de la boutique. Veuillez entrer votre mot de passe maître.'}
              </p>

              {/* Error or Lockout Notification */}
              {pinError && (
                <div className="p-3 mb-4 rounded-xl bg-red-950/70 border border-red-700 text-xs text-red-200 flex items-start gap-2 text-left rtl:text-right">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                  <span className="flex-1 leading-snug">{pinError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 text-left rtl:text-right">
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    autoFocus
                    disabled={lockoutRemaining > 0}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder={language === 'ar' ? 'أدخل كلمة المرور أو الرمز السري...' : 'Entrez le mot de passe maître...'}
                    className="w-full bg-[#18181C] border border-[#D4AF37]/40 focus:border-[#D4AF37] rounded-xl px-4 py-3.5 pe-12 text-center text-base sm:text-lg tracking-widest text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 transition-all font-mono disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute top-1/2 -translate-y-1/2 end-3 text-zinc-400 hover:text-white p-1"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Remember device checkbox */}
                <div className="flex items-center gap-2 px-1 text-xs text-zinc-400">
                  <input
                    type="checkbox"
                    id="rememberDeviceCheck"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="rounded bg-[#18181C] border-zinc-700 text-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                  <label htmlFor="rememberDeviceCheck" className="cursor-pointer select-none">
                    {t.admin.rememberDeviceLabel}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={lockoutRemaining > 0 || !pinInput.trim()}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-black font-bold text-sm uppercase tracking-wider hover:from-[#F3E5AB] transition-all shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>
                    {lockoutRemaining > 0 
                      ? (language === 'ar' ? `تجميد أمني مؤقت (${lockoutRemaining} ثانية)` : `Verrouillé temporairement (${lockoutRemaining}s)`)
                      : t.admin.btnLogin}
                  </span>
                </button>
              </form>

              <div className="mt-6 p-3 rounded-xl bg-[#141417] border border-zinc-800/80 text-[11px] text-zinc-500 flex items-center justify-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>حماية مشددة: حظر آلي بعد 3 محاولات خاطئة لمنع أي تخمين.</span>
              </div>
            </div>
          ) : (
            /* AUTHENTICATED DASHBOARD */
            <div>
              {/* Default PIN warning banner if still active */}
              {isDefaultPin && (
                <div className="mb-6 p-4 rounded-xl bg-amber-950/60 border border-amber-600 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold text-amber-300 text-sm mb-0.5">
                        {t.admin.defaultPinWarningTitle}
                      </strong>
                      <span className="leading-relaxed">
                        {t.admin.defaultPinWarningText}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('security')}
                    className="px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-bold whitespace-nowrap shadow cursor-pointer text-xs"
                  >
                    {language === 'ar' ? 'تعيين كلمة مرور خاصة الآن 🔒' : 'Changer le code maintenant 🔒'}
                  </button>
                </div>
              )}

              {/* Tab Navigation */}
              <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-3 mb-6">
                <button
                  onClick={() => { setActiveTab('products'); setEditingProduct(null); }}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'products'
                      ? 'bg-[#D4AF37] text-black shadow'
                      : 'bg-[#18181C] text-zinc-300 hover:text-white'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>{t.admin.tabProducts} ({products.length})</span>
                </button>

                <button
                  onClick={() => { setActiveTab('orders'); setEditingProduct(null); }}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'orders'
                      ? 'bg-[#D4AF37] text-black shadow'
                      : 'bg-[#18181C] text-zinc-300 hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t.admin.tabOrders} ({orders.length})</span>
                </button>

                {/* Dedicated Security & Privacy Tab */}
                <button
                  onClick={() => { setActiveTab('security'); setEditingProduct(null); }}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer relative ${
                    activeTab === 'security'
                      ? 'bg-[#D4AF37] text-black shadow'
                      : 'bg-[#18181C] text-zinc-300 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t.admin.tabSecurity}</span>
                  {isDefaultPin && (
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping absolute -top-1 -right-1" />
                  )}
                </button>

                <button
                  onClick={() => { setActiveTab('settings'); setEditingProduct(null); }}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-[#D4AF37] text-black shadow'
                      : 'bg-[#18181C] text-zinc-300 hover:text-white'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span>{t.admin.tabSettings}</span>
                </button>

                <button
                  onClick={() => { setActiveTab('guide'); setEditingProduct(null); }}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'guide'
                      ? 'bg-[#D4AF37] text-black shadow'
                      : 'bg-[#18181C] text-zinc-300 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{t.admin.tabGuide}</span>
                </button>
              </div>


              {/* TAB 1: PRODUCT MANAGEMENT */}
              {activeTab === 'products' && (
                <div>
                  {/* EDIT OR CREATE FORM */}
                  {editingProduct ? (
                    <div className="bg-[#16161A] border border-[#D4AF37]/30 rounded-2xl p-5 sm:p-6 mb-6">
                      <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
                        <h3 className="font-serif-luxury text-lg font-bold text-white flex items-center gap-2">
                          <Edit3 className="w-4 h-4 text-[#D4AF37]" />
                          <span>{isEditingExisting ? t.admin.editProduct : t.admin.addNewProduct}</span>
                        </h3>
                        <button
                          onClick={() => setEditingProduct(null)}
                          className="text-xs text-zinc-400 hover:text-white"
                        >
                          {t.admin.cancelBtn}
                        </button>
                      </div>

                      {productFormError && (
                        <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/80 text-red-200 text-xs flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                          <span>{productFormError}</span>
                        </div>
                      )}

                      <form onSubmit={handleSaveProduct} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Name FR */}
                          <div>
                            <label className="block text-xs text-zinc-300 font-medium mb-1">
                              {t.admin.productName} *
                            </label>
                            <input
                              type="text"
                              required
                              value={editingProduct.name || ''}
                              onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                              placeholder="Ex: Oud Royal Sahara Intense"
                              className="w-full bg-[#1A1A1E] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white"
                            />
                          </div>

                          {/* Name AR */}
                          <div>
                            <label className="block text-xs text-zinc-300 font-medium mb-1">
                              {t.admin.productNameAr}
                            </label>
                            <input
                              type="text"
                              value={editingProduct.nameAr || ''}
                              onChange={(e) => setEditingProduct({ ...editingProduct, nameAr: e.target.value })}
                              placeholder="مثال: عود رويال صحارى الفاخر"
                              className="w-full bg-[#1A1A1E] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white"
                            />
                          </div>

                          {/* Category */}
                          <div>
                            <label className="block text-xs text-zinc-300 font-medium mb-1">
                              {t.admin.category} *
                            </label>
                            <select
                              value={editingProduct.category || 'perfumes'}
                              onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as CategoryId })}
                              className="w-full bg-[#1A1A1E] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white"
                            >
                              <option value="perfumes">{t.categoriesSection.perfumes}</option>
                              <option value="cosmetics">{t.categoriesSection.cosmetics}</option>
                              <option value="skincare">{t.categoriesSection.skincare}</option>
                              <option value="beauty-accessories">{t.categoriesSection.beautyAccessories}</option>
                              <option value="fashion-accessories">{t.categoriesSection.fashionAccessories}</option>
                              <option value="watches-men">{t.categoriesSection.watchesMen}</option>
                              <option value="watches-women">{t.categoriesSection.watchesWomen}</option>
                            </select>
                          </div>

                          {/* Price DA */}
                          <div>
                            <label className="block text-xs text-zinc-300 font-medium mb-1">
                              {t.admin.price} *
                            </label>
                            <input
                              type="number"
                              required
                              min={100}
                              step={50}
                              value={editingProduct.price || 0}
                              onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                              className="w-full bg-[#1A1A1E] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white"
                            />
                          </div>

                          {/* Original Price (for strike-through discount) */}
                          <div>
                            <label className="block text-xs text-zinc-300 font-medium mb-1">
                              {t.admin.originalPrice}
                            </label>
                            <input
                              type="number"
                              min={0}
                              step={50}
                              value={editingProduct.originalPrice || ''}
                              onChange={(e) => setEditingProduct({ 
                                ...editingProduct, 
                                originalPrice: e.target.value ? Number(e.target.value) : undefined 
                              })}
                              placeholder="Ex: 11500"
                              className="w-full bg-[#1A1A1E] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white"
                            />
                          </div>

                          {/* Size / Volume */}
                          <div>
                            <label className="block text-xs text-zinc-300 font-medium mb-1">
                              Taille / Volume / Format :
                            </label>
                            <input
                              type="text"
                              value={editingProduct.volumeOrSize || ''}
                              onChange={(e) => setEditingProduct({ ...editingProduct, volumeOrSize: e.target.value })}
                              placeholder="Ex: 100 ml ou 42 mm"
                              className="w-full bg-[#1A1A1E] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white"
                            />
                          </div>
                        </div>

                        {/* Image Uploader & Preview */}
                        <div className="p-4 rounded-xl bg-[#141417] border border-zinc-800 space-y-3">
                          <label className="block text-xs text-[#D4AF37] font-semibold">
                            {t.admin.imageSource}
                          </label>

                          <div className="flex flex-col sm:flex-row gap-4 items-center">
                            {/* Image Preview thumbnail */}
                            <div className="w-24 h-24 rounded-lg overflow-hidden bg-black border border-zinc-700 shrink-0 relative">
                              {editingProduct.image ? (
                                <img
                                  src={editingProduct.image}
                                  alt="Aperçu"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                  <ImageIcon className="w-8 h-8" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 w-full space-y-2">
                              {/* Direct file upload button for phone gallery */}
                              <div>
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
                                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F3E5AB] hover:bg-[#D4AF37] hover:text-black text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                                >
                                  <Upload className="w-4 h-4" />
                                  <span>{t.admin.uploadGallery}</span>
                                </button>
                              </div>

                              <div>
                                <input
                                  type="text"
                                  value={editingProduct.image || ''}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                                  placeholder={t.admin.orImageUrl}
                                  className="w-full bg-[#1A1A1E] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-xs text-zinc-300 font-medium mb-1">
                            {t.admin.description}
                          </label>
                          <textarea
                            rows={3}
                            value={editingProduct.description || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                            className="w-full bg-[#1A1A1E] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white"
                          />
                        </div>

                        {/* Toggles (In Stock, Featured, New, Offer) */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingProduct.inStock ?? true}
                              onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                              className="accent-[#D4AF37] w-4 h-4"
                            />
                            <span>{t.admin.inStockToggle}</span>
                          </label>

                          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingProduct.isFeatured ?? false}
                              onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                              className="accent-[#D4AF37] w-4 h-4"
                            />
                            <span>{t.admin.isFeaturedToggle}</span>
                          </label>

                          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingProduct.isNewArrival ?? false}
                              onChange={(e) => setEditingProduct({ ...editingProduct, isNewArrival: e.target.checked })}
                              className="accent-[#D4AF37] w-4 h-4"
                            />
                            <span>{t.admin.isNewArrivalToggle}</span>
                          </label>

                          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingProduct.isSpecialOffer ?? false}
                              onChange={(e) => setEditingProduct({ ...editingProduct, isSpecialOffer: e.target.checked })}
                              className="accent-[#D4AF37] w-4 h-4"
                            />
                            <span>{t.admin.isSpecialOfferToggle}</span>
                          </label>
                        </div>

                        {/* Save Buttons */}
                        <div className="flex gap-3 pt-3 border-t border-zinc-800">
                          <button
                            type="submit"
                            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-black font-bold text-xs uppercase tracking-wider"
                          >
                            {t.admin.saveProductBtn}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingProduct(null)}
                            className="px-4 py-2.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs"
                          >
                            {t.admin.cancelBtn}
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : null}

                  {/* Header bar: Add Product Button + Search & Category Filter */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
                    <button
                      onClick={handleStartAddProduct}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t.admin.addNewProduct}</span>
                    </button>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <select
                        value={productCategoryFilter}
                        onChange={(e) => setProductCategoryFilter(e.target.value)}
                        className="bg-[#18181C] border border-zinc-700 rounded-lg px-2.5 py-2 text-xs text-white"
                      >
                        <option value="all">Toutes catégories</option>
                        <option value="perfumes">Parfums</option>
                        <option value="cosmetics">Cosmétiques</option>
                        <option value="skincare">Soins</option>
                        <option value="beauty-accessories">Accessoires Beauté</option>
                        <option value="fashion-accessories">Accessoires Mode</option>
                        <option value="watches-men">Montres Homme</option>
                        <option value="watches-women">Montres Femme</option>
                      </select>

                      <div className="relative flex-1 sm:w-56">
                        <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder={t.admin.searchProduct}
                          className="w-full bg-[#18181C] border border-zinc-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Products Table / Cards for Mobile */}
                  <div className="space-y-3">
                    {filteredProducts.map((p) => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-xl bg-[#16161A] border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-14 h-14 rounded-lg object-cover border border-zinc-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                              {p.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                              <span className="text-[#D4AF37] font-semibold">
                                {formatPrice(p.price)} DA
                              </span>
                              {p.originalPrice && (
                                <span className="line-through text-zinc-500">
                                  {formatPrice(p.originalPrice)} DA
                                </span>
                              )}
                              <span>• {p.category}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              {p.inStock ? (
                                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
                                  En stock
                                </span>
                              ) : (
                                <span className="text-[10px] bg-red-950 text-red-300 px-1.5 py-0.5 rounded border border-red-800">
                                  Épuisé
                                </span>
                              )}
                              {p.isFeatured && (
                                <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded">
                                  Vedette
                                </span>
                              )}
                              {p.isNewArrival && (
                                <span className="text-[10px] bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded">
                                  Nouveau
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Edit & Delete actions */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                          <button
                            onClick={() => handleStartEditProduct(p)}
                            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-[#D4AF37] hover:text-black text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Modifier</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-red-900/60 text-zinc-400 hover:text-red-300 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* TAB 2: ORDERS MANAGEMENT */}
              {activeTab === 'orders' && (
                <div>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
                    <div className="text-xs text-zinc-300">
                      Total des commandes reçues : <strong className="text-[#D4AF37]">{orders.length}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400">Filtrer par statut :</span>
                      <select
                        value={orderFilterStatus}
                        onChange={(e) => setOrderFilterStatus(e.target.value)}
                        className="bg-[#18181C] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="all">Toutes les commandes</option>
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmée</option>
                        <option value="shipped">Expédiée</option>
                        <option value="delivered">Livrée</option>
                        <option value="cancelled">Annulée</option>
                      </select>
                    </div>
                  </div>

                  {filteredOrders.length > 0 ? (
                    <div className="space-y-4">
                      {filteredOrders.map((order) => {
                        const statusColors: Record<OrderStatus, string> = {
                          pending: 'bg-amber-950 text-amber-300 border-amber-800',
                          confirmed: 'bg-blue-950 text-blue-300 border-blue-800',
                          shipped: 'bg-purple-950 text-purple-300 border-purple-800',
                          delivered: 'bg-emerald-950 text-emerald-300 border-emerald-800',
                          cancelled: 'bg-red-950 text-red-300 border-red-800',
                        };

                        const formattedCustomerPhone = order.phone.startsWith('0')
                          ? '+213' + order.phone.substring(1)
                          : order.phone.startsWith('213')
                          ? '+' + order.phone
                          : '+213' + order.phone;

                        const customerWhatsAppLink = `https://wa.me/${formattedCustomerPhone.replace('+', '')}?text=${encodeURIComponent(
                          `Bonjour ${order.customerName}, ici Products Global Dz concernant votre commande ${order.id}. Pouvons-nous confirmer l'adresse de livraison (${order.wilayaName} - ${order.commune}) ?`
                        )}`;

                        return (
                          <div
                            key={order.id}
                            className="p-4 rounded-xl bg-[#16161A] border border-zinc-800 space-y-3"
                          >
                            {/* Header: Order ID, Date, Status */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                              <div>
                                <span className="font-mono text-xs font-bold text-[#F3E5AB]">
                                  {order.id}
                                </span>
                                <span className="text-[11px] text-zinc-500 ml-2">
                                  {new Date(order.createdAt).toLocaleString('fr-FR', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                  })}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleOrderStatusChange(order.id, e.target.value as OrderStatus)}
                                  className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${statusColors[order.status]}`}
                                >
                                  <option value="pending">En attente</option>
                                  <option value="confirmed">Confirmée</option>
                                  <option value="shipped">Expédiée</option>
                                  <option value="delivered">Livrée</option>
                                  <option value="cancelled">Annulée</option>
                                </select>

                                <button
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="text-zinc-500 hover:text-red-400 p-1"
                                  title="Supprimer la commande"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Customer & Location */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-zinc-500 block">Client :</span>
                                <strong className="text-white">{order.customerName}</strong>
                                <span className="text-zinc-400 block font-mono">{order.phone}</span>
                              </div>
                              <div>
                                <span className="text-zinc-500 block">Destination :</span>
                                <span className="text-white font-medium">{order.wilayaName} ({order.commune})</span>
                                <span className="text-zinc-400 block text-[11px]">{order.address}</span>
                              </div>
                            </div>

                            {/* Ordered Items Summary */}
                            <div className="p-2.5 rounded-lg bg-black/40 border border-zinc-800/60 text-xs space-y-1">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-zinc-300">
                                  <span>{item.quantity}x {item.productName}</span>
                                  <span>{formatPrice(item.total)} DA</span>
                                </div>
                              ))}
                              <div className="pt-1.5 border-t border-zinc-800 flex justify-between font-bold text-[#F3E5AB]">
                                <span>Total avec livraison ({order.deliveryType === 'home' ? 'Domicile' : 'Bureau'}) :</span>
                                <span>{formatPrice(order.total)} DA</span>
                              </div>
                            </div>

                            {order.notes && (
                              <p className="text-[11px] text-amber-200/80 bg-amber-950/30 p-2 rounded border border-amber-900/40">
                                Note client : {order.notes}
                              </p>
                            )}

                            {/* Quick Action Buttons for the Owner */}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              {/* Direct Phone Call */}
                              <a
                                href={`tel:${order.phone}`}
                                className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>Appeler le client</span>
                              </a>

                              {/* Direct WhatsApp to Customer */}
                              <a
                                href={customerWhatsAppLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-black border border-[#25D366]/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                                <span>WhatsApp client</span>
                              </a>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center rounded-xl bg-[#16161A] text-zinc-400 text-xs">
                      Aucune commande enregistrée pour le moment.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SECURITY & ACCESS CONTROL (NEW DEDICATED SECURITY TAB) */}
              {activeTab === 'security' && (
                <div className="space-y-6 max-w-2xl font-sans-clean text-xs">
                  
                  {/* Status & Feedback message */}
                  {securityActionMsg && (
                    <div className={`p-4 rounded-xl flex items-center gap-2.5 ${
                      securityActionMsg.success 
                        ? 'bg-emerald-950/70 border border-emerald-700 text-emerald-200' 
                        : 'bg-red-950/70 border border-red-700 text-red-200'
                    }`}>
                      {securityActionMsg.success ? (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      <span>{securityActionMsg.text}</span>
                    </div>
                  )}

                  {/* 1. MASTER PASSWORD MANAGER */}
                  <div className="p-5 rounded-2xl bg-[#16161A] border border-zinc-800 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-serif-luxury text-base font-bold text-white flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-[#D4AF37]" />
                          <span>{t.admin.changePinTitle}</span>
                        </h3>
                        <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                          {language === 'ar'
                            ? 'حدد كلمة مرور سرية قوية خاصة بك (أرقام أو حروف أو رموز). هذه الكلمة تمنع أي شخص آخر من دخول لوحة التحكم.'
                            : 'Définissez votre mot de passe maître personnel (chiffres, lettres ou symboles) pour interdire tout accès non autorisé.'}
                        </p>
                      </div>

                      <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 ${
                        isDefaultPin 
                          ? 'bg-red-950/80 text-red-300 border-red-700 animate-pulse' 
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                      }`}>
                        {isDefaultPin 
                          ? (language === 'ar' ? 'غير آمن (1234 افتراضي)' : 'Vulnérable (1234 par défaut)') 
                          : (language === 'ar' ? 'محمي بكلمة مخصصة 🔒' : 'Sécurisé 🔒')}
                      </div>
                    </div>

                    <form onSubmit={handleSaveMasterPassword} className="space-y-3 pt-1 max-w-md">
                      <div>
                        <label className="block text-zinc-300 font-semibold mb-1">
                          {t.admin.newPinLabel}
                        </label>
                        <input
                          type="password"
                          required
                          value={newMasterPassword}
                          onChange={(e) => setNewMasterPassword(e.target.value)}
                          placeholder={language === 'ar' ? 'كلمة المرور الجديدة (مثال: Dz@Global2026)' : 'Nouveau mot de passe maître...'}
                          className="w-full bg-[#18181C] border border-zinc-700 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-white text-xs placeholder-zinc-500 focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-300 font-semibold mb-1">
                          {language === 'ar' ? 'تأكيد كلمة المرور الجديدة :' : 'Confirmer le nouveau mot de passe :'}
                        </label>
                        <input
                          type="password"
                          required
                          value={confirmMasterPassword}
                          onChange={(e) => setConfirmMasterPassword(e.target.value)}
                          placeholder={language === 'ar' ? 'أعد كتابة كلمة المرور للتأكيد...' : 'Répétez le mot de passe...'}
                          className="w-full bg-[#18181C] border border-zinc-700 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-white text-xs placeholder-zinc-500 focus:outline-none font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-black font-bold text-xs shadow hover:opacity-95 transition-all cursor-pointer flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{t.admin.btnSavePin}</span>
                      </button>
                    </form>
                  </div>

                  {/* 2. STEALTH MODE (HIDE ADMIN ACCESS BUTTONS FROM PUBLIC) */}
                  <div className="p-5 rounded-2xl bg-[#16161A] border border-zinc-800 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif-luxury text-base font-bold text-white">
                            {t.admin.stealthModeTitle}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 font-semibold">
                            {language === 'ar' ? 'حماية سرية' : 'Recommandé'}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                          {t.admin.stealthModeDesc}
                        </p>
                      </div>

                      {/* Switch button */}
                      <button
                        type="button"
                        onClick={handleToggleStealthMode}
                        className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          securityConfig.stealthMode ? 'bg-[#D4AF37]' : 'bg-zinc-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                            securityConfig.stealthMode ? (language === 'ar' ? '-translate-x-6' : 'translate-x-6') : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#121215] border border-zinc-800 text-[11px] text-zinc-400 space-y-1.5 leading-relaxed">
                      <strong className="text-[#F3E5AB] block">
                        {language === 'ar' ? 'كيف تفتح لوحة التحكم وأنت في وضع التخفي ؟' : 'Comment accéder au panneau en Mode Furtif ?'}
                      </strong>
                      <ul className="list-disc list-inside space-y-1 text-zinc-300">
                        <li>
                          {language === 'ar' 
                            ? 'اضغط 3 مرات متتالية سريعة على شعار Products Global Dz أعلى الموقع.' 
                            : 'Tapez 3 fois rapidement sur le logo en haut de la page.'}
                        </li>
                        <li>
                          {language === 'ar'
                            ? 'أو اكتب في نهاية رابط الموقع: #admin (مثال: products-global-dz2.vercel.app/#admin).'
                            : 'Ou ajoutez #admin à la fin de l\'URL (ex: products-global-dz2.vercel.app/#admin).'}
                        </li>
                        <li>
                          {language === 'ar'
                            ? 'أو اضغط من لوحة المفاتيح: Ctrl + Shift + A'
                            : 'Ou utilisez le raccourci clavier : Ctrl + Shift + A'}
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* 3. SITE-WIDE LOCK (PRIVATE STORE MODE) */}
                  <div className="p-5 rounded-2xl bg-[#16161A] border border-zinc-800 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif-luxury text-base font-bold text-white">
                            {t.admin.siteLockTitle}
                          </h3>
                          {securityConfig.siteLockEnabled && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                              {language === 'ar' ? 'الموقع مغلق حالياً' : 'Site Verrouillé'}
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                          {t.admin.siteLockDesc}
                        </p>
                      </div>

                      {/* Switch button */}
                      <button
                        type="button"
                        onClick={handleToggleSiteLock}
                        className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          securityConfig.siteLockEnabled ? 'bg-amber-500' : 'bg-zinc-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                            securityConfig.siteLockEnabled ? (language === 'ar' ? '-translate-x-6' : 'translate-x-6') : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="text-[11px] text-zinc-500">
                      {language === 'ar'
                        ? 'عند تشغيل هذا الخيار، لن يستطيع أي زائر رؤية الموقع أو المنتجات بدون إدخال كلمة المرور الرئيسية أولاً.'
                        : 'Activez cette option si vous voulez que personne ne puisse consulter la boutique tant que vous n\'avez pas terminé vos préparatifs.'}
                    </div>
                  </div>

                  {/* 4. ACTIVE SESSIONS & DEVICE SECURITY */}
                  <div className="p-5 rounded-2xl bg-[#16161A] border border-zinc-800 space-y-3">
                    <h3 className="font-serif-luxury text-base font-bold text-white flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-[#D4AF37]" />
                      <span>{language === 'ar' ? 'أمان الجلسات والأجهزة المعتمدة' : 'Sessions et Appareils Autorisés'}</span>
                    </h3>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      {language === 'ar'
                        ? 'إذا شككت أن هناك شخصاً تمكن من معرفة الرمز أو استخدم جهازك، يمكنك بنقرة واحدة إغلاق كافة الجلسات المفتوحة وإجباره على الخروج فوراً.'
                        : 'Déconnectez immédiatement toutes les sessions actives sur l\'ensemble des ordinateurs et téléphones.'}
                    </p>

                    <div className="flex flex-wrap gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={handleRevokeSessions}
                        className="px-4 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>{t.admin.revokeSessionsBtn}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetLockout}
                        className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'إعادة ضبط عداد المحاولات الفاشلة' : 'Réinitialiser le compteur de tentatives'}</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 4: SETTINGS & BACKUP */}
              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-2xl">
                  
                  {/* Backup & Restore Section */}
                  <div className="p-5 rounded-2xl bg-[#16161A] border border-zinc-800 space-y-3">
                    <h3 className="font-serif-luxury text-base font-bold text-white flex items-center gap-2">
                      <Download className="w-4 h-4 text-[#D4AF37]" />
                      <span>{t.admin.backupTitle}</span>
                    </h3>
                    <p className="text-xs text-zinc-400 font-sans-clean leading-relaxed">
                      {t.admin.backupDesc}
                    </p>

                    {importStatusMsg && (
                      <div className={`p-3 rounded-lg text-xs ${
                        importStatusMsg.success ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'
                      }`}>
                        {importStatusMsg.text}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        onClick={handleExportJson}
                        className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-[#D4AF37] hover:text-black text-zinc-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>{t.admin.btnExport}</span>
                      </button>

                      <label className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>{t.admin.btnImport}</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportJson}
                          className="hidden"
                        />
                      </label>

                      <button
                        onClick={() => {
                          if (window.confirm('Voulez-vous réinitialiser le catalogue avec les produits d\'origine de la marque ?')) {
                            resetProducts();
                            refreshData();
                            onProductsUpdated();
                          }
                        }}
                        className="px-4 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Restaurer Catalogue d'Origine</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}


              {/* TAB 4: FREE HOSTING & ANDROID GUIDE */}
              {activeTab === 'guide' && (
                <div className="space-y-6 max-w-3xl font-sans-clean text-xs leading-relaxed text-zinc-300">
                  <div className="p-5 rounded-2xl bg-[#16161A] border border-[#D4AF37]/30 space-y-3">
                    <div className="flex items-center gap-2 text-[#D4AF37] font-serif-luxury text-base font-bold">
                      <Smartphone className="w-5 h-5" />
                      <span>Guide Pratique : Gérer et Héberger Gratuitement Products Global Dz</span>
                    </div>
                    <p className="text-zinc-400">
                      Ce guide a été spécialement conçu pour vous permettre de piloter votre boutique depuis votre smartphone Android avec 0 Dinar de budget initial.
                    </p>
                  </div>

                  {/* Section 1 */}
                  <div className="p-4 rounded-xl bg-[#141417] border border-zinc-800 space-y-2">
                    <h4 className="text-sm font-bold text-white text-[#F3E5AB]">
                      1. Comment modifier prix et photos depuis votre téléphone Android :
                    </h4>
                    <ul className="list-disc list-inside space-y-1.5 text-zinc-400">
                      <li>Ouvrez votre site sur Google Chrome sur votre téléphone.</li>
                      <li>Cliquez sur l'icône de cadenas en haut à droite du site.</li>
                      <li>Entrez votre code PIN (par défaut : <strong>1234</strong>).</li>
                      <li>Cliquez sur <strong>"Modifier"</strong> sur n'importe quel produit pour ajuster le prix en DA.</li>
                      <li>Pour changer la photo, cliquez sur <strong>"📷 Charger une photo depuis votre téléphone"</strong> : vous pouvez choisir directement une photo de votre galerie Android ou prendre une photo avec votre caméra !</li>
                      <li>Cliquez sur <strong>"Enregistrer"</strong> : le site s'actualise immédiatement et conserve vos modifications.</li>
                    </ul>
                  </div>

                  {/* Section 2 */}
                  <div className="p-4 rounded-xl bg-[#141417] border border-zinc-800 space-y-2">
                    <h4 className="text-sm font-bold text-white text-[#F3E5AB]">
                      2. Hébergement 100% Gratuit sur Vercel ou Netlify :
                    </h4>
                    <p className="text-zinc-400">
                      Cette boutique est une Progressive Web Application (PWA) ultra-rapide construite en Vite + React. Elle est totalement compatible avec les plans gratuits à vie de <strong>Vercel</strong> ou <strong>Netlify</strong>.
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-zinc-400">
                      <li>Créez un compte gratuit sur <strong>GitHub.com</strong> (depuis votre téléphone ou ordinateur).</li>
                      <li>Publiez le code source sur votre dépôt GitHub.</li>
                      <li>Connectez-vous sur <strong>Vercel.com</strong> avec GitHub, cliquez sur <em>"Add New Project"</em> et sélectionnez le dépôt.</li>
                      <li>Vercel compile automatiquement le site en 30 secondes et vous offre un lien sécurisé HTTPS gratuit comme : <code className="text-[#D4AF37]">https://products-global-dz.vercel.app</code>.</li>
                    </ol>
                  </div>

                  {/* Section 3 */}
                  <div className="p-4 rounded-xl bg-[#141417] border border-zinc-800 space-y-2">
                    <h4 className="text-sm font-bold text-white text-[#F3E5AB]">
                      3. Domaine Personnalisé vs Sous-domaine Gratuit :
                    </h4>
                    <p className="text-zinc-400">
                      - <strong>Option Gratuite (0 DA) :</strong> Vercel et Netlify fournissent un sous-domaine gratuit illimité avec certificat SSL HTTPS automatique.
                    </p>
                    <p className="text-zinc-400">
                      - <strong>Domaine .DZ ou .COM :</strong> Un domaine personnalisé .dz nécessite un enregistrement auprès du NIC.DZ ou d'un registrar algérien agréé. Si votre budget initial est de zéro, le sous-domaine Vercel est amplement suffisant pour lancer vos ventes sur WhatsApp, Instagram et TikTok !
                    </p>
                  </div>

                  {/* Section 4 */}
                  <div className="p-4 rounded-xl bg-[#141417] border border-zinc-800 space-y-2">
                    <h4 className="text-sm font-bold text-white text-[#F3E5AB]">
                      4. Sauvegarde régulière de votre catalogue :
                    </h4>
                    <p className="text-zinc-400">
                      Dans l'onglet <strong>"Paramètres & Sauvegarde"</strong>, cliquez sur <strong>"Télécharger la sauvegarde JSON"</strong>. Cela télécharge un petit fichier de sauvegarde sur votre téléphone. Si vous changez de téléphone, vous pouvez restaurer l'intégralité de vos produits en 1 clic !
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
