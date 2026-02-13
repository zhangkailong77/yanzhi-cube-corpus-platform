import React, { useState } from 'react';
import { 
  Database, 
  Layers, 
  Globe, 
  Activity, 
  AlertTriangle, 
  MapPin, 
  Download,
  ShoppingCart,
  MessageSquare,
  Zap,
  ArrowRight,
  Code,
  ArrowLeftRight,
  ChevronDown,
  Search,
  Filter,
  BarChart3,
  Globe2,
  Briefcase
} from 'lucide-react';
import { useLanguage } from './LanguageContext';

const Dashboard: React.FC = () => {
  const { t, language } = useLanguage();
  
  // View State (Replaces activeTab and selectedScenario)
  // Options: 'overview', 'language', 'consultation', 'transaction', 'support', 'operations', 'feedback'
  const [viewMode, setViewMode] = useState<string>('overview');
  
  // Filter States
  const [filterSource, setFilterSource] = useState('all');
  const [filterDomain, setFilterDomain] = useState('ecommerce');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Language Pair States
  const [sourceLang, setSourceLang] = useState('zh');
  const [targetLang, setTargetLang] = useState('ms');

  const languages = [
    { code: 'zh', label: t('langChinese') },
    { code: 'en', label: t('langEnglish') },
    { code: 'th', label: t('langThai') },
    { code: 'vi', label: t('langVietnamese') },
    { code: 'ms', label: t('langMalay') },
  ];

  const handleSwapLanguages = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
  };

  const isBusinessScenario = (mode: string) => {
    return ['consultation', 'transaction', 'support', 'operations', 'feedback'].includes(mode);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans text-slate-900">
      
      {/* 1. Unified Header & Control Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-sm">
        <div className="w-full max-w-[1800px] mx-auto px-4 md:px-8 py-6">
            
            {/* Top Row: Title & Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary-600 rounded-lg shadow-sm shadow-primary-200">
                        <Activity className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 font-mono tracking-tight leading-none">{t('dashTitle')}</h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1.5">{t('dashSubtitle')}</p>
                    </div>
                </div>

                {/* Meta & Export (Hidden on mobile) */}
                <div className="hidden xl:flex items-center gap-4 pl-4 border-l border-slate-100">
                    <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('dashLastUpdated')}</div>
                        <div className="text-xs font-mono font-bold text-slate-700">2024-11-17</div>
                    </div>
                    <button className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 shadow-sm transition-colors uppercase tracking-wide">
                        <Download size={14} className="mr-2" />
                        {t('dashExport')}
                    </button>
                </div>
            </div>

            {/* Bottom Row: The Unified Dropdown Control Bar */}
            <div className="flex flex-col xl:flex-row items-start xl:items-end gap-6 pt-5 border-t border-slate-100">
                
                {/* Section A: Dataset Filters & View Navigation */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full xl:w-auto flex-grow">
                    <FilterDropdown 
                        label={t('filterSource')} 
                        value={filterSource} 
                        onChange={setFilterSource}
                        icon={Database}
                        options={[
                            { value: 'all', label: t('filterSourceAll') },
                            { value: 'official', label: t('filterSourceOfficial') },
                            { value: 'community', label: t('filterSourceCommunity') },
                            { value: 'synthetic', label: t('filterSourceSynthetic') },
                        ]} 
                    />
                    <FilterDropdown 
                        label={t('filterDomain')} 
                        value={filterDomain} 
                        onChange={setFilterDomain}
                        icon={Layers}
                        options={[
                            { value: 'ecommerce', label: t('domainEcommerce') },
                            { value: 'tourism', label: t('domainTourism') },
                            { value: 'business', label: t('domainBusiness') },
                            { value: 'economy', label: t('domainEconomy') },
                            { value: 'general', label: t('domainGeneral') },
                        ]} 
                    />
                    
                    {/* Unified Classification / View Mode Dropdown */}
                    <FilterDropdown 
                        label={t('filterCategory')} 
                        value={viewMode} 
                        onChange={setViewMode}
                        icon={Briefcase}
                        options={[
                            { value: 'overview', label: t('dashViewOverview') },
                            { value: 'language', label: t('dashViewLanguage') },
                            // Separator Concept (not supported in simple select, just list them)
                            { value: 'consultation', label: t('tabPresales') },
                            { value: 'transaction', label: t('tabInsales') },
                            { value: 'support', label: t('tabAftersales') },
                            { value: 'operations', label: t('tabLogistics') },
                            { value: 'feedback', label: t('tabReviews') },
                        ]} 
                    />
                </div>

                {/* Divider */}
                <div className="hidden xl:block w-px h-10 bg-slate-200 mx-2 mb-1"></div>

                {/* Section B: Search & Language Pairs */}
                <div className="flex flex-wrap xl:flex-nowrap items-end gap-3 w-full xl:w-auto">
                    
                    {/* Search Input */}
                    <div className="w-full md:w-auto flex-grow xl:w-56">
                         <div className="flex flex-col">
                            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 flex items-center gap-1.5 tracking-wider">
                                <Search size={12} />
                                {t('labelKeyword')}
                            </label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t('searchPlaceholder')}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 hover:bg-white hover:border-slate-300 transition-all shadow-sm placeholder:font-normal"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 xl:flex-none xl:w-40">
                         <FilterDropdown 
                            label={t('labelSourceLang')} 
                            value={sourceLang} 
                            onChange={setSourceLang}
                            icon={Globe}
                            options={languages.map(l => ({ value: l.code, label: l.label }))}
                        />
                    </div>

                    <button 
                        onClick={handleSwapLanguages}
                        className="mb-1 p-2.5 rounded-lg border border-slate-200 text-slate-400 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-all"
                        title={t('btnSwap')}
                    >
                        <ArrowLeftRight size={18} />
                    </button>

                    <div className="flex-1 xl:flex-none xl:w-40">
                        <FilterDropdown 
                            label={t('labelTargetLang')} 
                            value={targetLang} 
                            onChange={setTargetLang}
                            icon={Globe2}
                            options={languages.map(l => ({ value: l.code, label: l.label }))}
                        />
                    </div>
                    
                    <button className="mb-1 ml-2 p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-sm shadow-primary-200 transition-all">
                        <Search size={18} />
                    </button>
                </div>

            </div>
        </div>
      </div>

      {/* 2. Main Content Area (Wide Layout) */}
      <div className="w-full max-w-[1800px] mx-auto px-4 md:px-8 py-8">
        
        {viewMode === 'overview' && <OverviewView t={t} />}
        {isBusinessScenario(viewMode) && <BusinessView t={t} selectedScenario={viewMode} />}
        {viewMode === 'language' && <LanguageView t={t} />}
        {/* Quality view is removed from navigation as requested */}

      </div>
    </div>
  );
};

// --- Sub-Views (No changes to content, just re-using) ---

const OverviewView = ({ t }: { t: any }) => {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title={t('kpiRefinedPairs')}
          value="10,024,500" 
          subValue="+12.5% this week"
          icon={<Database size={24} className="text-blue-600" />} 
          bg="bg-blue-50"
          border="border-blue-100"
        />
        <KpiCard 
          title={t('kpiAvgDim')}
          value="4.2" 
          subValue="Target: 4.0"
          icon={<Layers size={24} className="text-indigo-600" />} 
          bg="bg-indigo-50"
          border="border-indigo-100"
        />
        <KpiCard 
          title={t('kpiRojak')}
          value="68.4%" 
          subValue="High localization value"
          icon={<Globe size={24} className="text-amber-600" />} 
          bg="bg-amber-50"
          border="border-amber-100"
        />
         {/* Sentiment Ring Chart (Simulated) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden">
           <div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{t('chartSentiment')}</div>
              <div className="space-y-1">
                 <div className="flex items-center text-xs"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>{t('labelPositive')} 20%</div>
                 <div className="flex items-center text-xs"><span className="w-2 h-2 rounded-full bg-slate-400 mr-2"></span>{t('labelNeutral')} 65%</div>
                 <div className="flex items-center text-xs"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>{t('labelNegative')} 10%</div>
                 <div className="flex items-center text-xs"><span className="w-2 h-2 rounded-full bg-rose-700 mr-2"></span>{t('labelAngry')} 5%</div>
              </div>
           </div>
           <div className="w-20 h-20 relative">
              <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
                {/* Background Circle */}
                <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                {/* Positive */}
                <path className="text-emerald-500" strokeDasharray="20, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                {/* Neutral (Offset 20) */}
                <path className="text-slate-400" strokeDasharray="65, 100" strokeDashoffset="-20" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                {/* Negative (Offset 85) */}
                <path className="text-red-500" strokeDasharray="10, 100" strokeDashoffset="-85" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                {/* Angry (Offset 95) */}
                <path className="text-rose-700" strokeDasharray="5, 100" strokeDashoffset="-95" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
              </svg>
           </div>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t('chartTimeline')}</h3>
            <p className="text-sm text-slate-500">{t('chartTimelineSub')}</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
             <div className="flex items-center text-primary-600"><div className="w-3 h-3 bg-primary-600 rounded-sm mr-2"></div> New Pairs (Bar)</div>
             <div className="flex items-center text-slate-900"><div className="w-3 h-1 bg-slate-900 mr-2"></div> Total Cumulative (Line)</div>
          </div>
        </div>
        
        {/* Custom Dual Axis SVG Chart */}
        <div className="w-full h-80 relative">
           <svg viewBox="0 0 1000 300" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              {[0, 1, 2, 3, 4].map(i => (
                <line key={i} x1="0" y1={i * 75} x2="1000" y2={i * 75} stroke="#f1f5f9" strokeWidth="1" />
              ))}
              
              {/* Bars (New Pairs) */}
              {Array.from({ length: 50 }).map((_, i) => {
                 const x = i * 20 + 10;
                 let height = 20 + Math.random() * 40;
                 // Simulate spikes
                 if (i > 8 && i < 12) height += 60;
                 if (i > 28 && i < 33) height += 120;
                 
                 return (
                    <rect key={i} x={x} y={300 - height} width="12" height={height} fill="#dbeafe" rx="2" className="hover:fill-primary-300 transition-colors" />
                 );
              })}

              {/* Line (Cumulative) */}
              <polyline 
                 points="0,280 100,270 200,240 300,220 400,200 500,180 600,100 700,80 800,60 900,40 1000,20"
                 fill="none"
                 stroke="#0f172a"
                 strokeWidth="3"
                 strokeLinecap="round"
                 className="drop-shadow-md"
              />
           </svg>
        </div>
      </div>
    </div>
  );
};

const BusinessView = ({ t, selectedScenario }: { t: any, selectedScenario: string }) => {
  
  // Mapping of selected value to Display Label for header (handled by t() in practice, but mocking for display)
  const getLabel = (val: string) => {
     switch(val) {
         case 'consultation': return t('tabPresales');
         case 'transaction': return t('tabInsales');
         case 'support': return t('tabAftersales');
         case 'operations': return t('tabLogistics');
         case 'feedback': return t('tabReviews');
         default: return val;
     }
  };

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
         {/* 2. Top Intents (Bar Chart) - Generic Labels */}
         <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <Zap size={18} className="mr-2 text-yellow-500" />
              {t('chartIntentTop')}: {getLabel(selectedScenario)}
            </h3>
            <div className="space-y-4">
               {[
                 { label: 'Availability Inquiry', val: 450, w: '90%' },
                 { label: 'Credibility Check', val: 320, w: '70%' },
                 { label: 'Negotiation', val: 250, w: '55%' },
                 { label: 'Duration Inquiry', val: 180, w: '40%' },
                 { label: 'Specification Details', val: 120, w: '25%' },
               ].map((item, i) => (
                 <div key={i}>
                    <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                       <span>{item.label}</span>
                       <span>{item.val}k</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                       <div className="h-2 rounded-full bg-slate-800" style={{ width: item.w }}></div>
                    </div>
                 </div>
               ))}
            </div>
            <div className="mt-6 p-3 bg-slate-50 rounded text-xs text-slate-500 italic">
               Tip: High volume of "Availability Inquiry" detected. Ensure AI agents prioritize inventory API calls.
            </div>
         </div>

         {/* 3. Heatmap & Platform Comparison */}
         <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Heatmap */}
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{t('chartHeatmap')}</h3>
                  <span className="text-xs text-slate-400">Density Matrix</span>
                </div>
                <div className="grid grid-cols-4 gap-1 h-48">
                   {/* Generating a simulated 5x4 grid */}
                   {Array.from({ length: 20 }).map((_, i) => {
                      const opacity = Math.random();
                      return (
                        <div 
                          key={i} 
                          className="rounded-sm bg-primary-600 transition-opacity hover:ring-2 ring-primary-300" 
                          style={{ opacity: Math.max(0.1, opacity) }}
                          title={`Density: ${(opacity * 100).toFixed(0)}%`}
                        ></div>
                      )
                   })}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-mono">
                   <span>Consultation</span>
                   <span>Operations</span>
                </div>
             </div>

             {/* Channel Sentiment - Generic Labels */}
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">{t('chartPlatformSent')}</h3>
                <div className="space-y-6">
                   <div className="flex items-center">
                      <div className="w-24 font-bold text-orange-500 text-sm">Channel A (App)</div>
                      <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden flex">
                         <div className="bg-emerald-400 h-full" style={{ width: '60%' }}></div>
                         <div className="bg-rose-400 h-full" style={{ width: '10%' }}></div>
                      </div>
                      <div className="w-12 text-right text-xs font-mono">4.2</div>
                   </div>
                   <div className="flex items-center">
                      <div className="w-24 font-bold text-blue-600 text-sm">Channel B (Web)</div>
                      <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden flex">
                         <div className="bg-emerald-400 h-full" style={{ width: '55%' }}></div>
                         <div className="bg-rose-400 h-full" style={{ width: '15%' }}></div>
                      </div>
                      <div className="w-12 text-right text-xs font-mono">3.8</div>
                   </div>
                   <div className="flex items-center">
                      <div className="w-24 font-bold text-slate-900 text-sm">Channel C (Social)</div>
                      <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden flex">
                         <div className="bg-emerald-400 h-full" style={{ width: '40%' }}></div>
                         <div className="bg-rose-400 h-full" style={{ width: '35%' }}></div>
                      </div>
                      <div className="w-12 text-right text-xs font-mono text-red-500">2.5</div>
                   </div>
                </div>
                <div className="mt-4 text-xs text-slate-400">
                   <AlertTriangle size={12} className="inline mr-1 text-red-500" />
                   Channel C shows unusually high "Angry" sentiment in this scenario.
                </div>
             </div>
         </div>
      </div>

      {/* 4. Sample Viewer Table - Generic Data */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
         <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-2">
               <Search size={16} className="text-slate-400" />
               <span className="text-sm font-bold text-slate-700">Sample Viewer: {getLabel(selectedScenario)}</span>
            </div>
            <div className="flex gap-2">
               <span className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono text-slate-500">Channel A</span>
               <span className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono text-slate-500">Colloquial</span>
            </div>
         </div>
         <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 font-mono">
               <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Source (ZH)</th>
                  <th className="px-6 py-3">Raw (MS)</th>
                  <th className="px-6 py-3">Normalized (MS)</th>
                  <th className="px-6 py-3">Intent</th>
                  <th className="px-6 py-3 text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               <tr className="hover:bg-blue-50/30">
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">MY-CS-2024-1046</td>
                  <td className="px-6 py-4 font-medium">亲，这个还有现货吗？</td>
                  <td className="px-6 py-4 font-mono text-slate-600 bg-slate-50/50">brg ni ready stock ke?</td>
                  <td className="px-6 py-4 text-emerald-700">barang ini ready stock ke?</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-bold">Check Stock</span></td>
                  <td className="px-6 py-4 text-right"><button className="text-primary-600 hover:text-primary-800"><Code size={16}/></button></td>
               </tr>
               <tr className="hover:bg-blue-50/30">
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">MY-CS-2024-1048</td>
                  <td className="px-6 py-4 font-medium">真的假的？便宜这么多</td>
                  <td className="px-6 py-4 font-mono text-slate-600 bg-slate-50/50">Ori ke? Murah gila babi</td>
                  <td className="px-6 py-4 text-emerald-700">Original ke? Murah sangat</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-bold">Credibility</span></td>
                  <td className="px-6 py-4 text-right"><button className="text-primary-600 hover:text-primary-800"><Code size={16}/></button></td>
               </tr>
               <tr className="hover:bg-blue-50/30">
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">MY-CS-2024-1052</td>
                  <td className="px-6 py-4 font-medium">包邮吗老板？</td>
                  <td className="px-6 py-4 font-mono text-slate-600 bg-slate-50/50">Free shipping x boss?</td>
                  <td className="px-6 py-4 text-emerald-700">Free shipping tak boss?</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-bold">Cost Inquiry</span></td>
                  <td className="px-6 py-4 text-right"><button className="text-primary-600 hover:text-primary-800"><Code size={16}/></button></td>
               </tr>
            </tbody>
         </table>
      </div>
    </div>
  );
};

const LanguageView = ({ t }: { t: any }) => {
  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 1. Rojak Cloud */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center min-h-[300px]">
             <h3 className="w-full text-left text-lg font-bold text-slate-800 mb-4">{t('txtLoanwords')}</h3>
             <div className="flex flex-wrap justify-center gap-4 text-center items-center">
                <span className="text-4xl font-black text-blue-600 opacity-90">ready stock</span>
                <span className="text-2xl font-bold text-indigo-500 opacity-80">order</span>
                <span className="text-5xl font-black text-slate-800">original</span>
                <span className="text-lg font-semibold text-emerald-500">refund</span>
                <span className="text-3xl font-bold text-purple-600">boss</span>
                <span className="text-xl font-medium text-slate-400">tracking</span>
                <span className="text-2xl font-bold text-amber-500">promo</span>
                <span className="text-lg text-slate-500">voucher</span>
                <span className="text-xl font-bold text-rose-500">cancel</span>
                <span className="text-sm text-slate-400">size</span>
                <span className="text-3xl font-bold text-teal-600">payment</span>
             </div>
             <p className="mt-8 text-xs text-slate-400 text-center">Visual representation of English loanwords frequency in Malay e-commerce context.</p>
          </div>

          {/* 2. Normalization Map */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
             <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">{t('txtNormalization')}</h3>
                <span className="text-xs bg-white border border-slate-200 px-2 py-1 rounded">Top 500 Mapping</span>
             </div>
             <div className="overflow-y-auto flex-grow h-[260px]">
                <table className="w-full text-sm">
                   <thead className="text-xs text-slate-400 bg-white sticky top-0">
                      <tr>
                         <th className="px-6 py-2 text-left">Slang / Abbr</th>
                         <th className="px-6 py-2 text-center"></th>
                         <th className="px-6 py-2 text-left">Standard Malay</th>
                         <th className="px-6 py-2 text-right">Count</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {[
                        { s: 'brg', t: 'barang', c: 5420 },
                        { s: 'x', t: 'tak', c: 4890 },
                        { s: 'sy', t: 'saya', c: 3200 },
                        { s: 'ak', t: 'aku', c: 2800 },
                        { s: 'ni', t: 'ini', c: 2500 },
                        { s: 'skrg', t: 'sekarang', c: 2100 },
                        { s: 'kt', t: 'dekat', c: 1800 },
                        { s: 'yg', t: 'yang', c: 1650 },
                        { s: 'blh', t: 'boleh', c: 1400 },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                           <td className="px-6 py-3 font-mono text-red-500 font-medium">{row.s}</td>
                           <td className="px-6 py-3 text-center text-slate-300"><ArrowRight size={14}/></td>
                           <td className="px-6 py-3 font-mono text-emerald-600 font-bold">{row.t}</td>
                           <td className="px-6 py-3 text-right font-mono text-slate-400">{row.c}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>

       </div>

       {/* 3. Style Distribution */}
       <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{t('txtStyleDist')}</h3>
          <div className="space-y-4">
             {[
               { sc: 'Consultation', colloquial: 85, formal: 15 },
               { sc: 'Official Announcements', colloquial: 10, formal: 90 },
               { sc: 'Feedback', colloquial: 92, formal: 8 },
               { sc: 'Dispute Resolution', colloquial: 40, formal: 60 },
             ].map((item, i) => (
               <div key={i} className="flex items-center gap-4">
                  <div className="w-40 text-sm font-medium text-slate-700">{item.sc}</div>
                  <div className="flex-1 h-8 bg-slate-100 rounded-md overflow-hidden flex text-[10px] font-bold text-white uppercase tracking-wider items-center">
                     <div className="h-full bg-indigo-500 flex items-center justify-center" style={{ width: `${item.colloquial}%` }}>
                        Colloquial {item.colloquial}%
                     </div>
                     <div className="h-full bg-slate-400 flex items-center justify-center" style={{ width: `${item.formal}%` }}>
                        Formal {item.formal}%
                     </div>
                  </div>
               </div>
             ))}
          </div>
       </div>
    </div>
  );
};

const QualityView = ({ t }: { t: any }) => {
  return (
    <div className="space-y-6">
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Anomaly Alert */}
          <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex flex-col justify-between">
             <div>
                <div className="flex items-center gap-2 mb-2 text-red-700 font-bold">
                   <AlertTriangle size={20} />
                   <span>{t('txtAnomalyAlert')}</span>
                </div>
                <p className="text-sm text-red-600 mb-4">
                   {t('txtAnomalyDesc')}
                </p>
             </div>
             <div className="w-full bg-white/50 h-32 rounded border border-red-100 relative p-2 flex items-end gap-1">
                 {/* Fake Sparkline */}
                 {[20, 22, 18, 25, 20, 22, 85, 90, 88, 80].map((h, i) => (
                    <div key={i} style={{ height: `${h}%` }} className={`flex-1 rounded-sm ${h > 50 ? 'bg-red-500' : 'bg-red-200'}`}></div>
                 ))}
             </div>
             <button className="mt-4 w-full py-2 bg-red-600 text-white rounded font-bold text-sm hover:bg-red-700 transition-colors">{t('txtInvestigate')}</button>
          </div>

          {/* Version Tracking */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-6">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800">Data Cleaning Version History</h3>
                <span className="text-xs text-slate-400 font-mono">ID: MY-CS-CORE</span>
             </div>
             <div className="space-y-6 relative">
                {/* Timeline Line */}
                <div className="absolute left-2.5 top-2 bottom-2 w-[1px] bg-slate-200"></div>

                {[
                  { v: 'v3.1.0', date: 'Today', status: 'Processing', cleanRate: '98.5%', change: 'Updated Slang Dictionary' },
                  { v: 'v3.0.5', date: '2 days ago', status: 'Stable', cleanRate: '98.2%', change: 'Fixed Emoji Encoding' },
                  { v: 'v3.0.0', date: '1 week ago', status: 'Stable', cleanRate: '97.0%', change: 'Initial Quad-Layer Release' },
                ].map((ver, i) => (
                   <div key={i} className="flex gap-4 relative">
                      <div className={`w-5 h-5 rounded-full border-4 border-white shadow-sm z-10 flex-shrink-0 ${i === 0 ? 'bg-primary-600 animate-pulse' : 'bg-slate-300'}`}></div>
                      <div className="flex-1 bg-slate-50 rounded-lg p-3 border border-slate-100 flex justify-between items-center">
                         <div>
                            <div className="flex items-center gap-2">
                               <span className="font-bold text-sm text-slate-800">{ver.v}</span>
                               <span className="text-xs text-slate-400">{ver.date}</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">{ver.change}</div>
                         </div>
                         <div className="text-right">
                            <div className="text-xs font-bold text-emerald-600">{ver.cleanRate} Clean</div>
                            <div className="text-[10px] uppercase text-slate-400 font-bold">{ver.status}</div>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
       </div>

       {/* Map Placeholder */}
       <div className="bg-slate-900 rounded-xl p-8 text-center text-slate-400 h-64 flex flex-col items-center justify-center border border-slate-800 relative overflow-hidden group">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-slate-900"></div>
          <MapPin size={48} className="mb-4 text-slate-600 group-hover:text-primary-500 transition-colors" />
          <h3 className="text-xl font-bold text-slate-200 mb-2 relative z-10">Geospatial Distribution Source</h3>
          <p className="max-w-md mx-auto text-sm relative z-10">Visualizing IP sources from Kuala Lumpur, Selangor, and Johor Bahru to ensure representativeness of Peninsular Malaysia.</p>
       </div>
    </div>
  );
};

// --- Helper Components ---

const FilterDropdown = ({ label, value, onChange, options, icon: Icon }: { label: string, value: string, onChange: (v: string) => void, options: {value: string, label: string}[], icon?: React.ElementType }) => {
    return (
        <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 flex items-center gap-1.5 tracking-wider">
                {Icon && <Icon size={12} />}
                {label}
            </label>
            <div className="relative group">
                <select 
                    value={value} 
                    onChange={e => onChange(e.target.value)}
                    className="appearance-none w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-lg pl-3 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 hover:bg-white hover:border-slate-300 transition-all cursor-pointer shadow-sm"
                >
                    {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600 pointer-events-none" />
            </div>
        </div>
    );
};

const KpiCard = ({ title, value, subValue, icon, bg, border }: any) => (
  <div className={`p-6 rounded-xl border ${bg} ${border} shadow-sm transition-transform hover:-translate-y-1`}>
    <div className="flex justify-between items-start mb-4">
       <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
    </div>
    <div className="text-3xl font-black text-slate-900 font-mono tracking-tighter">{value}</div>
    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1 mb-2">{title}</div>
    <div className="text-xs font-medium text-slate-600 bg-white/50 inline-block px-2 py-1 rounded">
       {subValue}
    </div>
  </div>
);

export default Dashboard;