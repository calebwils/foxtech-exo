
import React from 'react';
import { Boxes, Plus, ShoppingCart, Shield, LogOut, User, LogIn, Globe, DollarSign, Bot, LayoutDashboard, Store, Users, Briefcase, Bike } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useI18n, Language, Currency } from '../contexts/I18nContext';

interface HeaderProps {
  isAdmin: boolean; // Means "Is in Dashboard Mode" (Admin/Seller/Courier)
  onNewProductClick?: () => void;
  currentView: 'dashboard' | 'inventory' | 'analytics' | 'crm' | 'orders' | 'agent' | 'sellers' | 'courier';
  onNavigate: (view: 'dashboard' | 'inventory' | 'analytics' | 'crm' | 'orders' | 'agent' | 'sellers' | 'courier') => void;
  onAdminLogin: () => void; // Used to Enter Dashboard
  onAdminLogout: () => void; // Used to Exit Dashboard
  onCustomerLogin: () => void;
  onLogoClick: () => void;
  onCustomerDashboardClick?: () => void; // New prop for customer dashboard
}

export const Header: React.FC<HeaderProps> = ({ 
  isAdmin,
  onNewProductClick, 
  currentView, 
  onNavigate,
  onAdminLogin,
  onAdminLogout,
  onCustomerLogin,
  onLogoClick,
  onCustomerDashboardClick
}) => {
  const { totalItems, toggleCart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, currency, setCurrency, t } = useI18n();

  const isSeller = user?.role === 'seller';
  const isSuperAdmin = user?.role === 'admin';
  const isCourier = user?.role === 'courier';
  // Check if authorized for the "Admin" dashboard
  const canAccessDashboard = isSeller || isSuperAdmin || isCourier;

  const getLinkClass = (view: string) => {
    const baseClass = "inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 cursor-pointer transition-colors";
    const activeClass = "border-fox-500 text-white";
    const inactiveClass = "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600";
    return `${baseClass} ${currentView === view ? activeClass : inactiveClass}`;
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Area */}
          <div className="flex items-center">
            <div 
              className="flex-shrink-0 flex items-center gap-2 cursor-pointer"
              onClick={onLogoClick}
            >
              <Boxes className="h-8 w-8 text-fox-500" />
              <span className="font-bold text-2xl tracking-tight lowercase">
                <span className="text-fox-500">izi</span>
                <span className="text-white">to</span>
                <span className="text-fox-500">buy</span>
                {isAdmin && (
                  <span className={`text-xs ml-2 font-normal uppercase tracking-wider border px-1.5 py-0.5 rounded flex items-center gap-1 ${
                      isSuperAdmin ? 'text-red-200 border-red-900 bg-red-900/30' : 
                      isCourier ? 'text-blue-200 border-blue-900 bg-blue-900/30' :
                      'text-slate-400 border-slate-700 bg-slate-800'
                  }`}>
                    {isSuperAdmin ? <Shield className="w-3 h-3" /> : isCourier ? <Bike className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                    {isSuperAdmin ? t('nav.role.owner') : isCourier ? t('nav.role.courier') : t('nav.role.seller')}
                  </span>
                )}
              </span>
            </div>

            {/* Dashboard Navigation (Admin/Seller/Courier only) */}
            {isAdmin && (
              <div className="hidden md:ml-8 md:flex md:space-x-8">
                
                {/* Courier Specific Nav */}
                {isCourier ? (
                    <a onClick={() => onNavigate('courier')} className={getLinkClass('courier')}>
                       <Bike className="w-4 h-4 mr-1.5" />
                       {t('admin.courier')}
                    </a>
                ) : (
                    // Seller / Admin Nav
                    <>
                        <a onClick={() => onNavigate('inventory')} className={getLinkClass('inventory')}>
                        {isSuperAdmin ? t('admin.inventory.global') : t('admin.inventory.my')}
                        </a>
                        
                        {isSuperAdmin && (
                        <a onClick={() => onNavigate('sellers')} className={getLinkClass('sellers')}>
                            <Briefcase className="w-4 h-4 mr-1.5" />
                            {t('admin.sellers')}
                        </a>
                        )}

                        <a onClick={() => onNavigate('agent')} className={getLinkClass('agent')}>
                        <Bot className="w-4 h-4 mr-1.5" />
                        {t('admin.ai_agent')}
                        </a>
                        <a onClick={() => onNavigate('orders')} className={getLinkClass('orders')}>{t('admin.orders')}</a>
                        <a onClick={() => onNavigate('crm')} className={getLinkClass('crm')}>{t('admin.crm')}</a>
                        <a onClick={() => onNavigate('analytics')} className={getLinkClass('analytics')}>{t('admin.analytics')}</a>
                    </>
                )}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Language & Currency Selectors (Desktop) - Hide for Couriers to reduce clutter */}
            {!isCourier && (
              <div className="hidden md:flex items-center gap-3 mr-2 border-r border-slate-700 pr-4">
                  <div className="flex items-center text-slate-400 text-xs">
                      <Globe className="w-3 h-3 mr-1" />
                      <select 
                          value={language} 
                          onChange={(e) => setLanguage(e.target.value as Language)}
                          className="bg-transparent border-none focus:ring-0 p-0 text-xs font-medium text-slate-300 cursor-pointer"
                      >
                          <option value="en">EN</option>
                          <option value="fr">FR</option>
                      </select>
                  </div>
                  <div className="flex items-center text-slate-400 text-xs">
                      <DollarSign className="w-3 h-3 mr-0.5" />
                      <select 
                          value={currency} 
                          onChange={(e) => setCurrency(e.target.value as Currency)}
                          className="bg-transparent border-none focus:ring-0 p-0 text-xs font-medium text-slate-300 cursor-pointer"
                      >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="XOF">FCFA</option>
                          <option value="NGN">NGN</option>
                          <option value="GHS">GHS</option>
                      </select>
                  </div>
              </div>
            )}

            {/* If Courier needs to change language, provide simple toggle if not shown above */}
            {isCourier && (
               <div className="hidden md:flex items-center gap-3 mr-2 border-r border-slate-700 pr-4">
                  <div className="flex items-center text-slate-400 text-xs">
                      <Globe className="w-3 h-3 mr-1" />
                      <select 
                          value={language} 
                          onChange={(e) => setLanguage(e.target.value as Language)}
                          className="bg-transparent border-none focus:ring-0 p-0 text-xs font-medium text-slate-300 cursor-pointer"
                      >
                          <option value="en">EN</option>
                          <option value="fr">FR</option>
                      </select>
                  </div>
              </div>
            )}

            {isAdmin ? (
              // Admin/Seller/Courier Controls
              <>
                {!isCourier && (
                    <div className="flex-shrink-0 hidden sm:block">
                    <button 
                        onClick={onNewProductClick}
                        className="relative inline-flex items-center gap-x-1.5 rounded-md bg-fox-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-fox-500 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        {t('nav.newProduct')}
                    </button>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    {user?.profileImage ? (
                        <img src={user.profileImage} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-slate-600" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">
                             <User className="w-4 h-4" />
                        </div>
                    )}
                    <button 
                    onClick={onAdminLogout}
                    className={`flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded transition-colors ${isCourier ? 'bg-red-900/30 text-red-200 hover:bg-red-900/50' : ''}`}
                    title={isCourier ? "Logout from System" : "Exit Dashboard"}
                    >
                    <LogOut className="w-4 h-4" />
                    {isCourier ? t('nav.logout') : t('nav.exit')}
                    </button>
                </div>
              </>
            ) : (
              // Customer / Public Controls
              <>
                {/* User Account Section */}
                {isAuthenticated ? (
                  <div className="hidden sm:flex items-center gap-3 mr-2 border-r border-slate-700 pr-4">
                    {/* User Avatar */}
                    {user?.profileImage ? (
                        <img src={user.profileImage} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-slate-600" />
                    ) : (
                         <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">
                             <User className="w-4 h-4" />
                         </div>
                    )}
                    
                    <div className="text-right">
                      <span className="block text-sm text-slate-300 leading-tight">{user?.name}</span>
                      <span className="block text-[10px] text-slate-500 uppercase tracking-wide">{user?.role}</span>
                    </div>
                    
                    {/* Only show Customer Dashboard Link if NOT a seller/admin (they use the button on right) */}
                    {!canAccessDashboard && (
                        <button 
                         onClick={onCustomerDashboardClick}
                         className="text-xs text-slate-300 hover:text-white underline font-medium flex items-center gap-1"
                        >
                          {t('nav.customer_dash')}
                        </button>
                    )}
                  </div>
                ) : (
                   <button 
                    onClick={onCustomerLogin}
                    className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors mr-2"
                  >
                    <User className="w-4 h-4" />
                    {t('nav.signin')}
                  </button>
                )}

                <button 
                  onClick={toggleCart}
                  className="relative p-2 text-slate-400 hover:text-fox-500 transition-colors group"
                  title={t('nav.cart')}
                >
                  <ShoppingCart className="h-6 w-6 group-hover:text-fox-500" />
                  {totalItems > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-fox-600 rounded-full border-2 border-slate-900">
                      {totalItems}
                    </span>
                  )}
                </button>

                {/* Mobile Login Icon (if not authenticated) */}
                {!isAuthenticated && (
                   <button 
                    onClick={onCustomerLogin}
                    className="sm:hidden p-2 text-slate-400 hover:text-white"
                   >
                     <LogIn className="h-5 w-5" />
                   </button>
                )}

                <div className="h-6 w-px bg-slate-800 mx-1"></div>

                {/* Dashboard Link if authorized */}
                {canAccessDashboard ? (
                   <button 
                    onClick={onAdminLogin}
                    className={`flex items-center gap-1 text-xs font-bold text-white px-3 py-1.5 rounded-full transition-colors shadow-lg ${
                        isSuperAdmin ? 'bg-red-700 hover:bg-red-600 shadow-red-900/20' : 
                        isCourier ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20' :
                        'bg-fox-600 hover:bg-fox-500 shadow-fox-900/20'
                    }`}
                    title="Go to Dashboard"
                  >
                    <LayoutDashboard className="w-3 h-3" />
                    {isSuperAdmin ? t('nav.role.owner') : isCourier ? t('nav.jobs') : t('nav.dashboard')}
                  </button>
                ) : (
                  // Link to become a seller
                  <button 
                    onClick={onCustomerLogin} 
                    className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-300 px-2 py-1 rounded transition-colors"
                    title="Sell on Izitobuy"
                  >
                    <Store className="w-3 h-3" />
                    {t('nav.sell')}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
