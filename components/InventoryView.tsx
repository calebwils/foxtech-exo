

import React, { useState } from 'react';
import { Product, ProductFilters } from '../types';
import { Pagination } from './Pagination';
import { Loader } from './Loader';
import { EditProductModal } from './EditProductModal';
import { Search, AlertTriangle, CheckCircle, XCircle, Edit2, FileText, Loader2, Eye, EyeOff, Store, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';

interface InventoryViewProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
  setQuery: (q: string) => void;
  setPage: (page: number) => void;
  totalPages: number;
  total: number;
  refresh: () => void;
  onUpdateProduct: (product: Product) => Promise<void>;
  onViewStore: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  loading,
  error,
  filters,
  setQuery,
  setPage,
  totalPages,
  total,
  refresh,
  onUpdateProduct,
  onViewStore
}) => {
  const { user } = useAuth();
  const { t, formatPrice } = useI18n();
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isSuperAdmin = user?.role === 'admin';
  const isSeller = user?.role === 'seller';
  
  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return { label: t('inv.status.out'), color: 'text-red-700 bg-red-50 ring-red-600/20', icon: XCircle };
    }
    if (stock < 10) {
      return { label: t('inv.status.low'), color: 'text-yellow-800 bg-yellow-50 ring-yellow-600/20', icon: AlertTriangle };
    }
    return { label: t('inv.status.in'), color: 'text-green-700 bg-green-50 ring-green-600/20', icon: CheckCircle };
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleToggleVisibility = async (product: Product) => {
    await onUpdateProduct({ ...product, hidden: !product.hidden });
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      // ... CSV generation logic ...
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <EditProductModal 
        isOpen={isEditModalOpen}
        product={editingProduct}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={onUpdateProduct}
      />

      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
             {isSuperAdmin ? t('inv.title_global') : isSeller ? `${user?.storeName || 'My Store'} ${t('inv.title_my')}` : t('inv.title_my')}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {isSuperAdmin 
              ? t('inv.subtitle_admin')
              : t('inv.subtitle_seller')}
          </p>
        </div>
        
        {isSeller && (
            <button 
                onClick={onViewStore}
                className="mt-4 sm:mt-0 flex items-center gap-2 text-sm font-medium text-fox-600 bg-fox-50 px-4 py-2 rounded-lg border border-fox-100 hover:bg-fox-100 transition-colors"
                title="See how customers see your store"
            >
                <ExternalLink className="w-4 h-4" />
                {t('inv.view_public')}
            </button>
        )}
      </div>

      {/* Inventory Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-lg border border-slate-200 shadow-sm gap-4">
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder={t('inv.search')}
            value={filters.q}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-fox-500 focus:border-fox-500 sm:text-sm"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={refresh}
            className="text-sm text-fox-600 font-medium hover:text-fox-700 whitespace-nowrap"
          >
            {t('inv.refresh')}
          </button>
          
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating || loading}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-fox-600" />
                {t('inv.generating')}
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 text-slate-500" />
                {t('inv.export')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12">
            <Loader />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">{t('inv.empty')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('inv.col.product')}</th>
                  {isSuperAdmin && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('inv.col.seller')}</th>
                  )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('inv.col.category')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('inv.col.price')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('inv.col.stock')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('inv.col.status')}</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {products.map((product) => {
                  const status = getStockStatus(product.stock);
                  const StatusIcon = status.icon;
                  return (
                    <tr 
                      key={product.id} 
                      className={`hover:bg-slate-50 transition-colors ${product.hidden ? 'opacity-60 bg-slate-50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 relative">
                            <img className={`h-10 w-10 rounded-md object-cover bg-slate-100 ${product.hidden ? 'grayscale' : ''}`} src={product.imageUrl} alt="" />
                            {product.hidden && (
                              <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-md">
                                <EyeOff className="w-4 h-4 text-slate-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                {product.title}
                                {product.hidden && <span className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">Hidden</span>}
                            </div>
                            <div className="text-xs text-slate-500">ID: {product.id}</div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Seller Info Column for Admins */}
                      {isSuperAdmin && (
                         <td className="px-6 py-4 whitespace-nowrap">
                             <div className="flex items-center gap-2">
                                <Store className="w-4 h-4 text-slate-400" />
                                <div className="text-sm text-slate-700 font-medium">
                                  {product.sellerName || 'Unknown Store'}
                                </div>
                             </div>
                             <div className="text-xs text-slate-400 ml-6">ID: {product.sellerId}</div>
                         </td>
                      )}

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-mono">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                        {product.stock} units
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleEditClick(product)}
                            className="text-slate-400 hover:text-fox-600 p-1 hover:bg-fox-50 rounded-full transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleToggleVisibility(product)}
                            className={`p-1 rounded-full transition-colors ${product.hidden ? 'text-slate-500 bg-slate-100 hover:text-fox-600' : 'text-slate-400 hover:text-fox-600 hover:bg-fox-50'}`}
                            title={product.hidden ? "Show in Store" : "Hide from Store"}
                          >
                            {product.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && products.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50">
            <Pagination
              currentPage={filters.page}
              totalPages={totalPages}
              totalItems={total}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};