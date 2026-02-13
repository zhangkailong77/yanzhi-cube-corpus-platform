import React from 'react';
import { useLanguage } from './LanguageContext';

const Contributors: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="w-full bg-white py-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-xl font-bold text-slate-500 uppercase tracking-[0.2em] font-mono mb-16 pl-2">
          {t('contributors')}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 items-center justify-items-center opacity-80 grayscale hover:grayscale-0 transition-all duration-500">
            
            {/* NLPL Placeholder */}
            <div className="flex flex-col items-center group cursor-pointer">
                <div className="h-16 w-16 bg-gradient-to-t from-orange-400 to-red-500 rounded-full mb-2 group-hover:scale-110 transition-transform"></div>
                <span className="font-serif font-bold text-2xl text-slate-800">NLPL</span>
                <span className="text-[0.5rem] text-slate-400 uppercase text-center mt-1">Nordic Language<br/>Processing Laboratory</span>
            </div>

            {/* Helsinki Placeholder */}
            <div className="flex flex-col items-center group cursor-pointer">
                <div className="relative h-16 w-16 mb-2 group-hover:rotate-12 transition-transform">
                   <div className="absolute inset-0 bg-slate-900 rotate-45 rounded-sm"></div>
                   <div className="absolute inset-2 bg-white rounded-sm flex items-center justify-center">
                        <div className="w-4 h-4 bg-slate-900 rounded-full"></div>
                   </div>
                </div>
                <span className="font-bold text-xs uppercase text-slate-800 mt-2">Helsingin Yliopisto</span>
            </div>

            {/* CSC Placeholder */}
            <div className="flex flex-col items-center group cursor-pointer">
                <div className="h-12 w-24 border-b-2 border-red-800 relative mb-2">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-teal-600"></div>
                </div>
                <span className="font-mono font-bold text-lg text-slate-700 tracking-widest">CSC</span>
            </div>

            {/* HPLT Placeholder */}
            <div className="flex items-center justify-center group cursor-pointer">
                <div className="h-20 w-20 rounded-full border-2 border-slate-800 flex items-center justify-center relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-[1px] bg-slate-800"></div>
                        <div className="h-full w-[1px] bg-slate-800 absolute"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-1 z-10 bg-transparent">
                        <span className="text-xl font-serif text-red-800 p-1">H</span>
                        <span className="text-xl font-serif text-slate-800 p-1">P</span>
                        <span className="text-xl font-serif text-red-800 p-1">L</span>
                        <span className="text-xl font-serif text-slate-800 p-1">T</span>
                    </div>
                </div>
            </div>

             {/* Lets MT Placeholder */}
             <div className="flex flex-col items-center group cursor-pointer">
                <div className="border-2 border-blue-500 p-1">
                    <div className="bg-blue-500 text-white font-sans font-bold text-xl px-3 py-1 italic">
                        Let's <span className="bg-white text-blue-500 px-1 not-italic">MT!</span>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Contributors;