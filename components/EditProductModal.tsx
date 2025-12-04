import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, RotateCcw } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Product } from '../types';

interface EditProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (product: Product) => Promise<void>;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({ isOpen, product, onClose, onSave }) => {
  const [formData, setFormData] = useState<Product | null>(null);
  const [priceInput, setPriceInput] = useState(''); // Add local string state for price
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({ ...product });
      setPriceInput(product.price.toString());
    }
  }, [product]);

  if (!isOpen || !formData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Use priceInput for the final payload
      const updatedProduct = {
        ...formData,
        price: parseFloat(priceInput) || 0
      };
      await onSave(updatedProduct);
      onClose();
    } catch (err) {
      setError('Failed to update product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Product, value: string | number) => {
    setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  return (
    <div className="relative z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-slate-200">
            
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit Product</h3>
                <p className="text-sm text-slate-500">ID: {formData.id}</p>
              </div>
              <button 
                onClick={onClose}
                className="rounded-full p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-6 space-y-6">
                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200 flex items-center">
                     <RotateCcw className="w-4 h-4 mr-2" />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
                  
                  {/* Product Name */}
                  <div className="sm:col-span-4">
                    <label htmlFor="edit-title" className="block text-sm font-medium leading-6 text-slate-900">
                      Product Name
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="title"
                        id="edit-title"
                        required
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-fox-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div className="sm:col-span-2">
                    <label htmlFor="edit-category" className="block text-sm font-medium leading-6 text-slate-900">
                      Category
                    </label>
                    <div className="mt-2">
                      <select
                        id="edit-category"
                        name="category"
                        required
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-fox-600 sm:text-sm sm:leading-6"
                      >
                        {CATEGORIES.filter(c => c !== 'All').map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="sm:col-span-3">
                    <label htmlFor="edit-price" className="block text-sm font-medium leading-6 text-slate-900">
                      Price ($)
                    </label>
                    <div className="mt-2 relative rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-slate-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="price"
                        id="edit-price"
                        required
                        min="0.01"
                        step="0.01"
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        className="block w-full rounded-md border-0 py-2 pl-7 pr-12 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-fox-600 sm:text-sm sm:leading-6 font-mono"
                      />
                    </div>
                  </div>

                  {/* Stock Level */}
                  <div className="sm:col-span-3">
                    <label htmlFor="edit-stock" className="block text-sm font-medium leading-6 text-slate-900">
                      Stock Level (Qty)
                    </label>
                    <div className="mt-2 flex items-center gap-2">
                       <button 
                         type="button" 
                         onClick={() => handleInputChange('stock', Math.max(0, formData.stock - 10))}
                         className="px-2 py-1.5 bg-slate-100 rounded border border-slate-200 hover:bg-slate-200 text-xs font-medium"
                       >
                         -10
                       </button>
                       <button 
                         type="button" 
                         onClick={() => handleInputChange('stock', Math.max(0, formData.stock - 1))}
                         className="px-2 py-1.5 bg-slate-100 rounded border border-slate-200 hover:bg-slate-200 text-xs font-medium"
                       >
                         -1
                       </button>
                      <input
                        type="number"
                        name="stock"
                        id="edit-stock"
                        required
                        min="0"
                        value={formData.stock}
                        onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                        className="block w-full rounded-md border-0 py-2 text-center text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-fox-600 sm:text-sm sm:leading-6 font-bold font-mono"
                      />
                      <button 
                         type="button" 
                         onClick={() => handleInputChange('stock', formData.stock + 1)}
                         className="px-2 py-1.5 bg-slate-100 rounded border border-slate-200 hover:bg-slate-200 text-xs font-medium"
                       >
                         +1
                       </button>
                       <button 
                         type="button" 
                         onClick={() => handleInputChange('stock', formData.stock + 10)}
                         className="px-2 py-1.5 bg-slate-100 rounded border border-slate-200 hover:bg-slate-200 text-xs font-medium"
                       >
                         +10
                       </button>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Adjust for incoming/outgoing stock.</p>
                  </div>

                  {/* Description */}
                  <div className="col-span-full">
                    <label htmlFor="edit-description" className="block text-sm font-medium leading-6 text-slate-900">
                      Description
                    </label>
                    <div className="mt-2">
                      <textarea
                        id="edit-description"
                        name="description"
                        rows={3}
                        required
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-fox-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                   {/* Image URL */}
                  <div className="col-span-full">
                    <label htmlFor="edit-imageUrl" className="block text-sm font-medium leading-6 text-slate-900">
                      Image URL
                    </label>
                    <div className="mt-2">
                      <input
                        type="url"
                        id="edit-imageUrl"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                        className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-fox-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-200">
                 <div className="text-xs text-slate-500">
                    * Changes are saved immediately to the mock database.
                 </div>
                 <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={loading}
                      className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex justify-center items-center rounded-md bg-fox-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-fox-500 disabled:opacity-70"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                 </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
