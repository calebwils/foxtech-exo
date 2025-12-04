
import React from 'react';
import { Product } from '../types';
import { BellRing, AlertCircle } from 'lucide-react';

interface HiddenProductCardProps {
  product: Product;
  onNotifyClick: (product: Product) => void;
}

export const HiddenProductCard: React.FC<HiddenProductCardProps> = ({ product, onNotifyClick }) => {
  return (
    <div className="group bg-slate-50 rounded-xl border border-slate-200 border-dashed relative flex flex-col h-full opacity-90 hover:opacity-100 hover:border-fox-300 transition-all duration-300">
      {/* Image Container - Desaturated */}
      <div className="relative h-48 overflow-hidden bg-white border-b border-slate-100 opacity-75 grayscale group-hover:grayscale-0 transition-all duration-500">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-contain p-4"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10">
            <span className="inline-flex items-center gap-1 bg-slate-800/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wide">
                <AlertCircle className="w-3 h-3" /> Out of Stock
            </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-2">
           <span className="text-xs text-slate-400 font-medium">Currently Unavailable</span>
        </div>

        <h3 className="text-lg font-bold text-slate-600 leading-tight mb-2">
          {product.title}
        </h3>
        
        <p className="text-sm text-slate-400 mb-4 line-clamp-2 flex-1">
          {product.description}
        </p>

        <div className="mt-auto pt-4 border-t border-slate-200 border-dashed">
            <p className="text-xs text-slate-500 mb-3 italic">
                Looking for this item? It will be available soon.
            </p>
            <button 
              onClick={() => onNotifyClick(product)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-fox-50 text-fox-700 font-semibold hover:bg-fox-100 hover:text-fox-800 transition-colors duration-200 border border-fox-200"
            >
              <BellRing className="w-4 h-4" />
              Notify Me When Arrives
            </button>
        </div>
      </div>
    </div>
  );
};
