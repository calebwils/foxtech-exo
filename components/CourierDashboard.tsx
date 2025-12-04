
import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { getOrders, acceptDeliveryJob, confirmPickup, completeDelivery, updateCourierPosition } from '../services/productService';
import { 
  Navigation, Package, CheckCircle, 
  Bike, Phone, Loader2, Box, 
  BellRing, AlertTriangle, ToggleLeft, ToggleRight, Camera, Hourglass, Lock, Briefcase
} from 'lucide-react';
import { Loader } from './Loader';
import { TrackingMap } from './TrackingMap';

export const CourierDashboard: React.FC = () => {
  const { user, updateProfileImage } = useAuth();
  const { t, formatPrice } = useI18n();
  const [activeTab, setActiveTab] = useState<'jobs' | 'active' | 'history'>('jobs');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  
  // Notification State
  const [lastAvailableCount, setLastAvailableCount] = useState(0);
  const [newJobAlert, setNewJobAlert] = useState(false);

  // Active Job State for PIN entry
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  const MAX_JOBS = 5;

  const fetchOrders = async () => {
    const allOrders = await getOrders();
    setOrders(allOrders);
    return allOrders;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const url = URL.createObjectURL(file);
        updateProfileImage(url);
    }
  };

  // Initial Load
  useEffect(() => {
    (async () => {
        setLoading(true);
        const data = await fetchOrders();
        const count = data.filter(o => o.status === 'ready_for_pickup' && !o.courierId).length;
        setLastAvailableCount(count);
        setLoading(false);
    })();
  }, []);

  // Polling for New Jobs & Status Updates (Approval)
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(async () => {
        const latestOrders = await getOrders();
        setOrders(latestOrders);
        
        const currentAvailableCount = latestOrders.filter(o => o.status === 'ready_for_pickup' && !o.courierId).length;
        
        if (currentAvailableCount > lastAvailableCount) {
            setNewJobAlert(true);
        }
        setLastAvailableCount(currentAvailableCount);
    }, 8000); 

    return () => clearInterval(interval);
  }, [lastAvailableCount, isOnline]);

  const availableJobs = orders.filter(o => o.status === 'ready_for_pickup' && !o.courierId);
  const myActiveDeliveries = orders.filter(o => o.courierId === user?.id && (o.status === 'courier_assigned' || o.status === 'picked_up'));
  const myHistory = orders.filter(o => o.courierId === user?.id && o.status === 'delivered');

  const activeJobCount = myActiveDeliveries.length;
  // Rule: Courier can take as many as they want, up to 5.
  const canTakeMoreJobs = activeJobCount < MAX_JOBS;

  const handleAcceptJob = async (orderId: string) => {
    if (!user) return;
    
    if (!canTakeMoreJobs) {
        alert(`You have reached the maximum limit of ${MAX_JOBS} active jobs. Deliver some orders to accept new ones.`);
        return;
    }

    setProcessingId(orderId);
    await acceptDeliveryJob(orderId, { 
        id: user.id, 
        name: user.name, 
        vehicle: user.vehicleType || 'bike' 
    });
    
    await fetchOrders();
    setActiveTab('active');
    setProcessingId(null);
    setNewJobAlert(false); 
  };

  const handleConfirmPickup = async (orderId: string) => {
    setProcessingId(orderId);
    await updateCourierPosition(orderId, 48.00, 2.00); 
    await confirmPickup(orderId);
    await fetchOrders();
    setProcessingId(null);
  };

  const handleCompleteDelivery = async (orderId: string) => {
    setProcessingId(orderId);
    setPinError(null);
    const success = await completeDelivery(orderId, pinInput);
    if (success) {
        setPinInput('');
        await fetchOrders();
    } else {
        setPinError(t('courier.error.pin'));
    }
    setProcessingId(null);
  };

  const handleCallSeller = (phone: string) => {
      window.open(`tel:${phone}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      
      {/* New Job Alert Notification */}
      {newJobAlert && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
              <button 
                onClick={() => { setActiveTab('jobs'); setNewJobAlert(false); window.scrollTo({top:0, behavior:'smooth'}); }}
                className="bg-fox-600 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 font-bold ring-4 ring-white"
              >
                  <BellRing className="w-5 h-5 fill-current" /> 
                  {t('courier.alert.new_job')}
              </button>
          </div>
      )}

      {/* Courier Header Card */}
      <div className="bg-slate-900 p-6 rounded-xl text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Bike className="w-40 h-40 text-white transform rotate-12" />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center overflow-hidden relative group">
                    {user?.profileImage ? (
                        <img src={user.profileImage} alt="Courier" className="w-full h-full object-cover" />
                    ) : (
                        <Bike className="w-8 h-8 text-slate-400" />
                    )}
                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="w-5 h-5 text-white" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                </div>
                
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl font-bold">{t('courier.title')}</h1>
                        <div 
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                                isOnline 
                                ? activeJobCount > 0 ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'bg-green-500/20 border-green-500 text-green-400'
                                : 'bg-slate-700 border-slate-600 text-slate-400'
                            }`}
                        >
                            <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? (activeJobCount > 0 ? 'bg-yellow-400' : 'bg-green-400 animate-pulse') : 'bg-slate-400'}`}></div>
                            {!isOnline ? t('courier.offline') : activeJobCount > 0 ? t('courier.busy') : t('courier.available')}
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm">
                        {t('courier.hello')}, <span className="font-bold text-white">{user?.name}</span>
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-300 hidden md:block">
                        {isOnline ? t('courier.visible') : t('courier.hidden')}
                    </span>
                    <button 
                        onClick={() => setIsOnline(!isOnline)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all shadow-sm ${
                            isOnline ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                    >
                        {isOnline ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                        {isOnline ? t('courier.online') : t('courier.offline')}
                    </button>
                </div>
                {/* Capacity Indicator */}
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
                     <Briefcase className="w-3 h-3 text-fox-500" />
                     <span>Capacity: <span className={`${activeJobCount >= MAX_JOBS ? 'text-red-400' : 'text-white'}`}>{activeJobCount}</span> / {MAX_JOBS} Jobs</span>
                </div>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-30 bg-slate-50 pt-2 pb-4">
        <div className="flex space-x-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            {[
                { id: 'jobs', label: t('courier.tabs.jobs'), icon: Package, count: availableJobs.length },
                { id: 'active', label: t('courier.tabs.active'), icon: Navigation, count: myActiveDeliveries.length },
                { id: 'history', label: t('courier.tabs.history'), icon: CheckCircle, count: null }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center py-3 text-sm font-bold rounded-lg transition-all ${
                        activeTab === tab.id 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                    {tab.count !== null && tab.count > 0 && (
                        <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${
                            activeTab === tab.id ? 'bg-fox-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                            {tab.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
         <Loader />
      ) : (
         <div className="space-y-4">
            
            {/* JOB LIST */}
            {activeTab === 'jobs' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900">{t('courier.jobs.title')}</h3>
                        <button onClick={() => fetchOrders()} className="text-fox-600 text-sm font-bold hover:underline flex items-center gap-1">
                            <Loader2 className={`w-3 h-3 ${loading ? 'animate-spin': ''}`} /> {t('courier.jobs.refresh')}
                        </button>
                    </div>

                    {!isOnline ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm opacity-75">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ToggleLeft className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">{t('courier.jobs.offline_title')}</h3>
                            <p className="text-slate-500 mb-4">{t('courier.jobs.offline_msg')}</p>
                            <button onClick={() => setIsOnline(true)} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-500">
                                {t('courier.jobs.go_online')}
                            </button>
                        </div>
                    ) : availableJobs.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                            <Package className="mx-auto h-12 w-12 text-slate-300 animate-pulse" />
                            <h3 className="mt-4 text-lg font-bold text-slate-900">{t('courier.jobs.empty_title')}</h3>
                            <p className="mt-1 text-sm text-slate-500">{t('courier.jobs.empty_msg')}</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {availableJobs.map(order => {
                                const isBlocked = !canTakeMoreJobs;
                                return (
                                    <div key={order.id} className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col ${isBlocked ? 'opacity-60 grayscale-[0.5]' : 'border-slate-200'}`}>
                                        <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-slate-700 text-xs bg-white border border-slate-200 px-1.5 py-0.5 rounded">#{order.id}</span>
                                                </div>
                                                <h4 className="font-bold text-slate-900 mt-1">{order.items.length} {t('courier.card.items')}</h4>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-lg font-bold text-green-600">{formatPrice(12.50)}</span>
                                                <span className="text-[10px] text-slate-400 uppercase font-bold">{t('courier.card.earnings')}</span>
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-4 relative flex-1">
                                            <div className="absolute left-[29px] top-[28px] bottom-[28px] w-0.5 bg-slate-200 border-l border-dashed border-slate-300"></div>
                                            <div className="flex items-start gap-3 relative z-10">
                                                <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm mt-1 ring-2 ring-blue-100"></div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('courier.card.pickup')}</p>
                                                    <p className="text-sm font-bold text-slate-900 line-clamp-2">{order.pickupLocation.address}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 relative z-10">
                                                <div className="w-3 h-3 rounded-full bg-fox-500 border-2 border-white shadow-sm mt-1 ring-2 ring-fox-100"></div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('courier.card.deliver')}</p>
                                                    <p className="text-sm font-bold text-slate-900 line-clamp-2">{order.deliveryLocation.address}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 pt-0 mt-auto">
                                            <button 
                                                onClick={() => handleAcceptJob(order.id)}
                                                disabled={processingId === order.id || isBlocked}
                                                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${
                                                    isBlocked
                                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                                    : 'bg-slate-900 text-white hover:bg-fox-600 shadow-lg shadow-slate-200'
                                                }`}
                                            >
                                                {processingId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : t('courier.card.accept')}
                                            </button>
                                            {isBlocked && (
                                                <div className="mt-2 flex items-start gap-1.5 text-[10px] text-amber-600 font-medium bg-amber-50 p-2 rounded border border-amber-100">
                                                    <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                                                    <span>Max limit reached. Finish jobs to accept more.</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ACTIVE DELIVERIES */}
            {activeTab === 'active' && (
                myActiveDeliveries.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                        <Navigation className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-slate-900 font-bold">{t('courier.active.no_tasks')}</h3>
                        <p className="text-slate-500 text-sm">{t('courier.jobs.empty_msg')}</p>
                        <button onClick={() => setActiveTab('jobs')} className="mt-4 bg-fox-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-fox-500">{t('courier.active.find_jobs')}</button>
                    </div>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-2">
                        {myActiveDeliveries.map(order => (
                            <div key={order.id} className="bg-white rounded-xl border border-fox-200 shadow-xl relative overflow-hidden flex flex-col ring-1 ring-fox-100">
                                <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-fox-400">#{order.id}</span>
                                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded font-medium border border-white/10">
                                            {order.status === 'courier_assigned' ? t('courier.active.pickup_phase') : t('courier.active.delivery_phase')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                                        <CheckCircle className="w-3 h-3" /> {t('courier.active.active_tag')}
                                    </div>
                                </div>
                                
                                <div className="h-56 relative bg-slate-100">
                                    <TrackingMap 
                                        pickup={order.pickupLocation} 
                                        delivery={order.deliveryLocation} 
                                        status={order.status} 
                                    />
                                    {/* Locked State Overlay */}
                                    {!order.isCourierApproved && order.status === 'courier_assigned' && (
                                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-20 text-center p-6">
                                            <div className="bg-white p-4 rounded-xl shadow-lg max-w-sm">
                                                <Lock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                                                <h4 className="font-bold text-slate-900 mb-1">Waiting for Customer Approval</h4>
                                                <p className="text-xs text-slate-600">
                                                    You cannot proceed to pickup until the customer approves you.
                                                    <br/>Status will update automatically.
                                                </p>
                                                <Loader2 className="w-5 h-5 text-slate-400 animate-spin mx-auto mt-3" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="space-y-6 flex-1">
                                        <div className="space-y-0 relative">
                                            <div className="absolute left-[15px] top-[15px] bottom-[30px] w-0.5 bg-slate-200"></div>

                                            {/* Pickup Step */}
                                            <div className={`flex gap-4 pb-6 relative ${order.status === 'courier_assigned' ? 'opacity-100' : 'opacity-60'}`}>
                                                <div className="flex flex-col items-center z-10">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-sm transition-colors ${
                                                        order.status === 'courier_assigned' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-green-500 bg-green-50 text-green-600'
                                                    }`}>
                                                        {order.status === 'courier_assigned' ? '1' : <CheckCircle className="w-5 h-5" />}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide">{t('courier.step.pickup')}</h4>
                                                    <p className="text-sm text-slate-600 font-medium">
                                                        {order.isCourierApproved ? order.pickupLocation.address : 'Address Hidden (Pending Approval)'}
                                                    </p>
                                                    {order.status === 'courier_assigned' && order.isCourierApproved && (
                                                        <div className="mt-3 flex gap-2">
                                                            <button 
                                                                onClick={() => handleCallSeller(order.sellerPhone)}
                                                                className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-bold border border-blue-100 flex items-center gap-1 hover:bg-blue-100"
                                                            >
                                                                <Phone className="w-3 h-3" /> {t('courier.step.call')}
                                                            </button>
                                                            <div className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600">
                                                                Pin: <span className="font-mono font-bold text-slate-900">{order.pickupPin}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Delivery Step */}
                                            <div className={`flex gap-4 relative ${order.status === 'picked_up' ? 'opacity-100' : 'opacity-40'}`}>
                                                <div className="flex flex-col items-center z-10">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-sm ${
                                                        order.status === 'picked_up' ? 'border-fox-500 bg-fox-50 text-fox-600' : 'border-slate-300 bg-slate-50 text-slate-400'
                                                    }`}>2</div>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide">{t('courier.step.deliver')}</h4>
                                                    <p className="text-sm text-slate-600 font-medium">
                                                        {order.isCourierApproved ? order.deliveryLocation.address : 'Address Hidden'}
                                                    </p>
                                                    {order.status === 'picked_up' && (
                                                        <div className="mt-2 text-xs text-slate-500 italic bg-yellow-50 p-2 rounded border border-yellow-100">
                                                            {t('courier.step.wait_pin')}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-slate-100">
                                        {/* Action Button Logic */}
                                        {!order.isCourierApproved ? (
                                             <button disabled className="w-full py-3 bg-slate-100 text-slate-400 font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                                                 <Lock className="w-4 h-4" /> Wait for Customer Approval
                                             </button>
                                        ) : order.status === 'courier_assigned' ? (
                                            <button 
                                                onClick={() => handleConfirmPickup(order.id)}
                                                disabled={processingId === order.id}
                                                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-500 flex items-center justify-center gap-2 transition-transform active:scale-95"
                                            >
                                                {processingId === order.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Box className="w-5 h-5" /> {t('courier.action.confirm_pickup')}</>}
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <div className="flex-1 relative">
                                                    <input 
                                                        type="text" 
                                                        maxLength={4}
                                                        placeholder={t('courier.action.enter_pin')}
                                                        value={pinInput}
                                                        onChange={(e) => setPinInput(e.target.value)}
                                                        className={`w-full h-12 pl-4 pr-4 border-2 rounded-xl font-mono text-lg font-bold focus:outline-none transition-colors ${
                                                            pinError ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-300' : 'border-slate-200 focus:border-fox-500'
                                                        }`}
                                                    />
                                                </div>
                                                <button 
                                                    onClick={() => handleCompleteDelivery(order.id)}
                                                    disabled={processingId === order.id || pinInput.length !== 4}
                                                    className="flex-[2] h-12 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                                                >
                                                     {processingId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : t('courier.action.complete')}
                                                </button>
                                            </div>
                                        )}
                                        {pinError && <p className="text-xs text-red-600 font-bold mt-2 text-center animate-pulse">{pinError}</p>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* HISTORY */}
            {activeTab === 'history' && (
                 myHistory.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500">{t('courier.history.empty')}</p>
                    </div>
                 ) : (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                         <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900">{t('courier.history.earnings')}</h3>
                            <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                                {t('courier.history.total')}: {formatPrice(myHistory.length * 12.50)}
                            </span>
                         </div>
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-white">
                                <tr>
                                    <th className="px-6 py-3 text-left font-medium text-slate-500">{t('courier.history.date')}</th>
                                    <th className="px-6 py-3 text-left font-medium text-slate-500">{t('courier.history.job_details')}</th>
                                    <th className="px-6 py-3 text-right font-medium text-slate-500">{t('courier.history.amount')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {myHistory.map(order => (
                                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-slate-500">{new Date(order.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            Delivery #{order.id}
                                            <p className="text-xs text-slate-400 font-normal">{order.deliveryLocation.address}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-green-600">{formatPrice(12.50)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 )
            )}
         </div>
      )}
    </div>
  );
};
