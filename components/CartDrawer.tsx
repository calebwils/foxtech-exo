import React from 'react';
import { useCart } from '../contexts/CartContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { 
    isOpen, 
    toggleCart, 
    items, 
    removeFromCart, 
    updateQuantity, 
    totalPrice, 
    clearCart 
  } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) return;
    alert(`Merci pour votre achat !\nTotal payé : $${totalPrice.toFixed(2)}`);
    clearCart();
    toggleCart();
  };

  if (!isOpen) return null;

  return (
    <div className="relative z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={toggleCart}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex max-w-full pl-10">
        <div className="w-screen max-w-md transform transition-transform duration-500 sm:duration-700 bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="px-4 py-6 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-fox-600" />
              Mon Panier
            </h2>
            <button
              type="button"
              className="rounded-md text-slate-400 hover:text-slate-500 focus:outline-none"
              onClick={toggleCart}
            >
              <span className="sr-only">Fermer</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="bg-slate-100 p-6 rounded-full mb-4">
                  <ShoppingBag className="h-10 w-10 text-slate-400" />
                </div>
                <p className="text-lg font-medium text-slate-900">Votre panier est vide</p>
                <p className="mt-2 text-slate-500 text-sm max-w-xs">
                  Commencez à ajouter des produits Foxtech incroyables pour voir votre panier se remplir.
                </p>
                <button 
                  onClick={toggleCart}
                  className="mt-6 text-fox-600 font-semibold hover:text-fox-700"
                >
                  Continuer mes achats
                </button>
              </div>
            ) : (
              <ul className="-my-6 divide-y divide-slate-200">
                {items.map((item) => (
                  <li key={item.id} className="flex py-6">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-slate-200">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-slate-900">
                          <h3 className="line-clamp-1 mr-2">{item.title}</h3>
                          <p className="ml-4 whitespace-nowrap">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{item.category}</p>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <div className="flex items-center border border-slate-300 rounded-md">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 px-2 hover:bg-slate-100 text-slate-600 border-r border-slate-200"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-3 font-medium text-slate-900">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 px-2 hover:bg-slate-100 text-slate-600 border-l border-slate-200"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="font-medium text-red-600 hover:text-red-500 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="text-xs">Supprimer</span>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer / Checkout */}
          {items.length > 0 && (
            <div className="border-t border-slate-200 px-4 py-6 sm:px-6 bg-slate-50">
              <div className="flex justify-between text-base font-medium text-slate-900 mb-4">
                <p>Sous-total</p>
                <p>${totalPrice.toFixed(2)}</p>
              </div>
              <p className="mt-0.5 text-sm text-slate-500 mb-6">
                Taxes et frais de port calculés à l'étape suivante.
              </p>
              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center rounded-md border border-transparent bg-fox-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-fox-700 transition-colors"
              >
                Passer à la caisse
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <div className="mt-6 flex justify-center text-center text-sm text-slate-500">
                <p>
                  ou{' '}
                  <button
                    type="button"
                    className="font-medium text-fox-600 hover:text-fox-500"
                    onClick={toggleCart}
                  >
                    Continuer mes achats
                    <span aria-hidden="true"> &rarr;</span>
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};