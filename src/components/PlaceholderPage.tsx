import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  subtitle?: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, subtitle = "Module Under Development" }) => {
  return (
    <div className="flex flex-col h-full bg-white font-sans animate-in fade-in duration-500">
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-soft animate-pulse">
          <Construction size={48} className="text-[#B8AB89]" />
        </div>
        <h1 className="text-3xl font-bold text-[#3F4859] mb-2">{title}</h1>
        <p className="text-[#879DB5] uppercase tracking-widest text-xs font-bold mb-8">{subtitle}</p>
        
        <div className="max-w-md bg-[#F2F0EB] p-6 rounded-xl border border-[#B8AB89]/20">
          <p className="text-sm text-[#3F4859] leading-relaxed">
            This module is currently being developed as part of the HR MASTER system. 
            Please check back later for updates.
          </p>
        </div>
        
        <button 
          onClick={() => window.history.back()}
          className="mt-8 flex items-center gap-2 text-[#5A94A7] hover:text-[#3F4859] transition-colors text-sm font-bold uppercase tracking-wide"
        >
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    </div>
  );
};

export default PlaceholderPage;
