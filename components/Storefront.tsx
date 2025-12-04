
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ProductFilters, Product, SortField, SortOrder } from '../types';
import { ProductCard } from './ProductCard';
import { ProductDetails } from './ProductDetails';
import { HiddenProductCard } from './HiddenProductCard';
import { ProductControls } from './ProductControls';
import { SidebarFilters } from './SidebarFilters';
import { Loader } from './Loader';
import { AlertCircle, BellRing, Filter, ChevronLeft, ChevronRight, ArrowRight, Loader2, X } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

interface StorefrontProps {
  products: Product[];
  hiddenMatches: Product[];
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
  total: number;
  totalPages: number;
  setQuery: (q: string) => void;
  setStoreQuery: (q: string) => void;
  setCategory: (cat: string) => void;
  setSort: (field: SortField, order: SortOrder) => void;
  setPage: (page: number) => void;
  toggleFilter: (type: keyof ProductFilters, value: string | number) => void;
  refresh: () => void;
  onNotifyClick: (product: Product) => void;
  selectedProduct: Product | null;
  onProductSelect: (product: Product) => void;
  onClearSelection: () => void;
}

export const Storefront: React.FC<StorefrontProps> = ({
  products,
  hiddenMatches,
  loading,
  error,
  filters,
  total,
  totalPages,
  setQuery,
  setStoreQuery,
  setCategory,
  setSort,
  setPage,
  toggleFilter,
  refresh,
  onNotifyClick,
  selectedProduct,
  onProductSelect,
  onClearSelection
}) => {
  const { t } = useI18n();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Infinite Scroll Refs
  const observerTarget = useRef<HTMLDivElement>(null);

  const SLIDES = [
    {
      id: 1,
      title: t('hero.slide1.title'),
      subtitle: t('hero.slide1.subtitle'),
      cta: t('hero.slide1.cta'),
      image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80&w=2070",
      align: "left",
      color: "from-slate-900/90 to-transparent"
    },
    {
      id: 2,
      title: t('hero.slide2.title'),
      subtitle: t('hero.slide2.subtitle'),
      cta: t('hero.slide2.cta'),
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=2070",
      align: "right",
      color: "from-slate-900/80 to-transparent"
    },
    {
      id: 3,
      title: t('hero.slide3.title'),
      subtitle: t('hero.slide3.subtitle'),
      cta: t('hero.slide3.cta'),
      image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=2070",
      align: "left",
      color: "from-indigo-900/90 to-purple-900/40"
    },
    {
      id: 4,
      title: t('hero.slide4.title'),
      subtitle: t('hero.slide4.subtitle'),
      cta: t('hero.slide4.cta'),
      image: "https://images.unsplash.com/photo-1558002038-10917738179d?auto=format&fit=crop&q=80&w=2070",
      align: "center",
      color: "from-slate-900/60 via-slate-900/40 to-slate-900/60"
    },
    {
      id: 5,
      title: t('hero.slide5.title'),
      subtitle: t('hero.slide5.subtitle'),
      cta: t('hero.slide5.cta'),
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=2070",
      align: "right",
      color: "from-pink-900/80 to-transparent"
    },
    {
      id: 6,
      title: t('hero.slide6.title'),
      subtitle: t('hero.slide6.subtitle'),
      cta: t('hero.slide6.cta'),
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=2070",
      align: "left",
      color: "from-slate-900/90 via-slate-900/50 to-transparent"
    },
    {
      id: 7,
      title: t('hero.slide7.title'),
      subtitle: t('hero.slide7.subtitle'),
      cta: t('hero.slide7.cta'),
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=2070",
      align: "center",
      color: "from-emerald-900/80 via-slate-900/50 to-emerald-900/80"
    }
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, [SLIDES.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  // Infinite Scroll Logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && filters.page < totalPages) {
          setPage(filters.page + 1);
        }
      },
      { threshold: 0.5, rootMargin: '200px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loading, filters.page, totalPages, setPage]);

  const handleProductClick = (product: Product) => {
    onProductSelect(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler for store filtering from card
  const handleStoreFilter = (storeName: string) => {
    setStoreQuery(storeName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToGrid = () => {
    onClearSelection();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToShop = () => {
    const el = document.getElementById('shop-content');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  if (selectedProduct) {
    return <ProductDetails product={selectedProduct} onBack={handleBackToGrid} />;
  }

  return (
    <div>
      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileFiltersOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 right-0 w-[300px] max-w-[85vw] bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
             <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="font-bold text-lg text-slate-900">{t('store.filters')}</h3>
                <button 
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
             </div>
             <div className="p-4">
               <SidebarFilters 
                  filters={filters}
                  onCategoryChange={setCategory}
                  onToggleFilter={toggleFilter}
                  className="w-full block" // Force display
                />
             </div>
             <div className="p-4 border-t border-slate-100 sticky bottom-0 bg-white">
                <button 
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full bg-fox-600 text-white font-bold py-3 rounded-lg shadow-md"
                >
                  Show {total} Results
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Sliding Hero Banner */}
      <div 
        className="relative h-[500px] w-full overflow-hidden rounded-2xl mb-8 group shadow-2xl"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Slides Container */}
        <div 
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {SLIDES.map((slide) => (
            <div key={slide.id} className="relative w-full h-full flex-shrink-0">
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms]"
                style={{ backgroundImage: `url(${slide.image})` }}
              />
              
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.color}`}></div>
              
              {/* Content */}
              <div className={`relative z-10 h-full flex flex-col justify-center px-8 md:px-16 max-w-7xl mx-auto
                ${slide.align === 'center' ? 'items-center text-center' : slide.align === 'right' ? 'items-end text-right' : 'items-start text-left'}
              `}>
                <div className="max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg leading-tight">
                    {slide.title}
                  </h2>
                  <p className="text-lg md:text-xl text-slate-200 mb-8 font-light drop-shadow-md leading-relaxed">
                    {slide.subtitle}
                  </p>
                  <button 
                    onClick={scrollToShop}
                    className="group bg-fox-600 hover:bg-fox-500 text-white px-8 py-3.5 rounded-full font-bold transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-fox-500/30 flex items-center gap-2 mx-auto md:mx-0"
                  >
                    {slide.cta}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/20"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/20"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === idx 
                  ? 'bg-fox-500 w-8 shadow-lg shadow-fox-500/50' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      <div id="shop-content" className="flex flex-col lg:flex-row gap-8 scroll-mt-24">
        
        {/* Left Sidebar (Desktop Only) */}
        <SidebarFilters 
          filters={filters}
          onCategoryChange={setCategory}
          onToggleFilter={toggleFilter}
        />

        {/* Right Grid Area */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-2xl font-bold text-slate-900">{t('store.latestArrivals')}</h2>
             <button 
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 text-sm font-medium text-slate-600 bg-white px-3 py-2 rounded border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
             >
               <Filter className="w-4 h-4" /> {t('store.filters')}
             </button>
          </div>

          <ProductControls
            filters={filters}
            setQuery={setQuery}
            setStoreQuery={setStoreQuery}
            setCategory={setCategory}
            setSort={setSort}
          />

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6 border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading products</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                      <button
                      type="button"
                      onClick={refresh}
                      className="rounded-md bg-red-100 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {products.length === 0 && hiddenMatches.length === 0 && !loading && !error ? (
            <div className="text-center py-20 bg-white rounded-lg border border-dashed border-slate-300">
              <p className="text-slate-500 text-lg">{t('store.noResults')}</p>
              <button 
                onClick={() => { setQuery(''); setStoreQuery(''); }}
                className="mt-4 text-fox-600 font-medium hover:text-fox-700"
              >
                {t('store.clearSearch')}
              </button>
            </div>
          ) : (
            <>
              {/* Product Grid - Updated for 4 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Render Available Products */}
                {products.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onClick={handleProductClick}
                    onStoreClick={handleStoreFilter}
                  />
                ))}

                {/* Render Hidden/Out of Stock Matches */}
                {hiddenMatches.map((product) => (
                    <HiddenProductCard key={product.id} product={product} onNotifyClick={onNotifyClick} />
                ))}
              </div>
              
              {/* Loading Indicator for Infinite Scroll */}
              <div ref={observerTarget} className="py-8 flex justify-center w-full">
                {loading && (
                   <div className="flex items-center gap-2 text-fox-600 font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading more products...</span>
                   </div>
                )}
                {!loading && filters.page >= totalPages && products.length > 0 && (
                   <span className="text-sm text-slate-400">You've reached the end of the list</span>
                )}
              </div>

              {hiddenMatches.length > 0 && products.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-3">
                    <BellRing className="w-5 h-5 text-fox-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-900 font-medium">{t('store.outOfStockNotice')}</p>
                      <p className="text-xs text-blue-700">{t('store.outOfStockSub')}</p>
                    </div>
                  </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
