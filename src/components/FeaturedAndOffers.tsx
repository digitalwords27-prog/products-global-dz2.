import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  SlidersHorizontal, 
  Flame, 
  Star, 
  Clock, 
  X,
  PackageOpen
} from 'lucide-react';
import { Product, CategoryId, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { ProductCard } from './ProductCard';

interface FeaturedAndOffersProps {
  products: Product[];
  language: Language;
  selectedCategory: CategoryId;
  onSelectCategory: (cat: CategoryId) => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onDirectOrder: (product: Product) => void;
  isAdminLoggedIn?: boolean;
  onQuickEditProduct?: (product: Product) => void;
}

type TabType = 'all' | 'featured' | 'new' | 'offers';

export const FeaturedAndOffers: React.FC<FeaturedAndOffersProps> = ({
  products,
  language,
  selectedCategory,
  onSelectCategory,
  onAddToCart,
  onQuickView,
  onDirectOrder,
  isAdminLoggedIn,
  onQuickEditProduct,
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Filter products based on tab, category, search query, in-stock
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // 1. Tab filter
      if (activeTab === 'featured' && !item.isFeatured) return false;
      if (activeTab === 'new' && !item.isNewArrival) return false;
      if (activeTab === 'offers') {
        // Special offers section: only display discounts configured
        const hasDiscount = (item.isSpecialOffer || (item.originalPrice && item.originalPrice > item.price));
        if (!hasDiscount) return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // 3. In stock filter
      if (inStockOnly && !item.inStock) {
        return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(query) ||
          (item.nameAr && item.nameAr.toLowerCase().includes(query)) ||
          (item.nameEn && item.nameEn.toLowerCase().includes(query));
        const matchDesc = item.description.toLowerCase().includes(query) ||
          (item.descriptionAr && item.descriptionAr.toLowerCase().includes(query)) ||
          (item.descriptionEn && item.descriptionEn.toLowerCase().includes(query));

        if (!matchName && !matchDesc) return false;
      }

      return true;
    });
  }, [products, activeTab, selectedCategory, searchQuery, inStockOnly]);

  const clearFilters = () => {
    setActiveTab('all');
    onSelectCategory('all');
    setSearchQuery('');
    setInStockOnly(false);
  };

  return (
    <section id="catalog" className="py-16 bg-[#0B0B0C] min-h-[600px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18181C] border border-[#D4AF37]/30 text-xs font-semibold text-[#D4AF37] mb-2.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Catalogue Prestige Products Global Dz</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-white">
              Nos Sélections Exclusives
            </h2>
            <p className="text-sm text-zinc-400 mt-1 font-sans-clean">
              Parfums, cosmétiques, soins et montres disponibles immédiatement pour livraison en Algérie.
            </p>
          </div>

          {/* Search Bar Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.filter.searchPlaceholder}
              className="w-full bg-[#141417] border border-zinc-800 focus:border-[#D4AF37] rounded-xl pl-10 pr-9 rtl:pr-10 rtl:pl-9 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4 mb-8">
          
          {/* Main 4 Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/15'
                  : 'bg-[#151518] text-zinc-300 hover:bg-[#1E1E22] hover:text-white'
              }`}
            >
              {t.filter.all}
            </button>

            <button
              onClick={() => setActiveTab('featured')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'featured'
                  ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/15'
                  : 'bg-[#151518] text-zinc-300 hover:bg-[#1E1E22] hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>{t.filter.featured}</span>
            </button>

            <button
              onClick={() => setActiveTab('new')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'new'
                  ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/15'
                  : 'bg-[#151518] text-zinc-300 hover:bg-[#1E1E22] hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{t.filter.newArrivals}</span>
            </button>

            <button
              onClick={() => setActiveTab('offers')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'offers'
                  ? 'bg-gradient-to-r from-amber-500 to-[#D4AF37] text-black shadow-lg'
                  : 'bg-[#151518] text-amber-300 hover:bg-[#1E1E22]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.filter.specialOffers}</span>
            </button>
          </div>

          {/* In-Stock Toggle */}
          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded bg-[#141417] border-zinc-700 text-[#D4AF37] focus:ring-0 focus:ring-offset-0 w-4 h-4 accent-[#D4AF37]"
            />
            <span>{t.filter.inStockOnly}</span>
          </label>
        </div>

        {/* Active Category Indicator if filtered */}
        {selectedCategory !== 'all' && (
          <div className="mb-6 flex items-center gap-2 text-xs text-zinc-400">
            <span>Filtre catégorie actif :</span>
            <span className="bg-[#1C1C20] border border-[#D4AF37]/40 text-[#F3E5AB] px-3 py-1 rounded-full flex items-center gap-2">
              {t.categoriesSection[selectedCategory as keyof typeof t.categoriesSection]}
              <button 
                onClick={() => onSelectCategory('all')} 
                className="hover:text-red-400"
                aria-label="Effacer catégorie"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          </div>
        )}

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                language={language}
                onAddToCart={onAddToCart}
                onQuickView={onQuickView}
                onDirectOrder={onDirectOrder}
                isAdminLoggedIn={isAdminLoggedIn}
                onQuickEdit={onQuickEditProduct}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 text-center rounded-2xl bg-[#121215] border border-zinc-800/80 p-8 max-w-lg mx-auto">
            <PackageOpen className="w-12 h-12 text-[#D4AF37]/60 mx-auto mb-3" />
            <h3 className="text-lg font-serif-luxury font-bold text-white mb-1">
              {t.filter.noResults}
            </h3>
            <p className="text-xs text-zinc-400 mb-5">
              Essayez de modifier votre recherche ou d'explorer une autre catégorie.
            </p>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 rounded-lg bg-[#D4AF37] text-black font-semibold text-xs hover:bg-[#F3E5AB] transition-colors"
            >
              {t.filter.clearFilter}
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
