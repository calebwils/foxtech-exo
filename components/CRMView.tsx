import React, { useEffect } from 'react';
import { NotificationRequest } from '../types';
import { Mail, CheckCircle, Clock, Loader2, User, MessageSquare, Package } from 'lucide-react';
import { Loader } from './Loader';

interface CRMViewProps {
  notifications: NotificationRequest[];
  loading: boolean;
  loadNotifications: () => Promise<void>;
  onMarkAsSent: (id: string) => Promise<void>;
}

export const CRMView: React.FC<CRMViewProps> = ({ 
  notifications, 
  loading, 
  loadNotifications,
  onMarkAsSent 
}) => {
  
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleSendNotification = async (id: string, email: string) => {
    // In a real app, this would trigger a backend email service.
    const confirmed = window.confirm(`Send availability notification to ${email}?`);
    if (confirmed) {
      await onMarkAsSent(id);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Customer Relationship Management</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage customer requests, track product interest, and handle availability notifications.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden rounded-lg border border-slate-200 shadow-sm p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-50 rounded-md p-3">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">Total Requests</dt>
                <dd className="text-2xl font-bold text-slate-900">{notifications.length}</dd>
              </dl>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden rounded-lg border border-slate-200 shadow-sm p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-orange-50 rounded-md p-3">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">Pending Actions</dt>
                <dd className="text-2xl font-bold text-slate-900">
                  {notifications.filter(n => n.status === 'pending').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden rounded-lg border border-slate-200 shadow-sm p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-50 rounded-md p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">Fulfilled Requests</dt>
                <dd className="text-2xl font-bold text-slate-900">
                  {notifications.filter(n => n.status === 'notified').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Product Availability Requests</h3>
          <button 
            onClick={() => loadNotifications()}
            className="text-sm text-fox-600 hover:text-fox-700 font-medium flex items-center gap-1"
          >
            <Loader2 className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh List
          </button>
        </div>

        {loading && notifications.length === 0 ? (
          <div className="py-12">
            <Loader />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No customer requests found.</p>
          </div>
        ) : (
          <ul role="list" className="divide-y divide-slate-200">
            {notifications.map((request) => (
              <li key={request.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Left Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                        request.status === 'pending' 
                          ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' 
                          : 'bg-green-50 text-green-700 ring-green-600/20'
                      }`}>
                        {request.status === 'pending' ? 'Pending Alert' : 'Notified'}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                         <Clock className="w-3 h-3" /> {formatDate(request.timestamp)}
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-3 mt-2">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <User className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-slate-900">{request.email}</h4>
                        <div className="flex items-center gap-2 text-sm text-fox-600 font-medium mt-0.5">
                           <Package className="w-4 h-4" />
                           Requested: {request.productName} <span className="text-slate-400 font-normal text-xs">({request.productId})</span>
                        </div>
                        {request.requirements && (
                          <p className="mt-2 text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 italic">
                            "{request.requirements}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Action */}
                  <div className="flex items-center sm:flex-col sm:items-end gap-2">
                    {request.status === 'pending' ? (
                      <button
                        onClick={() => handleSendNotification(request.id, request.email)}
                        className="inline-flex items-center justify-center rounded-md bg-fox-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-fox-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fox-600 min-w-[140px]"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Alert
                      </button>
                    ) : (
                      <button
                        disabled
                        className="inline-flex items-center justify-center rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500 cursor-not-allowed min-w-[140px]"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Sent
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};