import React, { useState } from 'react';
import { X, Shield, Lock, ArrowRight, Loader2 } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    // Removed simulated delay for instant access
    if (password === 'admin') {
      setPassword('');
      onLogin();
    } else {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="relative z-50">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:w-full sm:max-w-sm border border-slate-100">
            
            <button 
              onClick={onClose}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
                <Shield className="h-6 w-6 text-slate-600" />
              </div>
              
              <h3 className="text-xl font-bold text-center text-slate-900 mb-1">Admin Access</h3>
              <p className="text-sm text-center text-slate-500 mb-6">Restricted area. Please authenticate.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 uppercase mb-1 ml-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-fox-500 focus:border-fox-500 outline-none transition-colors ${error ? 'border-red-300 bg-red-50 text-red-900' : 'border-slate-300 bg-slate-50'}`}
                      placeholder="Enter password (hint: admin)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoFocus
                    />
                  </div>
                  {error && <p className="mt-2 text-xs text-red-600 ml-1">Incorrect password. Please try again.</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <>
                      Access Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
            <div className="bg-slate-50 px-8 py-3 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400">Secure Environment v2.1.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};