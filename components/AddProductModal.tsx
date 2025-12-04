
import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Product } from '../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id' | 'rating' | 'stock' | 'hidden' | 'sellerId' | 'sellerName'>) => Promise<void>;
}

const INITIAL_FORM_STATE = {
  title: '',
  description: '',
  price: '',
  category: CATEGORIES.filter(c => c !== 'All')[0] || 'Electronics',
  imageUrl: '',
};

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSave({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        imageUrl: formData.imageUrl || 'https://picsum.photos/400/300',
        // Provide default values for advanced fields not present in simple add form
        brand: 'IzitoTech',
        color: 'black',
        condition: 'new',
        deliveryType: 'standard',
        isProSeller: true,
        isPromo: false,
        isMemberOffer: false
      });
      // Reset and close on success
      setFormData(INITIAL_FORM_STATE);
      onClose();
    } catch (err) {
      setError('Failed to create product. Please try again.');
    } finally {
      setLoading(false);
    }
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
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            
            {/* Header */}
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold leading-6 text-slate-900">Add New Product</h3>
                <button 
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-500 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="px-4 py-5 sm:p-6 space-y-4">
                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                    {error}
                  </div>
                )}

                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium leading-6 text-slate-900">
                    Product Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="title"
                      id="title"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-fox-600 sm:text-sm sm:leading-6"
                      placeholder="e.g. Izito Pro Drone"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium leading-6 text-slate-900">
                    Category
                  </label>
                  <div className="mt-1">
                    <select
                      id="category"
                      name="category"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-fox-600 sm:text-sm sm:leading-6"
                    >
                      {CATEGORIES.filter(c => c !== 'All').map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium leading-6 text-slate-900">
                    Price ($)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-slate-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="price"
                      id="price"
                      required
                      min="0.01"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="block w-full rounded-md border-0 py-1.5 pl-7 pr-12 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-fox-600 sm:text-sm sm:leading-6"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium leading-6 text-slate-900">
                    Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-fox-600 sm:text-sm sm:leading-6"
                      placeholder="Brief description of the product features..."
                    />
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium leading-6 text-slate-900">
                    Image URL <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="url"
                      name="imageUrl"
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-fox-600 sm:text-sm sm:leading-6"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Leave empty for a random placeholder.</p>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full justify-center rounded-md bg-fox-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-fox-500 sm:ml-3 sm:w-auto disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:mt-0 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
