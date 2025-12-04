
import React, { useState } from 'react';
import { Product } from '../types';
import { Star, ShoppingCart, Check, Store } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useI18n } from '../contexts/I18nContext';

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
  onStoreClick?: (storeName: string) => void; // New prop handler
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, onStoreClick }) => {
  const { addToCart } = useCart();
  const { t, formatPrice } = useI18n();
  const [added, setAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleClick = () => {
    if (onClick) onClick(product);
  };

  const handleStoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStoreClick) {
        onStoreClick(product.sellerName);
    }
  };

  // Fallback image generator
  const placeholderUrl = `https://placehold.co/600x400/f1f5f9/475569?text=${encodeURIComponent(product.title.substring(0, 20))}`;

  return (
    <div 
      onClick={handleClick}
      className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-white border-b border-slate-100">
        <img
          src={imageError ? placeholderUrl : product.imageUrl}
          alt={product.title}
          onError={() => setImageError(true)}
          className="w-full h-full object-contain p-4 hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm text-fox-700 text-xs font-bold px-2 py-1 rounded-full shadow-sm uppercase tracking-wide">
            {product.category}
          </span>
        </div>
        {product.originalPrice && (
          <div className="absolute top-3 right-3">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm uppercase">
              {t('product.promo')}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-slate-500 font-medium">{product.rating.toFixed(1)}</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">{t('product.stock')}: {product.stock}</span>
        </div>

        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2 group-hover:text-fox-600 transition-colors line-clamp-2">
          {product.title}
        </h3>
        
        <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">
          {product.description}
        </p>

        {/* Store Name Display */}
        <div className="mb-3">
             <button 
                onClick={handleStoreClick}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-fox-600 hover:underline transition-colors bg-slate-50 px-2 py-1 rounded border border-slate-100 w-fit"
                title="View seller's store"
             >
                 <Store className="w-3 h-3" />
                 <span className="font-medium truncate max-w-[150px]">{product.sellerName}</span>
             </button>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex flex-col">
            {product.originalPrice && (
               <span className="text-xs text-slate-400 line-through">{formatPrice(product.originalPrice)}</span>
            )}
            <span className={`text-xl font-extrabold ${product.originalPrice ? 'text-red-600' : 'text-slate-900'}`}>
              {formatPrice(product.price)}
            </span>
          </div>
          <button 
            onClick={handleAddToCart}
            className={`p-2 rounded-full transition-colors duration-200 shadow-sm ${
              added 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-slate-100 text-slate-700 hover:bg-fox-600 hover:text-white'
            }`}
            aria-label="Add to cart"
            title={t('details.addToCart')}
          >
            {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};