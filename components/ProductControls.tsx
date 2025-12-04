
import React from 'react';
import { ProductFilters, SortField, SortOrder } from '../types';
import { Search, ArrowUpDown, Store } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

interface ProductControlsProps {
  filters: ProductFilters;
  setQuery: (q: string) => void;
  setStoreQuery: (q: string) => void;
  setCategory: (cat: string) => void;
  setSort: (field: SortField, order: SortOrder) => void;
}

export const ProductControls: React.FC<ProductControlsProps> = ({
  filters,
  setQuery,
  setStoreQuery,
  setSort,
}) => {
  const { t } = useI18n();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const [field, order] = value.split('-') as [SortField, SortOrder];
    setSort(field, order);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Product Search */}
        <div className="relative w-full md:flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder={t('search.placeholder')}
            value={filters.q}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-fox-500 focus:border-fox-500 transition duration-150 sm:text-sm"
          />
        </div>

        {/* Store Search - NEW */}
        <div className="relative w-full md:flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Store className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search for a Store / Seller..."
            value={filters.storeQuery || ''}
            onChange={(e) => setStoreQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-fox-500 focus:border-fox-500 transition duration-150 sm:text-sm"
          />
        </div>

        {/* Sort Control */}
        <div className="relative w-full md:w-auto min-w-[200px]">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ArrowUpDown className="h-4 w-4 text-slate-400" />
          </div>
          <select
            value={`${filters.sort}-${filters.order}`}
            onChange={handleSortChange}
             className="block w-full pl-10 pr-8 py-2 border border-slate-300 rounded-lg leading-5 bg-slate-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-fox-500 focus:border-fox-500 sm:text-sm appearance-none cursor-pointer"
          >
            <option value={`${SortField.TITLE}-${SortOrder.ASC}`}>{t('sort.nameAZ')}</option>
            <option value={`${SortField.TITLE}-${SortOrder.DESC}`}>{t('sort.nameZA')}</option>
            <option value={`${SortField.PRICE}-${SortOrder.ASC}`}>{t('sort.priceLow')}</option>
            <option value={`${SortField.PRICE}-${SortOrder.DESC}`}>{t('sort.priceHigh')}</option>
          </select>
           <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};