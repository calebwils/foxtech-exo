

import React, { useState, useEffect } from 'react';
import { useProducts } from './hooks/useProducts';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Storefront } from './components/Storefront';
import { AddProductModal } from './components/AddProductModal';
import { NotifyMeModal } from './components/NotifyMeModal';
import { InventoryView } from './components/InventoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { CRMView } from './components/CRMView';
import { OrdersView } from './components/OrdersView';
import { AIImporterView } from './components/AIImporterView';
import { SellersView } from './components/SellersView';
import { CourierDashboard } from './components/CourierDashboard';
import { CustomerDashboard } from './components/CustomerDashboard';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { Product } from './types';
import { useAuth } from './contexts/AuthContext';
import { AlertTriangle, ChevronRight, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const { user, completeProfile, logout } = useAuth();

  // Application Mode: 'store' (Public) or 'admin' (Private)
  const [appMode, setAppMode] = useState<'store' | 'admin'>('store');
  
  // Store View Mode: 'shop' (Browsing) or 'account' (Customer Dashboard)
  const [storeView, setStoreView] = useState<'shop' | 'account'>('shop');

  // Admin Navigation View
  const [adminView, setAdminView] = useState<'dashboard' | 'inventory' | 'analytics' | 'crm' | 'orders' | 'agent' | 'sellers' | 'courier'>('inventory');
  
  // Loading state for verifying profile
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    products,
    hiddenMatches,
    loading,
    error,
    total,
    totalPages,
    filters,
    notifications,
    notificationsLoading,
    orders,
    ordersLoading,
    setQuery,
    setStoreQuery,
    setCategory,
    setSort,
    setPage,
    setShowHidden,
    setSellerFilter,
    toggleFilter,
    resetFilters,
    refresh,
    addProduct,
    updateProduct,
    submitNotification,
    loadNotifications,
    markNotificationAsSent,
    loadOrders,
    handleDispatchOrder,
    checkout
  } = useProducts();

  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); // Customer Login/Register
  const [selectedHiddenProduct, setSelectedHiddenProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Automatically handle mode switching based on authentication
  useEffect(() => {
    const isSeller = user?.role === 'seller';
    const isSuperAdmin = user?.role === 'admin';
    const isCourier = user?.role === 'courier';

    if (user && (isSeller || isSuperAdmin || isCourier)) {
        
        // COURIER SPECIFIC LOCK
        // Couriers must ALWAYS be in admin mode, never store mode.
        if (isCourier) {
            setAppMode('admin');
            setAdminView('courier');
            // Ensure they don't see filters from previous sessions
            setSellerFilter(undefined); 
            return;
        }

        // For Sellers/Admins, set appropriate filters if they are in Dashboard mode
        if (appMode === 'admin') {
             if (isSeller) {
                 setSellerFilter(user.id);
             } else {
                 setSellerFilter(undefined);
             }
             setShowHidden(true);
        }
    } else {
        // If logged out or just a customer, force store mode
        if (appMode === 'admin') {
            setAppMode('store');
            setSellerFilter(undefined);
            setShowHidden(false);
        }
        
        // If logged out, reset store view to shop
        if (!user) {
            setStoreView('shop');
        }
    }
  }, [user, appMode, setSellerFilter, setShowHidden]);

  // Handle switching between Admin views
  const handleAdminNavigate = (view: 'dashboard' | 'inventory' | 'analytics' | 'crm' | 'orders' | 'agent' | 'sellers' | 'courier') => {
    setAdminView(view);
    
    // Logic for what products to show in inventory based on view
    if (view === 'inventory') {
      setShowHidden(true);
    } 

    if (view === 'orders') {
      loadOrders();
    } else if (view === 'crm') {
      loadNotifications();
    }
  };

  const handleEnterDashboard = () => {
    const isSeller = user?.role === 'seller';
    const isSuperAdmin = user?.role === 'admin';
    const isCourier = user?.role === 'courier';

    if (user && (isSeller || isSuperAdmin || isCourier)) {
        setAppMode('admin');
        
        if (isCourier) {
            setAdminView('courier');
        } else {
            setAdminView('inventory');
        }
        
        if (isSeller) {
            setSellerFilter(user.id);
        } else {
            setSellerFilter(undefined);
        }
        setShowHidden(true);
    } else {
        setIsAuthModalOpen(true);
    }
  };

  const handleExitDashboard = () => {
      // If Courier, "Exit" actually means Logout because they have no store view
      if (user?.role === 'courier') {
          logout();
          setAppMode('store'); // Reset to store mode for the next anonymous user
          return;
      }

      // For Sellers/Admins, go back to Storefront
      setAppMode('store');
      setStoreView('shop');
      setSellerFilter(undefined); // Clear seller filter for global store
      setShowHidden(false);
      setQuery('');
      setStoreQuery('');
  };

  const handleNotifyClick = (product: Product) => {
    setSelectedHiddenProduct(product);
    setIsNotifyModalOpen(true);
  };

  const handleLogoClick = () => {
    if (appMode === 'store') {
      // Reset Storefront State
      setSelectedProduct(null);
      setStoreView('shop');
      resetFilters();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Reset Admin State
      if (user?.role === 'courier') {
          // Couriers stay on courier view
          setAdminView('courier');
      } else {
          setAdminView('inventory');
      }
      setQuery('');
    }
  };
  
  const handleCustomerDashboardClick = () => {
      setStoreView('account');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVerifyProfile = async () => {
    setIsVerifying(true);
    await completeProfile();
    setIsVerifying(false);
  };

  const handleViewMyStore = () => {
    if (user?.role === 'seller') {
      setAppMode('store');
      setStoreView('shop');
      // Set ID for precise filtering
      setSellerFilter(user.id);
      // Set name for visual feedback in the UI search bar
      setStoreQuery(user.storeName || user.name);
      
      setQuery('');
      setShowHidden(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Navigation Header */}
      <Header 
        isAdmin={appMode === 'admin'}
        onNewProductClick={() => setIsAddProductModalOpen(true)} 
        currentView={adminView}
        onNavigate={handleAdminNavigate}
        onAdminLogin={handleEnterDashboard}
        onAdminLogout={handleExitDashboard}
        onCustomerLogin={() => setIsAuthModalOpen(true)}
        onLogoClick={handleLogoClick}
        onCustomerDashboardClick={handleCustomerDashboardClick}
      />

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <AddProductModal 
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onSave={addProduct}
      />

      <NotifyMeModal 
        isOpen={isNotifyModalOpen}
        product={selectedHiddenProduct}
        onClose={() => setIsNotifyModalOpen(false)}
        onSubmit={submitNotification}
      />

      {/* Shopping Cart (Only for Store Mode) */}
      {appMode === 'store' && (
        <CartDrawer 
          onCheckout={checkout} 
          onLoginRequired={() => setIsAuthModalOpen(true)}
        />
      )}

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        
        {/* PROFILE VERIFICATION WARNING */}
        {user && appMode === 'admin' && !user.isProfileComplete && (
            <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start sm:items-center gap-3">
                   <div className="p-2 bg-amber-100 rounded-full text-amber-700 flex-shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                   </div>
                   <div>
                      <h3 className="font-bold text-amber-900 text-sm sm:text-base">Your {user.role === 'seller' ? 'Store' : 'Courier'} Profile is Incomplete</h3>
                      <p className="text-xs sm:text-sm text-amber-700 mt-1">
                         You must verify your identity and complete your business details to {user.role === 'seller' ? 'start listing products publicly' : 'accept delivery jobs'}.
                      </p>
                   </div>
                </div>
                <button 
                   onClick={handleVerifyProfile}
                   disabled={isVerifying}
                   className="w-full sm:w-auto px-5 py-2.5 bg-amber-600 text-white text-sm font-bold rounded-lg hover:bg-amber-500 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                   {isVerifying ? (
                       <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                       </>
                   ) : (
                       <>
                          Complete Profile <ChevronRight className="w-4 h-4" />
                       </>
                   )}
                </button>
            </div>
        )}

        {/* STOREFRONT MODE (Never shown to Couriers) */}
        {appMode === 'store' && (
           <>
              {storeView === 'shop' ? (
                <Storefront
                    products={products}
                    hiddenMatches={hiddenMatches}
                    loading={loading}
                    error={error}
                    filters={filters}
                    total={total}
                    totalPages={totalPages}
                    setQuery={setQuery}
                    setStoreQuery={setStoreQuery}
                    setCategory={setCategory}
                    setSort={setSort}
                    setPage={setPage}
                    toggleFilter={toggleFilter}
                    refresh={refresh}
                    onNotifyClick={handleNotifyClick}
                    selectedProduct={selectedProduct}
                    onProductSelect={setSelectedProduct}
                    onClearSelection={() => setSelectedProduct(null)}
                />
              ) : (
                <CustomerDashboard />
              )}
           </>
        )}

        {/* ADMIN/SELLER/COURIER DASHBOARD MODE */}
        {appMode === 'admin' && (
          <>
            {/* Courier Dashboard */}
            {adminView === 'courier' && <CourierDashboard />}

            {adminView === 'inventory' && (
              <InventoryView
                products={products}
                loading={loading}
                error={error}
                filters={filters}
                setQuery={setQuery}
                setPage={setPage}
                totalPages={totalPages}
                total={total}
                refresh={refresh}
                onUpdateProduct={updateProduct}
                onViewStore={handleViewMyStore}
              />
            )}
            
            {/* Replace generic UsersView with advanced SellersView for Seller Management */}
            {adminView === 'sellers' && <SellersView />}

            {adminView === 'analytics' && <AnalyticsView />}
            
            {adminView === 'crm' && (
              <CRMView 
                notifications={notifications}
                loading={notificationsLoading}
                loadNotifications={loadNotifications}
                onMarkAsSent={markNotificationAsSent}
              />
            )}
            
            {adminView === 'orders' && (
              <OrdersView 
                orders={orders}
                loading={ordersLoading}
                onDispatch={handleDispatchOrder}
              />
            )}

            {adminView === 'agent' && (
              <AIImporterView 
                onAddProduct={addProduct}
              />
            )}
          </>
        )}
      </main>

      {/* Application Footer */}
      <Footer />
    </div>
  );
};

export default App;