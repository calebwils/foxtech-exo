

import React, { useState, useEffect } from 'react';
import { X, Loader2, Mail, Lock, User, ArrowRight, Store, Bike, ShoppingBag, AlertCircle, CheckSquare, Square } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type RoleType = 'customer' | 'seller' | 'courier';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const { t } = useI18n();
  
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<RoleType>('customer');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    storeName: '',
    vehicleType: 'bike' as 'bike' | 'car' | 'van'
  });

  // Load saved email from local storage when modal opens
  useEffect(() => {
    if (isOpen) {
      const savedEmail = localStorage.getItem('izitobuy_remembered_email');
      if (savedEmail) {
        setFormData(prev => ({ ...prev, email: savedEmail }));
        setRememberMe(true);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(formData.email, formData.password, role);
        
        // Handle Remember Me Logic
        if (rememberMe) {
          localStorage.setItem('izitobuy_remembered_email', formData.email);
        } else {
          localStorage.removeItem('izitobuy_remembered_email');
        }

      } else {
        await register({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: role,
            storeName: role === 'seller' ? formData.storeName : undefined,
            vehicleType: role === 'courier' ? formData.vehicleType : undefined
        });
      }
      onClose();
      // Reset form (keep email if remembered)
      setFormData(prev => ({ 
        name: '', 
        email: rememberMe ? prev.email : '', 
        password: '', 
        storeName: '', 
        vehicleType: 'bike' 
      }));
      setRole('customer');
    } catch (error) {
      console.error("Auth error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-50">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:w-full sm:max-w-md border border-slate-100">
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Auth Mode Tabs */}
            <div className="flex border-b border-slate-100">
              <button
                className={`flex-1 py-4 text-sm font-semibold text-center transition-colors ${mode === 'login' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                onClick={() => setMode('login')}
              >
                {t('auth.signin')}
              </button>
              <button
                className={`flex-1 py-4 text-sm font-semibold text-center transition-colors ${mode === 'register' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                onClick={() => setMode('register')}
              >
                {t('auth.createAccount')}
              </button>
            </div>

            <div className="p-8">
              <div className="mb-6 text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {mode === 'login' ? t('auth.welcome') : t('auth.join')}
                </h3>
                <p className="text-sm text-slate-500">
                  {mode === 'login' ? t('auth.signinSub') : t('auth.joinSub')}
                </p>
              </div>

              {/* Role Selection */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                        role === 'customer' ? 'border-slate-800 bg-slate-50 ring-1 ring-slate-800' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                      <ShoppingBag className={`w-6 h-6 mb-2 ${role === 'customer' ? 'text-slate-800' : 'text-slate-400'}`} />
                      <span className={`text-xs font-bold ${role === 'customer' ? 'text-slate-800' : 'text-slate-500'}`}>{t('auth.role.customer')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('seller')}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                        role === 'seller' ? 'border-fox-600 bg-fox-50 ring-1 ring-fox-600' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                      <Store className={`w-6 h-6 mb-2 ${role === 'seller' ? 'text-fox-600' : 'text-slate-400'}`} />
                      <span className={`text-xs font-bold ${role === 'seller' ? 'text-fox-600' : 'text-slate-500'}`}>{t('auth.role.seller')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('courier')}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                        role === 'courier' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                      <Bike className={`w-6 h-6 mb-2 ${role === 'courier' ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className={`text-xs font-bold ${role === 'courier' ? 'text-blue-600' : 'text-slate-500'}`}>{t('auth.role.courier')}</span>
                  </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                {mode === 'register' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 uppercase mb-1 ml-1">{t('auth.name')}</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          autoComplete="name"
                          required
                          className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                          placeholder="Full Name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Role Specific Register Fields */}
                    {role === 'seller' && (
                        <div>
                          <label className="block text-xs font-medium text-slate-700 uppercase mb-1 ml-1">{t('auth.storeName')}</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Store className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                              type="text"
                              name="storeName"
                              autoComplete="organization"
                              required
                              className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-fox-500 outline-none"
                              placeholder="My Awesome Store"
                              value={formData.storeName}
                              onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                            />
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 ml-1">
                             * You can complete your full profile (logo, address, etc.) later in your dashboard.
                          </p>
                        </div>
                    )}

                    {role === 'courier' && (
                        <div>
                          <label className="block text-xs font-medium text-slate-700 uppercase mb-1 ml-1">{t('auth.vehicle')}</label>
                          <select
                            className="block w-full pl-3 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={formData.vehicleType}
                            onChange={(e) => setFormData({...formData, vehicleType: e.target.value as any})}
                          >
                              <option value="bike">Bicycle / Motorbike</option>
                              <option value="car">Car</option>
                              <option value="van">Van / Truck</option>
                          </select>
                        </div>
                    )}
                  </div>
                )}

                {/* Common Fields */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 uppercase mb-1 ml-1">{t('auth.email')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      required
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 uppercase mb-1 ml-1">{t('auth.password')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      autoComplete={mode === 'login' ? "current-password" : "new-password"}
                      required
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>

                {/* Remember Me (Only in Login Mode) */}
                {mode === 'login' && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        {rememberMe ? (
                          <CheckSquare className="w-5 h-5 text-slate-800" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />
                        )}
                      </div>
                      <span className="text-sm text-slate-600">Remember email</span>
                    </label>
                    
                    <button type="button" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white transition-all disabled:opacity-70 mt-6 ${
                      role === 'seller' ? 'bg-fox-600 hover:bg-fox-500' : 
                      role === 'courier' ? 'bg-blue-600 hover:bg-blue-500' : 
                      'bg-slate-900 hover:bg-slate-800'
                  }`}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <>
                      {mode === 'login' ? `${t('auth.submitLogin')} (${t(`auth.role.${role}`)})` : t('auth.submitRegister')} <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
            <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                {t('auth.terms')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
