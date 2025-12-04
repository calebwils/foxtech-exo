
import React, { useState } from 'react';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, CreditCard, ShieldCheck, Truck, Check, ArrowUp } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

export const Footer: React.FC = () => {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand & Newsletter */}
          <div className="space-y-6">
            <div>
              <span className="font-bold text-2xl tracking-tight lowercase">
                <span className="text-fox-500">izi</span>
                <span className="text-white">to</span>
                <span className="text-fox-500">buy</span>
              </span>
              <p className="mt-4 text-sm text-slate-400 leading-relaxed">
                {t('footer.tagline')}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">{t('footer.newsletter')}</h4>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Email..." 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white text-sm rounded px-3 py-2 w-full focus:outline-none focus:border-fox-500"
                />
                <button 
                  onClick={handleSubscribe}
                  className={`px-4 py-2 rounded text-sm font-bold transition-all ${
                    subscribed 
                      ? 'bg-green-600 text-white hover:bg-green-500' 
                      : 'bg-fox-600 text-white hover:bg-fox-500'
                  }`}
                >
                  {subscribed ? <Check className="w-4 h-4" /> : 'OK'}
                </button>
              </div>
              {subscribed && <p className="text-xs text-green-400 mt-1">Subscribed successfully!</p>}
            </div>
          </div>

          {/* Useful Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">{t('footer.about')}</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-fox-500 transition-colors">{t('footer.who')}</a></li>
              <li><a href="#" className="hover:text-fox-500 transition-colors">{t('footer.stores')}</a></li>
              <li><a href="#" className="hover:text-fox-500 transition-colors">{t('footer.careers')}</a></li>
              <li><a href="#" className="hover:text-fox-500 transition-colors">{t('footer.blog')}</a></li>
              <li><a href="#" className="hover:text-fox-500 transition-colors">{t('footer.csr')}</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">{t('footer.service')}</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-fox-500 transition-colors">{t('footer.account')}</a></li>
              <li><a href="#" className="hover:text-fox-500 transition-colors">{t('footer.track')}</a></li>
              <li><a href="#" className="hover:text-fox-500 transition-colors">{t('footer.returns')}</a></li>
              <li><a href="#" className="hover:text-fox-500 transition-colors">{t('footer.help')}</a></li>
              <li><a href="#" className="hover:text-fox-500 transition-colors">{t('footer.terms')}</a></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
             <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">{t('footer.contact')}</h4>
             <ul className="space-y-3 text-sm mb-6">
               <li className="flex items-start gap-3">
                 <MapPin className="w-5 h-5 text-fox-500 shrink-0" />
                 <span>12 Avenue de la Tech,<br/>75000 Paris, France</span>
               </li>
               <li className="flex items-center gap-3">
                 <Phone className="w-5 h-5 text-fox-500 shrink-0" />
                 <span>+33 1 23 45 67 89</span>
               </li>
               <li className="flex items-center gap-3">
                 <Mail className="w-5 h-5 text-fox-500 shrink-0" />
                 <span>support@izitobuy.com</span>
               </li>
             </ul>
             <div className="flex gap-4">
                <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-fox-600 transition-colors text-white">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-fox-600 transition-colors text-white">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-fox-600 transition-colors text-white">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-fox-600 transition-colors text-white">
                  <Youtube className="w-4 h-4" />
                </a>
             </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 mt-8 relative">
           <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              
              {/* Trust Badges */}
              <div className="flex items-center gap-6 text-xs font-medium text-slate-500">
                 <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-slate-400" /> {t('footer.fastDelivery')}
                 </div>
                 <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-slate-400" /> {t('footer.secure')}
                 </div>
                 <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-slate-400" /> {t('footer.installments')}
                 </div>
              </div>

              <p className="text-sm text-slate-500">
                &copy; {new Date().getFullYear()} izitobuy. {t('footer.rights')}
              </p>
           </div>
           
           {/* Back to Top */}
           <button 
             onClick={scrollToTop}
             className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-slate-800 hover:bg-fox-600 text-white p-2 rounded-full shadow-lg border border-slate-700 transition-colors group"
             title="Back to Top"
           >
             <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
           </button>
        </div>
      </div>
    </footer>
  );
};
