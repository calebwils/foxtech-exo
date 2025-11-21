import React from 'react';
import { Product } from '../types';
import { Star, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = React.useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm text-fox-700 text-xs font-bold px-2 py-1 rounded-full shadow-sm uppercase tracking-wide">
            {product.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-slate-500 font-medium">{product.rating.toFixed(1)}</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Stock: {product.stock}</span>
        </div>

        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2 group-hover:text-fox-600 transition-colors">
          {product.title}
        </h3>
        
        <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400">Price</span>
            <span className="text-xl font-extrabold text-slate-900">${product.price.toFixed(2)}</span>
          </div>
          <button 
            onClick={handleAddToCart}
            className={`p-2 rounded-full transition-colors duration-200 shadow-sm ${
              added 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-slate-100 text-slate-700 hover:bg-fox-600 hover:text-white'
            }`}
            aria-label="Add to cart"
          >
            {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};