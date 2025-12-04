
import React, { useState } from 'react';
import { 
  Store, Search, MoreHorizontal, DollarSign, Package, 
  TrendingUp, AlertTriangle, CheckCircle, XCircle, 
  Mail, Phone, MapPin, Calendar, CreditCard, ExternalLink, 
  ChevronLeft, BarChart3, Shield, Ban, Wallet, User, Camera
} from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { useAuth } from '../contexts/AuthContext';

// --- MOCK DATA FOR SELLERS ---
interface SellerProfile {
  id: string;
  name: string;
  email: string;
  storeName: string;
  status: 'active' | 'pending' | 'suspended';
  joinDate: string;
  phone: string;
  location: string;
  
  // Inventory Stats
  totalProducts: number;
  totalStock: number;
  lowStockItems: number;
  
  // Financials
  lifetimeRevenue: number;
  currentBalance: number; // Amount owed to seller
  lastPayoutDate: string;
  payoutStatus: 'paid' | 'processing' | 'due';
  subscriptionTier: 'basic' | 'pro' | 'enterprise';
  
  // Performance
  rating: number;
  returnRate: number;
}

const MOCK_SELLERS: SellerProfile[] = [
  {
    id: 'u-seller', // Matches AuthContext mock for Habas Store
    name: 'Habas Vendor',
    email: 'seller@habas.store.com',
    storeName: 'Habas Store',
    status: 'active',
    joinDate: '2023-01-15',
    phone: '+33 6 12 34 56 78',
    location: 'Paris, France',
    totalProducts: 145,
    totalStock: 3200,
    lowStockItems: 12,
    lifetimeRevenue: 124500.00,
    currentBalance: 4520.50,
    lastPayoutDate: '2023-10-01',
    payoutStatus: 'processing',
    subscriptionTier: 'enterprise',
    rating: 4.8,
    returnRate: 1.2
  },
  {
    id: 's-002',
    name: 'Sarah Mode',
    email: 'sarah@fashionista.co',
    storeName: 'Fashionista Paris',
    status: 'active',
    joinDate: '2023-03-10',
    phone: '+33 6 98 76 54 32',
    location: 'Lyon, France',
    totalProducts: 890,
    totalStock: 15400,
    lowStockItems: 45,
    lifetimeRevenue: 89200.00,
    currentBalance: 12500.00,
    lastPayoutDate: '2023-09-28',
    payoutStatus: 'due',
    subscriptionTier: 'pro',
    rating: 4.5,
    returnRate: 4.5
  }
];

export const SellersView: React.FC = () => {
  const { t, formatPrice } = useI18n();
  const { user, updateProfileImage } = useAuth();
  const [selectedSeller, setSelectedSeller] = useState<SellerProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'products'>('overview');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter Sellers
  const filteredSellers = MOCK_SELLERS.filter(seller => {
    const matchesSearch = seller.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || seller.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handlePaySeller = (id: string) => {
    alert(`Processing payout for seller ${id}. Integrating with Stripe Connect/FedaPay...`);
  };

  const handleToggleStatus = (seller: SellerProfile) => {
    const newStatus = seller.status === 'active' ? 'suspended' : 'active';
    alert(`Changing status of ${seller.storeName} to ${newStatus}`);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
         const url = URL.createObjectURL(file);
         updateProfileImage(url);
     }
  };

  // Auto-select logged-in seller if not admin
  React.useEffect(() => {
     if (user?.role === 'seller' && !selectedSeller) {
         const me = MOCK_SELLERS.find(s => s.id === user.id);
         if (me) setSelectedSeller(me);
     }
  }, [user, selectedSeller]);

  // --- DETAIL VIEW (Specific Seller Management) ---
  if (selectedSeller) {
    const isMe = user?.id === selectedSeller.id;

    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        {/* Header / Navigation */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSelectedSeller(null)}
            className={`flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors ${user?.role === 'seller' ? 'invisible' : ''}`}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> {t('sellers.back')}
          </button>
          <div className="flex gap-3">
             {user?.role === 'admin' && (
                 selectedSeller.status === 'active' ? (
                    <button 
                      onClick={() => handleToggleStatus(selectedSeller)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm font-medium hover:bg-red-100"
                    >
                       <Ban className="w-4 h-4" /> {t('sellers.suspend')}
                    </button>
                 ) : (
                    <button 
                      onClick={() => handleToggleStatus(selectedSeller)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm font-medium hover:bg-green-100"
                    >
                       <CheckCircle className="w-4 h-4" /> {t('sellers.activate')}
                    </button>
                 )
             )}
             <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50">
                <Mail className="w-4 h-4" /> {t('sellers.contact')}
             </button>
          </div>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
           <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Avatar / Logo */}
              <div className="flex-shrink-0 relative group">
                 {isMe && user.profileImage ? (
                    <img 
                        src={user.profileImage} 
                        alt="Store Logo" 
                        className="h-24 w-24 rounded-xl object-cover border border-slate-200 shadow-lg" 
                    />
                 ) : (
                    <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        {selectedSeller.storeName.charAt(0)}
                    </div>
                 )}
                 
                 {isMe && (
                     <label className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                         <Camera className="w-6 h-6 text-white" />
                         <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                     </label>
                 )}
              </div>

              {/* Main Info */}
              <div className="flex-1">
                 <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold text-slate-900">{selectedSeller.storeName}</h1>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                        selectedSeller.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                        selectedSeller.status === 'suspended' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-yellow-50 text-yellow-800 border-yellow-200'
                    }`}>
                        {t(`status.${selectedSeller.status}`)}
                    </span>
                    {selectedSeller.subscriptionTier === 'enterprise' && (
                       <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Shield className="w-3 h-3" /> Enterprise
                       </span>
                    )}
                 </div>
                 <p className="text-slate-500 text-sm mb-4">
                    {t('sellers.member_since')} {new Date(selectedSeller.joinDate).toLocaleDateString()} • ID: {selectedSeller.id}
                 </p>

                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                       <User className="w-4 h-4 text-slate-400" />
                       <span>{t('sellers.owner')}: <span className="font-medium text-slate-900">{selectedSeller.name}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                       <Mail className="w-4 h-4 text-slate-400" />
                       <span>{selectedSeller.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                       <MapPin className="w-4 h-4 text-slate-400" />
                       <span>{selectedSeller.location}</span>
                    </div>
                 </div>
              </div>

              {/* Key KPI */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 min-w-[200px]">
                 <p className="text-xs text-slate-500 uppercase font-bold mb-1">{t('sellers.lifetime_rev')}</p>
                 <p className="text-2xl font-bold text-slate-900">{formatPrice(selectedSeller.lifetimeRevenue)}</p>
                 <div className="mt-2 flex items-center text-xs text-green-600">
                    <TrendingUp className="w-3 h-3 mr-1" /> +12% {t('sellers.last_month')}
                 </div>
              </div>
           </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
           <nav className="-mb-px flex space-x-8">
              {['overview', 'financials', 'products'].map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab as any)}
                   className={`capitalize whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab
                        ? 'border-fox-500 text-fox-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                   }`}
                 >
                    {t(`sellers.tab.${tab}`)}
                 </button>
              ))}
           </nav>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* LEFT COLUMN: DYNAMIC CONTENT */}
           <div className="lg:col-span-2 space-y-6">
              
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                       <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Package className="w-5 h-5" /></div>
                          <h3 className="font-bold text-slate-900">{t('sellers.inv_health')}</h3>
                       </div>
                       <div className="space-y-4">
                          <div className="flex justify-between items-center">
                             <span className="text-sm text-slate-600">{t('sellers.total_skus')}</span>
                             <span className="font-bold text-slate-900">{selectedSeller.totalProducts}</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-sm text-slate-600">{t('sellers.total_units')}</span>
                             <span className="font-bold text-slate-900">{selectedSeller.totalStock}</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-sm text-slate-600">{t('sellers.low_stock')}</span>
                             <span className={`font-bold px-2 py-0.5 rounded ${selectedSeller.lowStockItems > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                {selectedSeller.lowStockItems}
                             </span>
                          </div>
                       </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                       <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><BarChart3 className="w-5 h-5" /></div>
                          <h3 className="font-bold text-slate-900">{t('sellers.quality')}</h3>
                       </div>
                       <div className="space-y-4">
                          <div className="flex justify-between items-center">
                             <span className="text-sm text-slate-600">{t('sellers.rating')}</span>
                             <div className="flex items-center gap-1 text-yellow-500 font-bold">
                                {selectedSeller.rating} ★
                             </div>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-sm text-slate-600">{t('sellers.return_rate')}</span>
                             <span className={`font-bold ${selectedSeller.returnRate > 5 ? 'text-red-600' : 'text-green-600'}`}>
                                {selectedSeller.returnRate}%
                             </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                             <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(selectedSeller.rating/5)*100}%` }}></div>
                          </div>
                       </div>
                    </div>
                 </div>
              )}

              {/* Financials Tab */}
              {activeTab === 'financials' && (
                 <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                       <div>
                          <h3 className="font-bold text-slate-900">{t('sellers.payout_balance')}</h3>
                          <p className="text-sm text-slate-500">{t('sellers.funds_held')}</p>
                       </div>
                       <div className="text-right">
                          <span className="block text-3xl font-bold text-slate-900">{formatPrice(selectedSeller.currentBalance)}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                             selectedSeller.payoutStatus === 'due' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                          }`}>
                             {t(`status.${selectedSeller.payoutStatus}`)}
                          </span>
                       </div>
                    </div>
                    <div className="p-6">
                       <h4 className="text-sm font-bold text-slate-900 mb-4">{t('sellers.trans_history')}</h4>
                       <div className="space-y-3">
                          {[1,2,3].map((i) => (
                             <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded border border-slate-100">
                                <div className="flex items-center gap-3">
                                   <div className="p-2 bg-green-50 rounded text-green-600"><CheckCircle className="w-4 h-4" /></div>
                                   <div>
                                      <p className="text-sm font-medium text-slate-900">{t('sellers.weekly_payout')}</p>
                                      <p className="text-xs text-slate-500">Nov {10 - i}, 2023</p>
                                   </div>
                                </div>
                                <span className="font-mono text-sm font-bold">-{formatPrice(1250.00)}</span>
                             </div>
                          ))}
                       </div>
                       
                       <div className="mt-6 pt-6 border-t border-slate-100">
                          <button 
                             onClick={() => handlePaySeller(selectedSeller.id)}
                             className="w-full py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                          >
                             <Wallet className="w-4 h-4" />
                             {t('sellers.release_payout')}
                          </button>
                       </div>
                    </div>
                 </div>
              )}

              {/* Products Link Stub */}
              {activeTab === 'products' && (
                  <div className="bg-white p-10 text-center rounded-xl border border-slate-200 border-dashed">
                      <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-slate-900">Inventory Management</h3>
                      <p className="text-slate-500 mb-6">
                          To manage {selectedSeller.storeName}'s inventory in detail (add, edit, delete items), 
                          please switch to the Global Inventory view filtered by this seller.
                      </p>
                      <button className="px-4 py-2 bg-fox-600 text-white rounded-lg font-medium hover:bg-fox-500">
                          Go to Inventory
                      </button>
                  </div>
              )}

           </div>

           {/* RIGHT COLUMN: STORE DETAILS */}
           <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">{t('sellers.account_details')}</h3>
                 <ul className="space-y-4 text-sm">
                    <li className="flex justify-between">
                       <span className="text-slate-500">Store ID</span>
                       <span className="font-mono text-slate-900">{selectedSeller.id}</span>
                    </li>
                    <li className="flex justify-between">
                       <span className="text-slate-500">{t('sellers.plan')}</span>
                       <span className="capitalize text-slate-900">{selectedSeller.subscriptionTier}</span>
                    </li>
                    <li className="flex justify-between">
                       <span className="text-slate-500">{t('sellers.last_payout')}</span>
                       <span className="text-slate-900">{selectedSeller.lastPayoutDate}</span>
                    </li>
                    <li className="pt-4 border-t border-slate-100">
                       <span className="block text-slate-500 mb-1">{t('sellers.bank')}</span>
                       <div className="flex items-center gap-2 font-mono text-slate-900 bg-slate-50 p-2 rounded border border-slate-200">
                          <div className="w-4 h-4 rounded-full bg-slate-300"></div>
                          **** **** **** 4281
                       </div>
                    </li>
                 </ul>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                 <div className="flex gap-3">
                    <ExternalLink className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                       <h4 className="font-bold text-blue-900 text-sm">{t('sellers.public_store')}</h4>
                       <p className="text-xs text-blue-700 mt-1 mb-3">{t('sellers.view_store')}</p>
                       <a href="#" className="text-xs font-bold text-blue-600 hover:underline">
                          {t('sellers.visit')} {selectedSeller.storeName} &rarr;
                       </a>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  // --- MASTER LIST VIEW ---
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('sellers.title')}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {t('sellers.subtitle')}
          </p>
        </div>
        <button className="flex items-center gap-2 bg-fox-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-fox-500 shadow-sm">
           <Mail className="w-4 h-4" /> {t('sellers.invite')}
        </button>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between sticky top-20 z-10">
         <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
               type="text"
               placeholder={t('sellers.search_placeholder')}
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-fox-500 focus:border-fox-500 sm:text-sm"
            />
         </div>
         <div className="flex gap-2 w-full sm:w-auto">
             <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full rounded-md border-slate-300 py-2 pl-3 pr-8 text-sm focus:border-fox-500 focus:ring-fox-500 bg-white border shadow-sm"
             >
                <option value="all">{t('status.all')}</option>
                <option value="active">{t('status.active')}</option>
                <option value="pending">{t('status.pending')}</option>
                <option value="suspended">{t('status.suspended')}</option>
             </select>
         </div>
      </div>

      {/* Sellers Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
               <thead className="bg-slate-50">
                  <tr>
                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('sellers.tab.products')}</th>
                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('inv.col.status')}</th>
                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('admin.inventory')}</th>
                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('orders.col.actions')}</th>
                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('sellers.payout_balance')}</th>
                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('orders.col.actions')}</th>
                  </tr>
               </thead>
               <tbody className="bg-white divide-y divide-slate-200">
                  {filteredSellers.map((seller) => (
                     <tr key={seller.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedSeller(seller)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold overflow-hidden">
                                 {user?.id === seller.id && user.profileImage ? (
                                    <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                                 ) : (
                                    seller.storeName.charAt(0)
                                 )}
                              </div>
                              <div className="ml-4">
                                 <div className="text-sm font-medium text-slate-900">{seller.storeName}</div>
                                 <div className="text-sm text-slate-500">{seller.name}</div>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                              seller.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                              seller.status === 'suspended' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-yellow-50 text-yellow-800 border-yellow-200'
                           }`}>
                              {t(`status.${seller.status}`)}
                           </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                           <div className="flex flex-col">
                              <span className="font-medium text-slate-900">{seller.totalProducts} SKUs</span>
                              <span className="text-xs">{seller.totalStock} units</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-mono">
                           {formatPrice(seller.lifetimeRevenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-900 font-mono">{formatPrice(seller.currentBalance)}</span>
                              {seller.currentBalance > 0 && (
                                 <span className="text-[10px] font-bold text-amber-600 uppercase">Payout Due</span>
                              )}
                           </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                           <button className="text-slate-400 hover:text-fox-600 p-1">
                              <MoreHorizontal className="w-5 h-5" />
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
         {filteredSellers.length === 0 && (
             <div className="p-12 text-center">
                <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">{t('sellers.empty')} "{searchQuery}"</p>
             </div>
         )}
      </div>
    </div>
  );
};
