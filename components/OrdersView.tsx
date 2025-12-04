
import React, { useState, useMemo } from 'react';
import { Order } from '../types';
import { 
  Search, Calendar, Truck, CheckCircle, 
  Clock, Printer, Download, 
  ChevronDown, ChevronUp, Package, User, FileText,
  Loader2, Bike, Lock, MapPin, Key, Shield
} from 'lucide-react';
import { Loader } from './Loader';
import { markOrderReady } from '../services/productService';
import { useI18n } from '../contexts/I18nContext';

interface OrdersViewProps {
  orders: Order[];
  loading: boolean;
  onDispatch: (id: string) => Promise<void>; 
}

type OrderStatus = 'all' | 'pending' | 'active' | 'delivered';

export const OrdersView: React.FC<OrdersViewProps> = ({ orders, loading, onDispatch }) => {
  const { t, formatPrice } = useI18n();
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const handleMarkReady = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setProcessingId(id);
    await markOrderReady(id); 
    await onDispatch(id); 
    setProcessingId(null);
  };

  const { groupedOrders, stats } = useMemo(() => {
    let filtered = orders;

    if (statusFilter === 'pending') {
        filtered = filtered.filter(o => o.status === 'pending_processing');
    } else if (statusFilter === 'active') {
        filtered = filtered.filter(o => ['ready_for_pickup', 'courier_assigned', 'picked_up'].includes(o.status));
    } else if (statusFilter === 'delivered') {
        filtered = filtered.filter(o => o.status === 'delivered');
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(o => 
        o.id.toLowerCase().includes(q) || 
        o.customerName.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q)
      );
    }

    const groups: Record<string, Order[]> = {};
    
    filtered.forEach(order => {
      const date = new Date(order.date);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      let key = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      
      if (date.toDateString() === today.toDateString()) {
        key = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = 'Yesterday';
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(order);
    });

    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending_processing').length,
      active: orders.filter(o => ['ready_for_pickup', 'courier_assigned', 'picked_up'].includes(o.status)).length,
      revenue: orders.reduce((acc, curr) => acc + curr.total, 0)
    };

    return { groupedOrders: groups, stats };
  }, [orders, statusFilter, searchQuery]);

  const handlePrint = () => {
    window.alert("Printing Packing Slip...");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'pending_processing': 
            return <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20"><Clock className="w-3 h-3" /> {t('orders.status.new')}</span>;
        case 'ready_for_pickup':
            return <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20"><Package className="w-3 h-3" /> {t('orders.status.waiting')}</span>;
        case 'courier_assigned':
            return <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-600/20"><Bike className="w-3 h-3" /> {t('orders.status.assigned')}</span>;
        case 'picked_up':
            return <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/20"><Truck className="w-3 h-3" /> {t('orders.status.transit')}</span>;
        case 'delivered':
            return <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"><CheckCircle className="w-3 h-3" /> {t('orders.status.delivered')}</span>;
        default:
            return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('orders.title')}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {t('orders.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex bg-white border border-slate-200 rounded-lg px-4 py-2 shadow-sm gap-6">
             <div className="flex flex-col">
                <span className="text-xs text-slate-500 uppercase font-bold">{t('orders.stats.pack')}</span>
                <span className="text-lg font-bold text-fox-600">{stats.pending}</span>
             </div>
             <div className="w-px bg-slate-200"></div>
             <div className="flex flex-col">
                <span className="text-xs text-slate-500 uppercase font-bold">{t('orders.stats.transit')}</span>
                <span className="text-lg font-bold text-blue-600">{stats.active}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-4 justify-between items-center sticky top-20 z-20">
        <div className="flex p-1 space-x-1 bg-slate-100 rounded-lg">
          {[
              { id: 'all', label: t('orders.tab.all') },
              { id: 'pending', label: t('orders.tab.pack') },
              { id: 'active', label: t('orders.tab.transit') },
              { id: 'delivered', label: t('orders.tab.history') }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as OrderStatus)}
              className={`
                px-4 py-2 text-sm font-medium rounded-md transition-all
                ${statusFilter === tab.id 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder={t('orders.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-fox-500 focus:border-fox-500 sm:text-sm"
          />
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : Object.keys(groupedOrders).length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-dashed border-slate-300">
          <Package className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-2 text-sm font-semibold text-slate-900">{t('orders.empty')}</h3>
          <p className="mt-1 text-sm text-slate-500">{t('orders.empty_sub')}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedOrders).map(([dateGroup, groupOrders]) => (
            <div key={dateGroup} className="space-y-3">
              <div className="flex items-center gap-2 ml-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{dateGroup}</h3>
                <div className="h-px bg-slate-200 flex-1 ml-2"></div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider w-10"></th>
                        <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">{t('orders.col.id')}</th>
                        <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">{t('orders.col.customer')}</th>
                        <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">{t('orders.col.status')}</th>
                        <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">{t('orders.col.courier')}</th>
                        <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">{t('orders.col.security')}</th>
                        <th className="px-6 py-3 text-right font-medium text-slate-500 uppercase tracking-wider">{t('orders.col.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {groupOrders.map((order) => (
                        <React.Fragment key={order.id}>
                          <tr 
                            onClick={() => toggleExpand(order.id)}
                            className={`cursor-pointer hover:bg-slate-50 transition-colors ${expandedOrderId === order.id ? 'bg-slate-50' : ''}`}
                          >
                            <td className="px-6 py-4 text-slate-400">
                              {expandedOrderId === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </td>
                            <td className="px-6 py-4 font-mono font-medium text-slate-900">
                              #{order.id}
                              <div className="text-xs text-slate-500 font-sans font-normal mt-0.5">
                                {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-slate-900">{order.customerName}</div>
                              <div className="text-xs text-slate-500">{order.deliveryLocation.address}</div>
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(order.status)}
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                              {order.courierName ? (
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                        <Bike className="w-3 h-3" />
                                        <span className="font-medium">{order.courierName}</span>
                                    </div>
                                    {order.status === 'courier_assigned' && (
                                        <span className={`text-[10px] px-1.5 rounded mt-0.5 w-fit flex items-center gap-1 ${order.isCourierApproved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {order.isCourierApproved ? <Shield className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                            {order.isCourierApproved ? 'Approved' : 'Pending Approval'}
                                        </span>
                                    )}
                                  </div>
                              ) : (
                                  <span className="text-slate-400 italic text-xs">{t('orders.status.waiting')}</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                                {order.status !== 'delivered' && (
                                    <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded w-fit text-slate-600 text-xs border border-slate-200" title="Give this code to courier">
                                        <Key className="w-3 h-3 text-blue-500" /> 
                                        {t('orders.detail.pin')}: <span className="font-bold font-mono">{order.pickupPin}</span>
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {order.status === 'pending_processing' ? (
                                <button
                                  onClick={(e) => handleMarkReady(e, order.id)}
                                  disabled={processingId === order.id}
                                  className="inline-flex items-center justify-center rounded-md bg-fox-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-fox-500 disabled:opacity-70 transition-colors"
                                >
                                  {processingId === order.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Package className="w-4 h-4 mr-1.5" />
                                      {t('orders.action.ready')}
                                    </>
                                  )}
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handlePrint(); }}
                                  className="inline-flex items-center justify-center rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                                >
                                  <Printer className="w-4 h-4 mr-1.5" />
                                  {t('orders.action.print')}
                                </button>
                              )}
                            </td>
                          </tr>

                          {/* Expanded Detail View */}
                          {expandedOrderId === order.id && (
                            <tr className="bg-slate-50">
                              <td colSpan={7} className="px-6 py-4">
                                <div className="bg-white rounded-lg border border-slate-200 p-4 ml-10 shadow-sm">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                            <Package className="w-4 h-4 text-fox-600" />
                                            {t('orders.detail.items')}
                                        </h4>
                                        <ul className="divide-y divide-slate-100 border-t border-slate-100">
                                        {order.items.map((item, idx) => (
                                            <li key={`${order.id}-item-${idx}`} className="py-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <img src={item.imageUrl} alt="" className="w-10 h-10 rounded object-cover bg-slate-100" />
                                                <div>
                                                <p className="text-sm font-medium text-slate-900">{item.title}</p>
                                                <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <div className="text-sm font-bold text-slate-900">
                                                {formatPrice(item.quantity * item.price)}
                                            </div>
                                            </li>
                                        ))}
                                        </ul>
                                    </div>

                                    <div className="bg-slate-50 rounded p-4 border border-slate-100 h-fit">
                                      <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">{t('orders.detail.logistics')}</h5>
                                      <div className="space-y-3">
                                          <div>
                                              <p className="text-xs text-slate-400 uppercase font-bold mb-0.5">{t('orders.detail.to')}</p>
                                              <div className="flex items-start gap-2 text-sm text-slate-700">
                                                  <MapPin className="w-4 h-4 mt-0.5 text-fox-500" />
                                                  {order.deliveryLocation.address}
                                              </div>
                                          </div>
                                          <div className="pt-2 border-t border-slate-200">
                                              <p className="text-xs text-slate-400 uppercase font-bold mb-0.5">{t('orders.detail.verification')}</p>
                                              <p className="text-xs text-slate-600 mb-1">{t('orders.detail.pin_desc')}</p>
                                              <div className="text-xl font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 w-fit">
                                                 {order.pickupPin}
                                              </div>
                                          </div>
                                          
                                          {order.status === 'courier_assigned' && (
                                              <div className={`mt-2 p-2 rounded border text-xs flex items-center gap-2 ${order.isCourierApproved ? 'bg-green-100 border-green-200 text-green-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                                                  <Shield className="w-4 h-4" />
                                                  {order.isCourierApproved ? 'Courier Approved by Customer' : 'Waiting for Customer to Approve Courier'}
                                              </div>
                                          )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
