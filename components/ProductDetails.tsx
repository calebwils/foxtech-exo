
import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useI18n } from '../contexts/I18nContext';
import { 
  Star, ShoppingCart, Heart, ArrowLeft, Truck, 
  Box, ShieldCheck, MapPin, Clock, Info, Check, CreditCard, ExternalLink
} from 'lucide-react';

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack }) => {
  const { addToCart } = useCart();
  const { t, formatPrice, currency } = useI18n();
  const [selectedImage, setSelectedImage] = useState(product.imageUrl);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Calculate installments
  const installmentPrice = formatPrice(product.price / 4 + 0.5);
  const ecoPart = formatPrice(0.85);
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  // Mock current time for delivery cutoff
  const now = new Date();
  const cutoffHours = 18; // 6 PM
  const remainingHours = Math.max(0, cutoffHours - now.getHours());
  const remainingMinutes = 60 - now.getMinutes();

  const handleAddToCart = () => {
    // Add quantity times
    for(let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };
  
  const placeholderUrl = `https://placehold.co/600x600/f1f5f9/475569?text=${encodeURIComponent(product.title.substring(0, 20))}`;

  return (
    <div className="bg-white min-h-screen animate-in fade-in duration-300 pb-12">
      {/* Breadcrumb / Back */}
      <div className="border-b border-slate-200 sticky top-16 bg-white/80 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <button 
            onClick={onBack}
            className="flex items-center text-sm font-medium text-slate-500 hover:text-fox-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t('details.back')}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          
          {/* LEFT COLUMN: Images & Description */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Gallery */}
            <div className="space-y-4">
              <div className="aspect-square w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm relative">
                <img 
                  src={imageError ? placeholderUrl : selectedImage} 
                  alt={product.title} 
                  onError={() => setImageError(true)}
                  className="h-full w-full object-contain object-center p-2"
                  loading="eager"
                />
                {product.isPromo && (
                   <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                     {t('product.promo')} -{discount}%
                   </span>
                )}
              </div>
              <div className="grid grid-cols-5 gap-4">
                <button 
                   onClick={() => { setSelectedImage(product.imageUrl); setImageError(false); }}
                   className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === product.imageUrl ? 'border-fox-600 ring-2 ring-fox-600/20' : 'border-transparent hover:border-slate-300'}`}
                >
                  <img 
                    src={product.imageUrl} 
                    onError={(e) => e.currentTarget.src = placeholderUrl}
                    className="w-full h-full object-contain bg-white" 
                    alt="Main" 
                    loading="lazy"
                  />
                </button>
                {product.images?.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => { setSelectedImage(img); setImageError(false); }}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-fox-600 ring-2 ring-fox-600/20' : 'border-transparent hover:border-slate-300'}`}
                  >
                    <img 
                      src={img} 
                      onError={(e) => e.currentTarget.src = placeholderUrl}
                      className="w-full h-full object-contain bg-white" 
                      alt={`View ${idx}`} 
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs / Info */}
            <div>
              <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  <button className="border-fox-500 text-fox-600 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium">
                    {t('details.description')}
                  </button>
                  <button className="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium">
                    {t('details.specs')}
                  </button>
                  <button className="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium">
                    {t('details.reviews')} ({Math.floor(product.rating * 14)})
                  </button>
                </nav>
              </div>
              <div className="py-6 text-slate-600 leading-relaxed space-y-4">
                <h2 className="text-xl font-bold text-slate-900">{product.title}</h2>
                <p>{product.description}</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                   <li>Brand: <span className="font-semibold text-slate-900">{product.brand}</span></li>
                   <li>Color: <span className="font-semibold text-slate-900 capitalize">{product.color}</span></li>
                   <li>Condition: <span className="font-semibold text-slate-900 capitalize">{product.condition}</span></li>
                </ul>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Buy Box & Logistics */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="sticky top-24 space-y-6">
              
              {/* Main Buy Box */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  {/* Pricing */}
                  <div className="flex items-end gap-3 mb-1">
                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                       <span className="text-lg text-slate-400 line-through font-medium mb-1">
                         {formatPrice(product.originalPrice)}
                       </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    {product.originalPrice && (
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                        -{discount}%
                      </span>
                    )}
                    <span className="text-xs text-slate-500 flex items-center">
                      <Info className="w-3 h-3 mr-1" />
                      {t('details.ecoPart')} {ecoPart}
                    </span>
                  </div>

                  {/* Installments */}
                  <div className="bg-slate-50 rounded-lg p-3 mb-6 border border-slate-100">
                     <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-slate-900 flex items-center">
                          <CreditCard className="w-4 h-4 mr-2 text-fox-600" />
                          {t('details.financing')}
                        </span>
                        <span className="font-bold text-slate-900">{installmentPrice}</span>
                     </div>
                     <p className="text-xs text-slate-500">
                       (2.1% fee included)
                     </p>
                  </div>
                  
                  {/* 30 Days Low */}
                  <div className="text-xs text-slate-500 mb-6">
                     Prix le + bas sur 30j : <span className="font-medium text-slate-900">{formatPrice(product.price * 0.95)}</span>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                       {/* Quantity */}
                       <div className="w-32">
                          <label className="block text-xs font-medium text-slate-700 mb-1">{t('details.quantity')}</label>
                          <div className="relative rounded-md shadow-sm">
                            <select 
                              value={quantity}
                              onChange={(e) => setQuantity(parseInt(e.target.value))}
                              className="block w-full rounded-md border-slate-300 py-2 pl-3 pr-10 text-base focus:border-fox-500 focus:outline-none focus:ring-fox-500 sm:text-sm"
                            >
                              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                <option key={n} value={n}>{n}</option>
                              ))}
                            </select>
                          </div>
                       </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleAddToCart}
                        className="flex-1 bg-fox-600 text-white px-6 py-3.5 rounded-lg font-bold text-lg shadow-md shadow-fox-200 hover:bg-fox-500 transition-all flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        {t('details.addToCart')}
                      </button>
                      <button 
                        onClick={() => setIsFavorite(!isFavorite)}
                        className={`px-4 py-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors ${isFavorite ? 'text-red-500 bg-red-50 border-red-200' : 'text-slate-400'}`}
                      >
                        <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Seller Info */}
                <div className="px-6 py-4 bg-slate-50 flex items-center justify-between text-sm">
                   <span className="text-slate-600">{t('details.soldBy')}</span>
                   <span className="font-bold text-slate-900 flex items-center">
                     Foxtech Official
                     {product.isProSeller && <ShieldCheck className="w-4 h-4 text-fox-600 ml-1" />}
                   </span>
                </div>
                
                {product.sourceUrl && (
                  <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50">
                      <a 
                        href={product.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-slate-500 hover:text-fox-600 font-medium flex items-center justify-center"
                      >
                        <ExternalLink className="w-3 h-3 mr-1.5" />
                        View original product on Source
                      </a>
                  </div>
                )}

              </div>

              {/* Delivery Info Panel */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                 <h3 className="font-bold text-slate-900 flex items-center">
                   <Truck className="w-5 h-5 mr-2 text-slate-400" />
                   {t('details.deliveryInfo')}
                 </h3>
                 
                 {/* Location */}
                 <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {t('details.deliveringTo')}: <span className="text-fox-600 border-b border-dashed border-fox-300 cursor-pointer">Paris, France</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Update location to see exact dates</p>
                    </div>
                 </div>

                 {/* Speed */}
                 <div className="space-y-4">
                    <div className="flex items-start gap-3">
                       <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                       </div>
                       <div>
                          <span className="block text-sm font-bold text-green-700">{t('details.freeDelivery')}</span>
                          <span className="text-xs text-slate-500">{t('details.freeDeliverySub')} {formatPrice(50)}</span>
                       </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                       <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center mt-0.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                       </div>
                       <div>
                          <span className="block text-sm font-medium text-slate-900">
                            {t('details.getItBy')} <span className="font-bold">{t('details.tomorrow')}</span>
                          </span>
                          <span className="text-xs text-orange-600 font-medium">
                             {t('details.orderWithin')} {remainingHours}h {remainingMinutes}min
                          </span>
                       </div>
                    </div>
                 </div>

                 {/* Policies */}
                 <div className="pt-4 border-t border-slate-100 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                       <Box className="w-4 h-4 text-slate-400" />
                       <span>{t('details.returns')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                       <ShieldCheck className="w-4 h-4 text-slate-400" />
                       <span>{t('details.warranty')}</span>
                    </div>
                 </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
