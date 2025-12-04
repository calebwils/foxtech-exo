import React, { useState } from 'react';
import { X, Loader2, BellRing, Mail } from 'lucide-react';
import { Product } from '../types';

interface NotifyMeModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSubmit: (productId: string, productName: string, email: string, requirements: string) => Promise<void>;
}

export const NotifyMeModal: React.FC<NotifyMeModalProps> = ({ isOpen, product, onClose, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(product.id, product.title, email, requirements);
      setSuccess(true);
      // Reset form after short delay
      setTimeout(() => {
        setSuccess(false);
        setEmail('');
        setRequirements('');
        onClose();
      }, 2500);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
            
            {/* Close Button */}
            <div className="absolute top-0 right-0 pt-4 pr-4 z-10">
              <button
                type="button"
                className="rounded-md bg-white text-slate-400 hover:text-slate-500 focus:outline-none"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {success ? (
              <div className="p-10 text-center">
                 <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                   <BellRing className="h-8 w-8 text-green-600" />
                 </div>
                 <h3 className="text-xl font-semibold text-slate-900">Request Received!</h3>
                 <p className="mt-2 text-slate-600">
                   We will email you at <strong>{email}</strong> automatically when "{product.title}" is back in stock.
                 </p>
              </div>
            ) : (
              <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-fox-100 sm:mx-0 sm:h-10 sm:w-10">
                    <BellRing className="h-6 w-6 text-fox-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-semibold leading-6 text-slate-900">
                      Notify me when available
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-slate-500">
                        The product <span className="font-medium text-slate-900">{product.title}</span> is currently out of stock. Fill in your details below and we'll contact you as soon as it arrives.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 text-left">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative mt-1 rounded-md shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            required
                            className="block w-full rounded-md border-slate-300 pl-10 focus:border-fox-500 focus:ring-fox-500 sm:text-sm py-2 border"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="requirements" className="block text-sm font-medium text-slate-700 text-left">
                          Special Requirements / Notes
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="requirements"
                            name="requirements"
                            rows={3}
                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-fox-500 focus:ring-fox-500 sm:text-sm py-2 border px-3"
                            placeholder="E.g. Need 50 units, specific color..."
                            value={requirements}
                            onChange={(e) => setRequirements(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex w-full justify-center rounded-md bg-fox-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-fox-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fox-600 sm:col-start-2 disabled:opacity-70"
                        >
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Notify Me'}
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:col-start-1 sm:mt-0"
                          onClick={onClose}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};