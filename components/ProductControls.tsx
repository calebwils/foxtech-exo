import React from 'react';
import { ProductFilters, SortField, SortOrder } from '../types';
import { CATEGORIES } from '../constants';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface ProductControlsProps {
  filters: ProductFilters;
  setQuery: (q: string) => void;
  setCategory: (cat: string) => void;
  setSort: (field: SortField, order: SortOrder) => void;
}

export const ProductControls: React.FC<ProductControlsProps> = ({
  filters,
  setQuery,
  setCategory,
  setSort,
}) => {
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const [field, order] = value.split('-') as [SortField, SortOrder];
    setSort(field, order);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* Search */}
        <div className="md:col-span-5 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={filters.q}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-fox-500 focus:border-fox-500 transition duration-150 sm:text-sm"
          />
        </div>

        {/* Category Filter */}
        <div className="md:col-span-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
          </div>
          <select
            value={filters.category}
            onChange={(e) => setCategory(e.target.value)}
            className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg leading-5 bg-slate-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-fox-500 focus:border-fox-500 sm:text-sm appearance-none cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>

        {/* Sort Control */}
        <div className="md:col-span-3 relative">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ArrowUpDown className="h-4 w-4 text-slate-400" />
          </div>
          <select
            value={`${filters.sort}-${filters.order}`}
            onChange={handleSortChange}
             className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg leading-5 bg-slate-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-fox-500 focus:border-fox-500 sm:text-sm appearance-none cursor-pointer"
          >
            <option value={`${SortField.TITLE}-${SortOrder.ASC}`}>Name (A-Z)</option>
            <option value={`${SortField.TITLE}-${SortOrder.DESC}`}>Name (Z-A)</option>
            <option value={`${SortField.PRICE}-${SortOrder.ASC}`}>Price (Low-High)</option>
            <option value={`${SortField.PRICE}-${SortOrder.DESC}`}>Price (High-Low)</option>
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