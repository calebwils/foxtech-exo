
import React, { useState } from 'react';
import { ProductFilters } from '../types';
import { CATEGORIES } from '../constants';
import { Star, ChevronDown, ChevronUp, Search, Check } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

interface SidebarFiltersProps {
  filters: ProductFilters;
  onCategoryChange: (cat: string) => void;
  onToggleFilter: (type: keyof ProductFilters, value: string | number) => void;
  className?: string; // New prop for custom styling/visibility
}

const FilterSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-200 py-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left mb-2"
      >
        <span className="text-sm font-bold text-slate-900">{title}</span>
        {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>
      {isOpen && <div className="space-y-2 animate-in slide-in-from-top-1 duration-200">{children}</div>}
    </div>
  );
};

export const SidebarFilters: React.FC<SidebarFiltersProps> = ({ filters, onCategoryChange, onToggleFilter, className }) => {
  const { t, formatPrice } = useI18n();
  
  return (
    <div className={`flex-shrink-0 pr-4 ${className || 'w-64 hidden lg:block'}`}>
      <div className={className ? '' : 'sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent'}>
        <h3 className="text-lg font-bold text-slate-900 mb-4">{t('store.filters')}</h3>
        
        {/* Categories */}
        <FilterSection title={t('filter.category')}>
          <ul className="space-y-1.5">
            {CATEGORIES.filter(c => c !== 'All').map(cat => (
              <li key={cat}>
                <button 
                  onClick={() => onCategoryChange(filters.category === cat ? 'All' : cat)}
                  className={`text-sm block w-full text-left hover:text-fox-600 ${filters.category === cat ? 'text-fox-600 font-semibold' : 'text-slate-600'}`}
                >
                  {cat}
                </button>
              </li>
            ))}
            <li>
              <button className="text-sm text-fox-600 font-medium mt-1">{t('filter.showMore')}</button>
            </li>
          </ul>
        </FilterSection>

        {/* Livraison */}
        <FilterSection title={t('filter.delivery')}>
          {[
            { id: 'standard', label: t('filter.opt.standard') },
            { id: 'express', label: t('filter.opt.express') },
            { id: 'free', label: t('filter.opt.freeShip') }
          ].map(opt => (
             <label key={opt.id} className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.delivery.includes(opt.id) ? 'bg-fox-600 border-fox-600' : 'border-slate-300 bg-white group-hover:border-fox-400'}`}>
                {filters.delivery.includes(opt.id) && <Check className="w-3 h-3 text-white" />}
              </div>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={filters.delivery.includes(opt.id)} 
                onChange={() => onToggleFilter('delivery', opt.id)}
              />
              <span className="text-sm text-slate-600">{opt.label}</span>
            </label>
          ))}
        </FilterSection>

        {/* Prix */}
        <FilterSection title={t('filter.price')}>
          {[
            { id: '<10', label: `<${formatPrice(10)}` },
            { id: '10-20', label: `${formatPrice(10)} - ${formatPrice(20)}` },
            { id: '20-50', label: `${formatPrice(20)} - ${formatPrice(50)}` },
            { id: '50-100', label: `${formatPrice(50)} - ${formatPrice(100)}` },
            { id: '100-200', label: `${formatPrice(100)} - ${formatPrice(200)}` },
            { id: '500-1000', label: `${formatPrice(500)} - ${formatPrice(1000)}` }
          ].map(price => (
            <label key={price.id} className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.priceRange.includes(price.id) ? 'bg-fox-600 border-fox-600' : 'border-slate-300 bg-white group-hover:border-fox-400'}`}>
                {filters.priceRange.includes(price.id) && <Check className="w-3 h-3 text-white" />}
              </div>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={filters.priceRange.includes(price.id)} 
                onChange={() => onToggleFilter('priceRange', price.id)}
              />
              <span className="text-sm text-slate-600">{price.label}</span>
            </label>
          ))}
        </FilterSection>

        {/* Marque */}
        <FilterSection title={t('filter.brand')}>
          <div className="relative mb-2">
            <input 
              type="text" 
              placeholder={t('filter.searchBrand')} 
              className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 pl-7 bg-slate-50 focus:ring-1 focus:ring-fox-500 outline-none"
            />
            <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
          </div>
          {['TechGiant', 'FoxGear', 'LuxeLife', 'AutoPro'].map(brand => (
            <label key={brand} className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.brands.includes(brand) ? 'bg-fox-600 border-fox-600' : 'border-slate-300 bg-white group-hover:border-fox-400'}`}>
                {filters.brands.includes(brand) && <Check className="w-3 h-3 text-white" />}
              </div>
              <input type="checkbox" className="hidden" onChange={() => onToggleFilter('brands', brand)} />
              <span className="text-sm text-slate-600">{brand}</span>
            </label>
          ))}
        </FilterSection>

        {/* Couleur */}
        <FilterSection title={t('filter.color')} defaultOpen={false}>
          <div className="flex flex-wrap gap-2">
            {['black', 'white', 'blue', 'red', 'silver', 'gold', 'green'].map(color => (
              <button 
                key={color}
                onClick={() => onToggleFilter('colors', color)}
                className={`w-6 h-6 rounded-full border shadow-sm transition-transform ${filters.colors.includes(color) ? 'ring-2 ring-offset-2 ring-fox-600 scale-110' : 'border-slate-200 hover:scale-110'}`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </FilterSection>

        {/* Neuf ou occasion */}
        <FilterSection title={t('filter.condition')}>
          <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${filters.condition.includes('new') ? 'border-fox-600' : 'border-slate-300 bg-white'}`}>
                {filters.condition.includes('new') && <div className="w-2 h-2 bg-fox-600 rounded-full" />}
              </div>
              <input type="checkbox" className="hidden" onChange={() => onToggleFilter('condition', 'new')} />
              <span className="text-sm text-slate-600">{t('filter.opt.new')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
               <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${filters.condition.includes('used') ? 'border-fox-600' : 'border-slate-300 bg-white'}`}>
                {filters.condition.includes('used') && <div className="w-2 h-2 bg-fox-600 rounded-full" />}
              </div>
              <input type="checkbox" className="hidden" onChange={() => onToggleFilter('condition', 'used')} />
              <span className="text-sm text-slate-600">{t('filter.opt.used')}</span>
          </label>
        </FilterSection>

        {/* Vendeur */}
        <FilterSection title={t('filter.seller')} defaultOpen={false}>
           <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.isProSeller ? 'bg-fox-600 border-fox-600' : 'border-slate-300 bg-white'}`}>
                 {/* Just a visual toggle for this mock */}
                 <Check className="w-3 h-3 text-white opacity-0 group-hover:opacity-20" />
              </div>
              <span className="text-sm text-slate-600">{t('filter.opt.proSeller')}</span>
            </label>
        </FilterSection>

        {/* Avis clients */}
        <FilterSection title={t('filter.ratings')}>
          {[4, 3].map(rating => (
            <button 
              key={rating} 
              onClick={() => onToggleFilter('minRating', rating)}
              className={`flex items-center gap-2 w-full text-left px-1 py-0.5 rounded ${filters.minRating === rating ? 'bg-fox-50' : 'hover:bg-slate-50'}`}
            >
               <div className="flex text-yellow-400">
                 {[...Array(5)].map((_, i) => (
                   <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'fill-current' : 'text-slate-300'}`} />
                 ))}
               </div>
               <span className="text-sm text-slate-600">& +</span>
            </button>
          ))}
        </FilterSection>

         {/* A ne pas manquer */}
        <FilterSection title={t('filter.special')}>
           {[
              { id: 'member', label: 'Offre membre (3)' },
              { id: 'promo', label: 'Promo (3)' }
           ].map(offer => (
              <label key={offer.id} className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.specialOffers.includes(offer.id) ? 'bg-fox-600 border-fox-600' : 'border-slate-300 bg-white group-hover:border-fox-400'}`}>
                  {filters.specialOffers.includes(offer.id) && <Check className="w-3 h-3 text-white" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={filters.specialOffers.includes(offer.id)} 
                  onChange={() => onToggleFilter('specialOffers', offer.id)}
                />
                <span className="text-sm text-slate-600">{offer.label}</span>
              </label>
           ))}
        </FilterSection>
      </div>
    </div>
  );
};
