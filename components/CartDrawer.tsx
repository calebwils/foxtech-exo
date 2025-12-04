
import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Loader2, CheckCircle, Lock, Banknote, CreditCard, ShieldCheck, PlayCircle } from 'lucide-react';

// Declare FedaPay global to avoid Typescript errors
declare global {
  interface Window {
    FedaPay: any;
  }
}

interface CartDrawerProps {
  onCheckout: (customerName: string, email: string, items: any[], total: number, requirements?: string, paymentMethod?: string, paymentPhoneNumber?: string) => Promise<void>;
  onLoginRequired: () => void;
}

type PaymentMethod = 'cash' | 'fedapay';

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout, onLoginRequired }) => {
  const { items, isOpen, toggleCart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { t, formatPrice, currency } = useI18n();
  const [step, setStep] = useState<'cart' | 'details' | 'success'>('cart');
  const [loading, setLoading] = useState(false);
  
  // Checkout Form State
  const [formData, setFormData] = useState({
    notes: '',
    paymentMethod: 'cash' as PaymentMethod
  });

  if (!isOpen) return null;

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      toggleCart(); 
      onLoginRequired();
    } else {
      setStep('details');
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent, simulate: boolean = false) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    
    try {
      // FedaPay Logic - Only run if NOT simulating
      if (formData.paymentMethod === 'fedapay' && !simulate) {
          if (typeof window.FedaPay === 'undefined') {
            alert('Payment gateway is initializing. Please wait a moment.');
            setLoading(false);
            return;
          }

          const widget = window.FedaPay.init({
            public_key: 'pk_live_hGQzsjEF7Q7bBszXc2qo4OAM', // Live Public Key
            transaction: {
              amount: Math.round(currency === 'XOF' ? totalPrice : totalPrice * 610), // Conversion approx
              description: `Order for ${user.email}`,
              currency: { iso: 'XOF' }
            },
            customer: {
              email: user.email,
              lastname: user.name,
            },
            onComplete: async (data: any) => {
                // Payment Successful
                await onCheckout(
                    user.name, 
                    user.email, 
                    items, 
                    totalPrice, 
                    formData.notes,
                    'fedapay',
                    'FedaPay Widget'
                );
                setStep('success');
                clearCart();
                setLoading(false);
            },
            onClose: () => {
                // User closed the widget without paying
                setLoading(false);
            }
          });

          widget.open();
          return; // Stop execution here, wait for widget callback
      }

      // Cash or Simulation Logic
      // If simulate is true, we explicitly state it in the payment method string
      const methodLabel = simulate ? 'FedaPay (Simulated)' : 'cash';
      
      // Artificial delay for simulation to feel real
      if (simulate) {
          await new Promise(resolve => setTimeout(resolve, 1500));
      }

      await onCheckout(
          user.name, 
          user.email, 
          items, 
          totalPrice, 
          formData.notes,
          methodLabel,
          ''
      );
      setStep('success');
      clearCart();
      setLoading(false);

    } catch (error) {
      console.error(error);
      alert("Failed to place order");
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    toggleCart();
    setTimeout(() => {
      setStep('cart');
      setFormData({ notes: '', paymentMethod: 'cash' });
    }, 500);
  };

  return (
    <div className="relative z-40">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={toggleCart}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 z-40 flex max-w-full pl-10">
        <div className="w-screen max-w-md transform transition-transform duration-500 sm:duration-700 bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="px-4 py-6 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-white">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-fox-600" />
              {step === 'cart' ? t('cart.title') : step === 'details' ? t('cart.checkout') : t('cart.success')}
            </h2>
            <button
              type="button"
              className="rounded-md text-slate-400 hover:text-slate-500 focus:outline-none"
              onClick={toggleCart}
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-6 sm:px-6">
            {step === 'success' ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{t('cart.success')}</h3>
                <p className="text-slate-600 max-w-xs">
                  {t('cart.successMsg')} <strong>{user?.email}</strong>.
                </p>
                <button
                  onClick={resetAndClose}
                  className="mt-6 w-full rounded-md bg-fox-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-fox-500"
                >
                  {t('cart.continue')}
                </button>
              </div>
            ) : items.length === 0 && step === 'cart' ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center">
                   <ShoppingBag className="h-10 w-10 text-slate-300" />
                </div>
                <p className="text-lg font-medium text-slate-900">{t('cart.empty')}</p>
                <p className="text-slate-500">{t('cart.emptySub')}</p>
                <button
                  onClick={toggleCart}
                  className="text-fox-600 font-semibold hover:text-fox-500"
                >
                  {t('cart.startShopping')} &rarr;
                </button>
              </div>
            ) : step === 'cart' ? (
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-slate-200">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-slate-900">
                          <h3 className="line-clamp-1 mr-2"><a href="#">{item.title}</a></h3>
                          <p className="ml-4">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{item.category}</p>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <div className="flex items-center border border-slate-300 rounded-md">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 hover:bg-slate-100 text-slate-600"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 font-medium text-slate-900">{item.quantity}</span>
                          <button 
                             onClick={() => updateQuantity(item.id, 1)}
                             className="p-1 hover:bg-slate-100 text-slate-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="font-medium text-red-500 hover:text-red-600 flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="sr-only">Remove</span>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              /* Checkout Form (Authenticated) */
              <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-6">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    Logged in as <strong>{user?.name}</strong> ({user?.email})
                  </p>
                </div>
                
                {/* Payment Methods */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">{t('pay.method')}</label>
                    <div className="space-y-3">
                        {/* Cash */}
                        <div 
                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${formData.paymentMethod === 'cash' ? 'border-fox-600 bg-fox-50 ring-1 ring-fox-600' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                            onClick={() => setFormData({...formData, paymentMethod: 'cash'})}
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                                <Banknote className="w-5 h-5 text-slate-600" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-slate-900">{t('pay.cash')}</h4>
                            </div>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.paymentMethod === 'cash' ? 'border-fox-600' : 'border-slate-300'}`}>
                                {formData.paymentMethod === 'cash' && <div className="w-3 h-3 rounded-full bg-fox-600" />}
                            </div>
                        </div>

                        {/* FedaPay (MTN, Moov, Visa) */}
                        <div 
                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${formData.paymentMethod === 'fedapay' ? 'border-green-600 bg-green-50 ring-1 ring-green-600' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                            onClick={() => setFormData({...formData, paymentMethod: 'fedapay'})}
                        >
                            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center mr-3 shadow-sm">
                                <CreditCard className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-slate-900">{t('pay.fedapay')}</h4>
                                <p className="text-xs text-slate-500">Mobile Money (MTN/Moov) & Cards</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.paymentMethod === 'fedapay' ? 'border-green-600' : 'border-slate-300'}`}>
                                {formData.paymentMethod === 'fedapay' && <div className="w-3 h-3 rounded-full bg-green-600" />}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Info Message */}
                {formData.paymentMethod === 'fedapay' && (
                    <div className="bg-slate-100 p-3 rounded text-sm text-slate-600 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-green-600 mt-0.5" />
                        <p>{t('pay.secure_notice')}</p>
                    </div>
                )}

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-slate-700">{t('cart.instructions')}</label>
                  <textarea
                    id="notes"
                    rows={2}
                    className="mt-1 block w-full rounded-md border-slate-300 border px-3 py-2 shadow-sm focus:border-fox-500 focus:ring-fox-500 sm:text-sm"
                    placeholder="Gate code, packaging requests, etc."
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
                
                <div className="bg-slate-100 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm text-slate-600">
                        <span>{t('cart.subtotal')}</span>
                        <span>{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600">
                        <span>{t('cart.shipping')}</span>
                        <span>{t('filter.opt.freeShip')}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                        <span>{t('cart.total')}</span>
                        <span>{formatPrice(totalPrice)}</span>
                    </div>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          {step !== 'success' && items.length > 0 && (
            <div className="border-t border-slate-100 bg-white px-4 py-6 sm:px-6">
              {step === 'cart' ? (
                <>
                  <div className="flex justify-between text-base font-medium text-slate-900 mb-4">
                    <p>{t('cart.subtotal')}</p>
                    <p>{formatPrice(totalPrice)}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500 mb-6">
                    Shipping and taxes calculated at checkout.
                  </p>
                  {isAuthenticated ? (
                    <button
                      onClick={handleProceedToCheckout}
                      className="flex w-full items-center justify-center rounded-md border border-transparent bg-fox-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-fox-700"
                    >
                      {t('cart.checkout')} <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  ) : (
                    <button
                      onClick={handleProceedToCheckout}
                      className="flex w-full items-center justify-center rounded-md border border-transparent bg-slate-900 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-slate-800"
                    >
                      <Lock className="w-4 h-4 mr-2" /> {t('cart.loginToCheckout')}
                    </button>
                  )}
                </>
              ) : (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('cart')}
                    className="flex-1 rounded-md border border-slate-300 bg-white px-4 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Back
                  </button>
                  
                  {formData.paymentMethod === 'fedapay' && (
                     <button
                        type="button"
                        onClick={(e) => handleCheckoutSubmit(e, true)}
                        disabled={loading}
                        className="flex-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-md font-bold text-sm hover:bg-blue-200 flex items-center justify-center gap-1 disabled:opacity-50"
                     >
                         {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><PlayCircle className="w-4 h-4" /> Simulate</>}
                     </button>
                  )}

                  <button
                    form="checkout-form"
                    type="submit"
                    disabled={loading}
                    className={`flex-[2] flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm disabled:opacity-70 transition-colors ${
                         formData.paymentMethod === 'fedapay' ? 'bg-green-600 hover:bg-green-700' :
                         'bg-fox-600 hover:bg-fox-700'
                    }`}
                  >
                    {loading && !formData.paymentMethod.includes('fedapay') ? (
                         <div className="flex items-center">
                             <Loader2 className="w-5 h-5 animate-spin mr-2" />
                             {t('pay.processing')}
                         </div>
                    ) : (
                        <>
                           {t('pay.payNow')}
                        </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
