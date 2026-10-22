import React from 'react';
import { Sparkles } from 'lucide-react';
import { CategoryId, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface CategoryBarProps {
  language: Language;
  selectedCategory: CategoryId;
  onSelectCategory: (catId: CategoryId) => void;
}

interface CategoryMeta {
  id: CategoryId;
  key: 'perfumes' | 'cosmetics' | 'skincare' | 'beautyAccessories' | 'fashionAccessories' | 'watchesMen' | 'watchesWomen';
  image: string;
}

const CATEGORIES: CategoryMeta[] = [
  {
    id: 'perfumes',
    key: 'perfumes',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cosmetics',
    key: 'cosmetics',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'skincare',
    key: 'skincare',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'beauty-accessories',
    key: 'beautyAccessories',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'fashion-accessories',
    key: 'fashionAccessories',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'watches-men',
    key: 'watchesMen',
    image: 'https://img.magnific.com/vecteurs-premium/image-noir-blanc-montre-mot-casque-dur-dessus_1249027-354.jpg?semt=ais_hybrid&w=740&q=80',
  },
  {
    id: 'watches-women',
    key: 'watchesWomen',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPkSfdkKPwx9Mc4qQQR6GqrkoJkpdmNuc4-HMwof0EkA&s=10',
  },
];

export const CategoryBar: React.FC<CategoryBarProps> = ({
  language,
  selectedCategory,
  onSelectCategory,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <section id="categories" className="py-12 bg-[#0E0E10] border-y border-zinc-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18181C] border border-[#D4AF37]/30 text-xs font-semibold text-[#D4AF37] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.categoriesSection.title}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-white mb-2">
            Explorez par Gamme d'Exception
          </h2>
          <p className="text-sm text-zinc-400 font-sans-clean">
            {t.categoriesSection.subtitle}
          </p>
        </div>

        {/* Categories Horizontal Carousel / Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          
          {/* All categories pill */}
          <button
            onClick={() => onSelectCategory('all')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 group col-span-2 sm:col-span-1 ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-b from-[#1E1E24] to-[#121215] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10'
                : 'bg-[#141417] border-zinc-800 hover:border-[#D4AF37]/50'
            }`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105 ${
              selectedCategory === 'all' ? 'bg-[#D4AF37] text-black' : 'bg-zinc-800 text-[#D4AF37]'
            }`}>
              <Sparkles className="w-6 h-6" />
            </div>
            <span className={`text-xs font-semibold ${
              selectedCategory === 'all' ? 'text-[#F3E5AB]' : 'text-zinc-300 group-hover:text-white'
            }`}>
              {t.categoriesSection.all}
            </span>
          </button>

          {/* 7 Specific Categories */}
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const title = t.categoriesSection[cat.key];

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`relative overflow-hidden rounded-xl border p-2.5 flex flex-col items-center text-center transition-all duration-300 group ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#1F1E1B] to-[#141417] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/15 ring-1 ring-[#D4AF37]'
                    : 'bg-[#141417] border-zinc-800/80 hover:border-[#D4AF37]/40 hover:-translate-y-1'
                }`}
              >
                {/* Round Category Photo */}
                <div className="w-16 h-16 sm:w-14 sm:h-14 rounded-full overflow-hidden mb-2 p-0.5 bg-gradient-to-tr from-[#D4AF37] to-zinc-700">
                  <img
                    src={cat.image}
                    alt={title}
                    className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>

                <span className={`text-xs font-semibold leading-tight line-clamp-1 ${
                  isSelected ? 'text-[#F3E5AB]' : 'text-zinc-200 group-hover:text-[#D4AF37]'
                }`}>
                  {title}
                </span>

                {/* Subtitle preview */}
                <span className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1 font-sans-clean hidden sm:block">
                  {t.categoriesSection[`${cat.key}Desc` as keyof typeof t.categoriesSection] || ''}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
