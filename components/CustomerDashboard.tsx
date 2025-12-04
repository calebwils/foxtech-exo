
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../contexts/CartContext';
import { Order, Product } from '../types';
import { approveCourierJob } from '../services/productService'; 
import { MOCK_PRODUCTS } from '../constants'; // For wishlist mock
import { 
  Package, Truck, MapPin, User, Settings, 
  CreditCard, Clock, CheckCircle, ArrowRight,
  Download, RefreshCcw, LogOut, Camera, Key, ShieldCheck, Bike,
  Heart, Wallet, ChevronRight, Phone, Box, Trash2, Plus, Home, Briefcase, Star, Loader2
} from 'lucide-react';
import { TrackingMap } from './TrackingMap';

// Types for additional dashboard sections
interface WishlistItem extends Product {
  dateAdded: number;
}

interface SavedCard {
  id: string;
  last4: string;
  brand: 'visa' | 'mastercard' | 'mtn' | 'moov';
  expiry: string;
  isDefault: boolean;
}

interface SavedAddress {
    id: string;
    type: 'Home' | 'Work' | 'Other';
    label: string;
    address: string;
    isDefault: boolean;
}

export const CustomerDashboard: React.FC = () => {
  const { user, logout, updateProfileImage, updateProfile } = useAuth();
  const { t, formatPrice } = useI18n();
  const { orders, loadOrders } = useProducts();
  const { addToCart } = useCart();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'wishlist' | 'wallet' | 'addresses' | 'settings'>('overview');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Mock Wishlist
  const [wishlist, setWishlist] = useState<WishlistItem[]>(
    MOCK_PRODUCTS.slice(10, 14).map(p => ({ ...p, dateAdded: Date.now() }))
  );
  
  // Mock Wallet
  const [savedCards, setSavedCards] = useState<SavedCard[]>([
    { id: '1', last4: '4242', brand: 'visa', expiry: '12/26', isDefault: true },
    { id: '2', last4: '8892', brand: 'mtn', expiry: 'N/A', isDefault: false }
  ]);

  // Mock Addresses
  const [addresses, setAddresses] = useState<SavedAddress[]>([
      { id: 'addr-1', type: 'Home', label: 'My Apartment', address: '12 Avenue de la Tech, 75000 Paris', isDefault: true },
      { id: 'addr-2', type: 'Work', label: 'Office', address: '45 Business Park, 92000 Nanterre', isDefault: false }
  ]);

  // Profile Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    loadOrders();
    // Poll for updates (e.g., if courier is assigned or location changes)
    const interval = setInterval(loadOrders, 5000); 
    return () => clearInterval(interval);
  }, [loadOrders]);

  // Sync local profile state with auth user
  useEffect(() => {
    if (user?.name) {
        const parts = user.name.split(' ');
        setFirstName(parts[0] || '');
        setLastName(parts.slice(1).join(' ') || '');
    }
  }, [user]);

  const handleApproveCourier = async (orderId: string) => {
      setApprovingId(orderId);
      await approveCourierJob(orderId);
      // Immediately reload to reflect the approval status in UI
      await loadOrders();
      setApprovingId(null);
  };

  const myOrders = orders.filter(o => o.email === user?.email);
  const activeOrders = myOrders.filter(o => ['pending_processing', 'ready_for_pickup', 'courier_assigned', 'picked_up'].includes(o.status));
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const url = URL.createObjectURL(file);
        updateProfileImage(url);
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    const fullName = `${firstName} ${lastName}`.trim();
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    await updateProfile({ name: fullName });
    setIsSavingProfile(false);
  };

  const removeFromWishlist = (id: string) => {
      setWishlist(prev => prev.filter(p => p.id !== id));
  };

  const moveToCart = (product: Product) => {
      addToCart(product);
      removeFromWishlist(product.id);
  };

  const removeCard = (id: string) => {
      setSavedCards(prev => prev.filter(c => c.id !== id));
  };

  const removeAddress = (id: string) => {
      setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'pending_processing': 
            return <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-800 border border-yellow-200"><Clock className="w-3 h-3" /> {t('status.processing')}</span>;
        case 'ready_for_pickup':
            return <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-200"><Package className="w-3 h-3" /> {t('status.pending')}</span>;
        case 'courier_assigned':
        case 'picked_up':
            return <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700 border border-orange-200"><Truck className="w-3 h-3" /> {t('orders.status.transit')}</span>;
        case 'delivered':
            return <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 border border-green-200"><CheckCircle className="w-3 h-3" /> {t('orders.status.delivered')}</span>;
        default:
            return <span>{status}</span>;
    }
  };

  const viewOrderDetails = (order: Order) => {
      setSelectedOrder(order);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- DETAILED ORDER VIEW COMPONENT ---
  if (selectedOrder) {
      const isLive = ['courier_assigned', 'picked_up'].includes(selectedOrder.status);
      
      return (
        <div className="max-w-4xl mx-auto py-8 px-4 animate-in slide-in-from-right-4 duration-300">
            <button onClick={() => setSelectedOrder(null)} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors">
                <ChevronRight className="w-4 h-4 rotate-180 mr-1" /> Back to Dashboard
            </button>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                   <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                       Order #{selectedOrder.id}
                       {getStatusBadge(selectedOrder.status)}
                   </h1>
                   <p className="text-sm text-slate-500 mt-1">
                       {t('cust.date')}: {new Date(selectedOrder.date).toLocaleString()}
                   </p>
                </div>
                <div className="flex gap-3">
                   <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
                       <Download className="w-4 h-4" /> Invoice
                   </button>
                   <button className="flex items-center gap-2 px-4 py-2 bg-fox-600 text-white rounded-lg text-sm font-medium hover:bg-fox-500">
                       <RefreshCcw className="w-4 h-4" /> Buy Again
                   </button>
                </div>
            </div>

            {/* TIMELINE */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
               <h3 className="font-bold text-slate-900 mb-6">Order Status</h3>
               <div className="relative">
                   <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-100 -translate-y-1/2 hidden md:block"></div>
                   <div className="absolute left-4 top-0 h-full w-1 bg-slate-100 -translate-x-1/2 md:hidden"></div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
                       {[
                           { label: t('cust.timeline.placed'), icon: Package, done: true },
                           { label: t('cust.timeline.confirmed'), icon: CheckCircle, done: true },
                           { label: t('cust.timeline.packed'), icon: Box, done: ['ready_for_pickup', 'courier_assigned', 'picked_up', 'delivered'].includes(selectedOrder.status) },
                           { label: t('cust.timeline.pickup'), icon: Truck, done: ['picked_up', 'delivered'].includes(selectedOrder.status) },
                           { label: t('cust.timeline.delivered'), icon: MapPin, done: selectedOrder.status === 'delivered' }
                       ].map((step, idx) => (
                           <div key={idx} className="flex md:flex-col items-center gap-4 md:gap-2 relative z-10">
                               <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step.done ? 'bg-green-50 border-green-500 text-green-600' : 'bg-white border-slate-200 text-slate-300'}`}>
                                   <step.icon className="w-4 h-4" />
                               </div>
                               <div className="md:text-center">
                                   <p className={`text-sm font-bold ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</p>
                                   {step.done && <p className="text-xs text-slate-500 hidden md:block">Completed</p>}
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
            </div>

            {/* LIVE TRACKING & APPROVAL */}
            {isLive && (
                <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg mb-6 text-white relative">
                    <div className="p-6 grid md:grid-cols-2 gap-6">
                        <div>
                             <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                {t('cust.recent_order')}
                             </h3>
                             
                             {selectedOrder.courierName ? (
                                 <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 mb-4">
                                     <div className="flex items-center gap-4">
                                         <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                                            <User className="w-6 h-6 text-slate-400" />
                                         </div>
                                         <div>
                                             <p className="font-bold text-white">{selectedOrder.courierName}</p>
                                             <div className="flex items-center gap-2 text-xs text-slate-400">
                                                 <span className="capitalize bg-slate-700 px-2 py-0.5 rounded flex items-center gap-1">
                                                     <Bike className="w-3 h-3" /> {selectedOrder.courierVehicle}
                                                 </span>
                                                 <span className="flex items-center gap-1">
                                                     <ShieldCheck className="w-3 h-3 text-green-400" /> Verified
                                                 </span>
                                             </div>
                                         </div>
                                         <button className="ml-auto bg-green-600 p-2 rounded-full hover:bg-green-500">
                                             <Phone className="w-4 h-4" />
                                         </button>
                                     </div>
                                 </div>
                             ) : (
                                 <p className="text-slate-400 italic mb-4">Assigning courier...</p>
                             )}

                             {/* SECRET PIN DISPLAY */}
                             <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
                                 <p className="text-yellow-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                     <Key className="w-3 h-3" /> Secret Delivery PIN
                                 </p>
                                 <p className="text-xs text-yellow-500/80 mb-2">Share this code with the courier only when you receive the package.</p>
                                 <div className="text-3xl font-mono font-bold text-white tracking-widest">{selectedOrder.deliveryPin}</div>
                             </div>

                             {/* APPROVAL BUTTON */}
                             {!selectedOrder.isCourierApproved && (
                                 <div className="mt-4">
                                     <button 
                                        onClick={() => handleApproveCourier(selectedOrder.id)}
                                        disabled={approvingId === selectedOrder.id}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg animate-pulse flex items-center justify-center gap-2"
                                     >
                                        <ShieldCheck className="w-5 h-5" />
                                        {approvingId === selectedOrder.id ? 'Approving...' : 'Approve Courier for Pickup'}
                                     </button>
                                     <p className="text-xs text-slate-400 mt-2 text-center">
                                         You must approve the courier before they can start the trip.
                                         The vendor will be notified immediately.
                                     </p>
                                 </div>
                             )}
                        </div>
                        <div className="h-64 bg-slate-800 rounded-lg overflow-hidden relative border border-slate-700">
                             <TrackingMap pickup={selectedOrder.pickupLocation} delivery={selectedOrder.deliveryLocation} status={selectedOrder.status} />
                        </div>
                    </div>
                </div>
            )}

            {/* ORDER ITEMS */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-900">{t('cust.items')}</h3>
                </div>
                <ul className="divide-y divide-slate-100">
                    {selectedOrder.items.map((item, i) => (
                        <li key={i} className="p-4 flex items-center gap-4">
                            <img src={item.imageUrl} alt="" className="w-16 h-16 rounded-md object-cover border border-slate-200" />
                            <div className="flex-1">
                                <h4 className="font-medium text-slate-900">{item.title}</h4>
                                <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right font-bold text-slate-900">
                                {formatPrice(item.price * item.quantity)}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* PAYMENT & ADDRESS */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-slate-900 mb-4">{t('cust.detail.payment')}</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-slate-600">
                        <span>{t('cust.detail.subtotal')}</span>
                        <span>{formatPrice(selectedOrder.total)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                        <span>{t('cust.detail.shipping')}</span>
                        <span className="text-green-600">Free</span>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-lg text-slate-900">
                        <span>{t('cust.detail.total')}</span>
                        <span>{formatPrice(selectedOrder.total)}</span>
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-2">Delivery Address</h4>
                    <p className="text-slate-600 leading-relaxed">
                        {user?.name}<br/>
                        {selectedOrder.deliveryLocation.address}
                    </p>
                </div>
            </div>
        </div>
      );
  }

  // --- MAIN DASHBOARD VIEW ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('cust.title')}</h1>
          <p className="mt-1 text-slate-500">{t('cust.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
             <div className="flex flex-col items-end">
                 <span className="font-bold text-slate-900">{user?.name}</span>
                 <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Member</span>
             </div>
             <div className="relative group">
                 <div className="relative">
                    {user?.profileImage ? (
                        <img src={user.profileImage} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-fox-600" />
                    ) : (
                        <div className="h-10 w-10 bg-fox-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {user?.name.charAt(0)}
                        </div>
                    )}
                 </div>
                 <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera className="w-4 h-4 text-white" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                 </label>
             </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0">
           <nav className="space-y-1">
             {[
               { id: 'overview', label: t('cust.tab.overview'), icon: User },
               { id: 'orders', label: t('cust.tab.orders'), icon: Package },
               { id: 'wishlist', label: t('cust.tab.wishlist'), icon: Heart },
               { id: 'wallet', label: t('cust.tab.wallet'), icon: Wallet },
               { id: 'addresses', label: t('cust.tab.addresses'), icon: MapPin },
               { id: 'settings', label: t('cust.tab.settings'), icon: Settings },
             ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === item.id 
                    ? 'bg-fox-50 text-fox-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${activeTab === item.id ? 'text-fox-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
             ))}
           </nav>
           
           <div className="mt-8 pt-8 border-t border-slate-200">
              <button 
                onClick={logout}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                 <LogOut className="mr-3 h-5 w-5" />
                 {t('nav.logout')}
              </button>
           </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-[500px]">
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
             <div className="space-y-6">
                 {/* Live Tracking Hero - Prominent if active order exists */}
                 {activeOrders.length > 0 && (
                     <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all" onClick={() => viewOrderDetails(activeOrders[0])}>
                         <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform">
                             <Truck className="w-64 h-64" />
                         </div>
                         <div className="relative z-10">
                             <div className="flex items-center gap-2 mb-4">
                                 <span className="relative flex h-3 w-3">
                                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                   <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                 </span>
                                 <h2 className="text-xl font-bold">{t('cust.recent_order')}</h2>
                             </div>
                             
                             <div className="flex flex-col md:flex-row gap-6">
                                 <div className="flex-1">
                                     <p className="text-slate-400 text-sm mb-1">Status</p>
                                     <p className="text-2xl font-bold mb-4">{getStatusBadge(activeOrders[0].status)}</p>
                                     
                                     <p className="text-slate-400 text-sm mb-1">Order ID</p>
                                     <p className="font-mono text-lg font-medium">#{activeOrders[0].id}</p>
                                 </div>
                                 <div className="flex-1">
                                     <p className="text-slate-400 text-sm mb-1">Expected Arrival</p>
                                     <p className="text-xl font-bold">Today, by 6:00 PM</p>
                                     
                                     {!activeOrders[0].isCourierApproved && activeOrders[0].status === 'courier_assigned' && (
                                         <div className="mt-2 text-xs bg-yellow-500/20 text-yellow-300 p-2 rounded border border-yellow-500/30 font-bold flex items-center gap-2 animate-pulse">
                                             <ShieldCheck className="w-4 h-4" /> Action Required: Approve Courier
                                         </div>
                                     )}
                                 </div>
                             </div>
                             
                             <div className="mt-6 pt-6 border-t border-slate-700 flex items-center gap-2 text-sm font-medium text-fox-400 group-hover:text-fox-300">
                                 View Full Details <ArrowRight className="w-4 h-4" />
                             </div>
                         </div>
                     </div>
                 )}

                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">{t('cust.stat.orders')}</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{myOrders.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">{t('cust.stat.spent')}</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">
                           {formatPrice(myOrders.reduce((acc, o) => acc + o.total, 0))}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">{t('cust.stat.active')}</p>
                        <p className="text-2xl font-bold text-fox-600 mt-1">{activeOrders.length}</p>
                    </div>
                 </div>
             </div>
          )}

          {/* TAB: ORDERS */}
          {activeTab === 'orders' && (
              <div className="space-y-4">
                 <h2 className="text-xl font-bold text-slate-900">Order History</h2>
                 <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left font-medium text-slate-500">{t('cust.order_id')}</th>
                                    <th className="px-6 py-4 text-left font-medium text-slate-500">{t('cust.date')}</th>
                                    <th className="px-6 py-4 text-left font-medium text-slate-500">{t('cust.status')}</th>
                                    <th className="px-6 py-4 text-left font-medium text-slate-500">{t('cust.total')}</th>
                                    <th className="px-6 py-4 text-right font-medium text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {myOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => viewOrderDetails(order)}>
                                        <td className="px-6 py-4 font-mono font-bold text-slate-700">#{order.id}</td>
                                        <td className="px-6 py-4 text-slate-500">{new Date(order.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                                        <td className="px-6 py-4 font-bold text-slate-900">{formatPrice(order.total)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-fox-600 hover:text-fox-700 font-medium text-xs border border-fox-200 bg-fox-50 px-3 py-1.5 rounded-lg">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                      </div>
                  </div>
              </div>
          )}

          {/* TAB: WISHLIST */}
          {activeTab === 'wishlist' && (
             <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900">{t('cust.tab.wishlist')}</h2>
                    <span className="text-sm text-slate-500">{wishlist.length} items</span>
                 </div>
                 
                 {wishlist.length === 0 ? (
                     <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                         <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                         <p className="text-slate-500">{t('cust.wishlist.empty')}</p>
                     </div>
                 ) : (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlist.map(product => (
                            <div key={product.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group">
                                <div className="relative aspect-[4/3] bg-white border-b border-slate-100 overflow-hidden">
                                    <img src={product.imageUrl} alt={product.title} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform" />
                                    <button 
                                       onClick={() => removeFromWishlist(product.id)}
                                       className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-slate-400 hover:text-red-500 shadow-sm border border-slate-200"
                                    >
                                       <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-bold text-slate-900 line-clamp-1 mb-1">{product.title}</h3>
                                    <p className="text-fox-600 font-bold mb-4">{formatPrice(product.price)}</p>
                                    <button 
                                        onClick={() => moveToCart(product)}
                                        className="mt-auto w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                     </div>
                 )}
             </div>
          )}

          {/* TAB: WALLET */}
          {activeTab === 'wallet' && (
             <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900">{t('cust.tab.wallet')}</h2>
                    <button className="flex items-center gap-2 text-sm font-bold text-fox-600 bg-fox-50 px-3 py-1.5 rounded-lg border border-fox-100 hover:bg-fox-100">
                        <Plus className="w-4 h-4" /> {t('cust.wallet.add')}
                    </button>
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                     {savedCards.map(card => (
                         <div key={card.id} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group">
                             <div className="absolute top-0 right-0 p-4 opacity-10">
                                 <CreditCard className="w-24 h-24 transform rotate-12" />
                             </div>
                             <div className="relative z-10">
                                 <div className="flex justify-between items-start mb-8">
                                     <span className="font-mono text-xs opacity-70 uppercase tracking-widest">{card.brand}</span>
                                     {card.isDefault && (
                                         <span className="bg-white/20 text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">DEFAULT</span>
                                     )}
                                 </div>
                                 <div className="font-mono text-xl tracking-widest mb-6">
                                     •••• •••• •••• {card.last4}
                                 </div>
                                 <div className="flex justify-between items-end">
                                     <div>
                                         <span className="text-[10px] opacity-60 uppercase block mb-1">Card Holder</span>
                                         <span className="text-sm font-medium uppercase">{user?.name}</span>
                                     </div>
                                     <div className="text-right">
                                         <span className="text-[10px] opacity-60 uppercase block mb-1">Expires</span>
                                         <span className="text-sm font-medium">{card.expiry}</span>
                                     </div>
                                 </div>
                             </div>
                             <button 
                                onClick={() => removeCard(card.id)}
                                className="absolute top-2 right-2 text-white/50 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                                 <Trash2 className="w-4 h-4" />
                             </button>
                         </div>
                     ))}
                 </div>
             </div>
          )}

          {/* TAB: ADDRESSES */}
          {activeTab === 'addresses' && (
             <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900">{t('cust.tab.addresses')}</h2>
                    <button className="flex items-center gap-2 text-sm font-bold text-fox-600 bg-fox-50 px-3 py-1.5 rounded-lg border border-fox-100 hover:bg-fox-100">
                        <Plus className="w-4 h-4" /> {t('cust.addr.add')}
                    </button>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {addresses.map(addr => (
                         <div key={addr.id} className={`p-4 rounded-xl border-2 flex items-start gap-3 relative group ${addr.isDefault ? 'border-fox-500 bg-fox-50/50' : 'border-slate-200 bg-white'}`}>
                             <div className={`p-2 rounded-full flex-shrink-0 ${addr.isDefault ? 'bg-fox-100 text-fox-600' : 'bg-slate-100 text-slate-500'}`}>
                                 {addr.type === 'Home' ? <Home className="w-5 h-5" /> : addr.type === 'Work' ? <Briefcase className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                             </div>
                             <div>
                                 <div className="flex items-center gap-2 mb-1">
                                     <h4 className="font-bold text-slate-900">{addr.label}</h4>
                                     {addr.isDefault && <span className="text-[10px] font-bold bg-fox-600 text-white px-1.5 py-0.5 rounded">{t('cust.addr.default')}</span>}
                                 </div>
                                 <p className="text-sm text-slate-600 leading-relaxed">{addr.address}</p>
                             </div>
                             {!addr.isDefault && (
                                <button 
                                    onClick={() => removeAddress(addr.id)}
                                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                             )}
                         </div>
                     ))}
                 </div>
             </div>
          )}
          
          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
             <div className="max-w-2xl">
                 <h2 className="text-xl font-bold text-slate-900 mb-6">{t('cust.settings.profile')}</h2>
                 
                 <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                     <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
                         <div className="relative group">
                            {user?.profileImage ? (
                                <img src={user.profileImage} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-fox-600" />
                            ) : (
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                    <User className="w-10 h-10" />
                                </div>
                            )}
                            <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                <Camera className="w-6 h-6 text-white" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                         </div>
                         <div>
                             <h3 className="font-bold text-lg text-slate-900">{user?.name}</h3>
                             <p className="text-slate-500 text-sm">{user?.email}</p>
                             <button className="text-xs text-fox-600 font-medium hover:underline mt-1">Change Profile Photo</button>
                         </div>
                     </div>

                     <div className="space-y-6">
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                                 <input 
                                    type="text" 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-fox-500 focus:border-fox-500 text-sm" 
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                 />
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                                 <input 
                                    type="text" 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-fox-500 focus:border-fox-500 text-sm" 
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                 />
                             </div>
                         </div>
                         
                         <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                             <input type="email" className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 text-sm" value={user?.email} readOnly />
                         </div>

                         <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                             <input type="tel" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-fox-500 focus:border-fox-500 text-sm" placeholder="+33 6 12 34 56 78" />
                         </div>

                         <div className="pt-4">
                             <button 
                                onClick={handleSaveProfile}
                                disabled={isSavingProfile}
                                className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 text-sm flex items-center gap-2"
                             >
                                 {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                 {t('cust.settings.save')}
                             </button>
                         </div>
                     </div>
                 </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
