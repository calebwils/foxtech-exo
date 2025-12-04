import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-64 text-fox-600">
      <Loader2 className="w-10 h-10 animate-spin mb-4" />
      <p className="text-slate-500 font-medium">Loading Izitobuy Catalog...</p>
    </div>
  );
};