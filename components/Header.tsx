import React from 'react';
import { Boxes, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export const Header: React.FC = () => {
  const { totalItems, toggleCart } = useCart();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-2 text-fox-600">
              <Boxes className="h-8 w-8" />
              <span className="font-bold text-2xl tracking-tight text-slate-900">
                FOX<span className="text-fox-600">TECH</span>
              </span>
            </div>
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              <a href="#" className="border-b-2 border-fox-500 text-slate-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
                Dashboard
              </a>
              <a href="#" className="border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 inline-flex items-center px-1 pt-1 text-sm font-medium">
                Inventory
              </a>
              <a href="#" className="border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 inline-flex items-center px-1 pt-1 text-sm font-medium">
                Analytics
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <div className="flex-shrink-0">
              <button 
                onClick={toggleCart}
                className="relative p-2 text-slate-500 hover:text-fox-600 transition-colors"
              >
                <ShoppingBag className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-fox-600 rounded-full border-2 border-white">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
             <div className="flex-shrink-0 hidden sm:block">
              <button className="relative inline-flex items-center gap-x-1.5 rounded-md bg-fox-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-fox-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fox-600 transition-colors">
                New Product
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};