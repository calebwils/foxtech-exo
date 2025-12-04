
import React from 'react';
import { MapPin, Navigation, User, Home, Store } from 'lucide-react';
import { GeoCoordinate } from '../types';

interface TrackingMapProps {
  pickup: GeoCoordinate;
  delivery: GeoCoordinate;
  courierPos?: { lat: number, lng: number };
  status: string;
}

export const TrackingMap: React.FC<TrackingMapProps> = ({ pickup, delivery, courierPos, status }) => {
  // This is a Simulated Map Visualization using CSS/SVG since we can't use real Maps API
  
  // Calculate percentages for simple 2D projection on a static box
  // We assume a normalized grid for the demo
  const getPosStyle = (lat: number, lng: number) => {
      // Use arbitrary offsets to place dots nicely in the box based on relative coords
      // In a real app, use Leaflet or Google Maps
      return {
          left: '50%', 
          top: '50%'
      };
  };

  return (
    <div className="bg-slate-100 rounded-xl overflow-hidden h-64 relative border border-slate-200 shadow-inner group">
       {/* Background Grid (Map Texture) */}
       <div className="absolute inset-0 opacity-10" 
            style={{ 
                backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
                backgroundSize: '20px 20px' 
            }}>
       </div>
       
       {/* Streets (Decor) */}
       <div className="absolute top-1/2 left-0 w-full h-2 bg-white/50 -translate-y-1/2"></div>
       <div className="absolute left-1/2 top-0 h-full w-2 bg-white/50 -translate-x-1/2"></div>

       {/* Route Line (SVG) */}
       <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line x1="25%" y1="50%" x2="75%" y2="50%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
       </svg>

       {/* Pickup Point (Left) */}
       <div className="absolute top-1/2 left-[25%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
          <div className="w-8 h-8 bg-white rounded-full border-2 border-blue-500 flex items-center justify-center shadow-md">
             <Store className="w-4 h-4 text-blue-600" />
          </div>
          <span className="mt-1 text-[10px] font-bold bg-white px-1 rounded shadow text-slate-600">Store</span>
       </div>

       {/* Delivery Point (Right) */}
       <div className="absolute top-1/2 left-[75%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
          <div className="w-8 h-8 bg-white rounded-full border-2 border-fox-600 flex items-center justify-center shadow-md">
             <Home className="w-4 h-4 text-fox-600" />
          </div>
          <span className="mt-1 text-[10px] font-bold bg-white px-1 rounded shadow text-slate-600">Home</span>
       </div>

       {/* Courier (Moving) */}
       <div 
         className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 transition-all duration-1000 ease-linear"
         style={{ 
            left: status === 'picked_up' ? '50%' : status === 'courier_assigned' ? '30%' : status === 'delivered' ? '75%' : '25%'
         }}
       >
          <div className="w-10 h-10 bg-slate-900 rounded-full border-2 border-white flex items-center justify-center shadow-xl relative">
             <Navigation className="w-5 h-5 text-white" />
             <div className="absolute inset-0 rounded-full bg-slate-900 animate-ping opacity-20"></div>
          </div>
          <div className="mt-2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">
             Your Order
          </div>
       </div>
       
       {/* Live Indicator */}
       <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md shadow-sm border border-slate-200 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs font-bold text-slate-700">LIVE GPS</span>
       </div>
    </div>
  );
};
