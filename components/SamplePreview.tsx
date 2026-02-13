import React, { useState } from 'react';
import { ArrowLeft, Code, LayoutList, Clock, Hash, Smartphone, Tag, MessageCircle, AlertCircle, Globe, ChevronDown, Search, Filter, Sparkles, ArrowRight, FileText, Zap } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface SamplePreviewProps {
  onBack: () => void;
}

// Interfaces based on the user's 4-layer structure
interface BasicLayer {
  sentence_id: string;
  timestamp: string;
  platform: string;
}

interface LanguageLayer {
  source_text_zh: string;
  raw_text_ms: string;
  normalized_text_ms: string;
  english_loanwords: string[];
}

interface PragmaticLayer {
  intent: string[];
  sentiment: 'neutral' | 'positive' | 'negative' | 'angry';
  business_scenario: 'pre-sales' | 'in-sales' | 'after-sales';
}

interface StyleLayer {
  style: string;
  contains_rojak: boolean;
  abbreviations_handled: Record<string, string>;
}

interface CorpusItem {
  basic_layer: BasicLayer;
  language_layer: LanguageLayer;
  pragmatic_layer: PragmaticLayer;
  style_layer: StyleLayer;
}

const SamplePreview: React.FC<SamplePreviewProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [showJson, setShowJson] = useState(false);
  
  // Mock state for the persistent search bar
  const [source, setSource] = useState('en');
  const [target, setTarget] = useState('ms');
  const [domain, setDomain] = useState('ecommerce');
  const [keyword, setKeyword] = useState('');

  const languages = [
    { code: 'zh', label: t('langChinese') },
    { code: 'en', label: t('langEnglish') },
    { code: 'th', label: t('langThai') },
    { code: 'vi', label: t('langVietnamese') },
    { code: 'ms', label: t('langMalay') },
  ];

  // Mock Data based on user's examples
  const data: CorpusItem[] = [
    {
      basic_layer: {
        sentence_id: "MY-CS-2024-1046",
        timestamp: "2024-11-16T10:20:05Z",
        platform: "Shopee"
      },
      language_layer: {
        source_text_zh: "老板，这个是正品吗？我今天下单的话什么时候能发货？",
        raw_text_ms: "Boss, brg ni ori ke? Kalo sy order harini bila blh pos?",
        normalized_text_ms: "Boss, barang ini original ke? Kalau saya order hari ini bila boleh pos?",
        english_loanwords: ["order"]
      },
      pragmatic_layer: {
        intent: ["询问真伪", "询问发货时间"],
        sentiment: "neutral",
        business_scenario: "pre-sales"
      },
      style_layer: {
        style: "Colloquial",
        contains_rojak: true,
        abbreviations_handled: {
          "brg": "barang",
          "ni": "ini",
          "kalo": "kalau",
          "sy": "saya",
          "harini": "hari ini",
          "blh": "boleh"
        }
      }
    },
    {
      basic_layer: {
        sentence_id: "MY-CS-2024-0892",
        timestamp: "2024-11-12T14:30:00Z",
        platform: "Shopee"
      },
      language_layer: {
        source_text_zh: "亲，这个还有现货吗？能便宜点吗？",
        raw_text_ms: "Hi sis, brg ni ready stock ke? Boleh murah sikit tak?",
        normalized_text_ms: "Hi kakak, barang ini ready stock ke? Boleh murah sedikit tak?",
        english_loanwords: ["ready stock"]
      },
      pragmatic_layer: {
        intent: ["询问库存", "砍价"],
        sentiment: "neutral",
        business_scenario: "in-sales"
      },
      style_layer: {
        style: "Colloquial",
        contains_rojak: true,
        abbreviations_handled: {
          "brg": "barang",
          "ni": "ini",
          "sikit": "sedikit"
        }
      }
    },
    {
      basic_layer: {
        sentence_id: "MY-CS-2024-1045",
        timestamp: "2024-11-15T09:15:22Z",
        platform: "TikTok"
      },
      language_layer: {
        source_text_zh: "我等了整整一个星期了，物流一直没更新，我要退款！",
        raw_text_ms: "Dah seminggu sy tunggu tracking x update pun! Nak refund skrg jgk!",
        normalized_text_ms: "Sudah seminggu saya tunggu tracking tak update pun! Nak refund sekarang juga!",
        english_loanwords: ["tracking", "update", "refund"]
      },
      pragmatic_layer: {
        intent: ["催发货", "退货退款"],
        sentiment: "angry",
        business_scenario: "after-sales"
      },
      style_layer: {
        style: "Colloquial",
        contains_rojak: true,
        abbreviations_handled: {
          "sy": "saya",
          "x": "tak",
          "skrg": "sekarang",
          "jgk": "juga"
        }
      }
    }
  ];

  // Filtering Logic
  const filteredData = data.filter(item => {
    const q = keyword.toLowerCase();
    if (!q) return true;
    return (
      item.language_layer.source_text_zh.toLowerCase().includes(q) ||
      item.language_layer.raw_text_ms.toLowerCase().includes(q) ||
      item.language_layer.normalized_text_ms.toLowerCase().includes(q) ||
      item.basic_layer.sentence_id.toLowerCase().includes(q)
    );
  });

  // Helper to get sentiment color
  const getSentimentStyle = (sentiment: string) => {
    switch(sentiment) {
      case 'angry': return 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-100';
      case 'positive': return 'bg-green-50 text-green-700 border-green-200 ring-1 ring-green-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-200 ring-1 ring-slate-100';
    }
  };

  // Helper for scenario badge (using translated labels)
  const getScenarioBadge = (scenario: string) => {
    switch(scenario) {
      case 'pre-sales': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">Pre-sales / {t('tabPresales')}</span>;
      case 'in-sales': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">In-sales / {t('tabInsales')}</span>;
      case 'after-sales': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-100">After-sales / {t('tabAftersales')}</span>;
      default: return null;
    }
  };

  const getSentimentLabel = (s: string) => {
      switch(s) {
          case 'neutral': return t('labelNeutral');
          case 'positive': return t('labelPositive');
          case 'negative': return t('labelNegative');
          case 'angry': return t('labelAngry');
          default: return s;
      }
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-20">
      
      {/* 1. Persistent Search Bar Section */}
      <div className="w-full bg-white border-b border-slate-100 py-6 px-6 md:px-12 sticky top-0 z-30 shadow-sm/50 backdrop-blur-md bg-white/95">
        <div className="max-w-3xl">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Select Source Language */}
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400 group-hover:text-primary-600">
                    <ChevronDown size={16} />
                </div>
                <select 
                    className="block w-full pl-4 pr-10 py-2.5 text-sm border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 rounded-lg bg-slate-50 hover:bg-white border transition-all appearance-none text-slate-700 font-mono shadow-sm"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                >
                  <option value="" disabled>{t('selectSource')}</option>
                  {languages.map(lang => (
                    <option key={`source-${lang.code}`} value={lang.code}>{lang.label}</option>
                  ))}
                </select>
              </div>

              {/* Select Target Language */}
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400 group-hover:text-primary-600">
                    <ChevronDown size={16} />
                </div>
                 <select 
                    className="block w-full pl-4 pr-10 py-2.5 text-sm border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 rounded-lg bg-slate-50 hover:bg-white border transition-all appearance-none text-slate-700 font-mono shadow-sm cursor-pointer"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                >
                  <option value="" disabled>{t('selectTarget')}</option>
                  {languages.map(lang => (
                    <option key={`target-${lang.code}`} value={lang.code}>{lang.label}</option>
                  ))}
                </select>
              </div>

               {/* Keyword Search Input */}
               <div className="relative flex-grow max-w-md">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                        <Search size={16} />
                    </div>
                    <input 
                        type="text" 
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder={t('labelKeyword')}
                        className="block w-full pl-10 pr-4 py-2.5 text-sm border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 rounded-lg bg-slate-50 hover:bg-white border transition-all text-slate-700 font-mono shadow-sm"
                    />
               </div>

              {/* Search Button */}
              <button 
                  className="p-2.5 border rounded-lg shadow-sm transition-all flex items-center justify-center min-w-[3rem] bg-primary-600 border-primary-600 text-white hover:bg-primary-700 hover:shadow-md cursor-pointer"
              >
                <Search size={18} />
              </button>
            </div>

            {/* Domain Selector Row */}
            <div className="mt-3">
                 <div className="relative group w-full">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                        <Filter size={16} />
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400 group-hover:text-primary-600">
                        <ChevronDown size={16} />
                    </div>
                    <select
                        className="block w-full pl-10 pr-10 py-2.5 text-sm border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 rounded-lg bg-slate-50 hover:bg-white border transition-all appearance-none text-slate-700 font-mono shadow-sm"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                    >
                        <option value="">{t('domainAll')}</option>
                        <option value="ecommerce">{t('domainEcommerce')}</option>
                        <option value="tourism">{t('domainTourism')}</option>
                        <option value="business">{t('domainBusiness')}</option>
                        <option value="economy">{t('domainEconomy')}</option>
                        <option value="general">{t('domainGeneral')}</option>
                    </select>
                 </div>
            </div>
        </div>
      </div>
      
      {/* 2. Corpus Header */}
      <div className="w-full bg-white border-b border-slate-200 shadow-sm z-20">
        <div className="w-full px-6 md:px-12 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBack}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors flex items-center group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 font-mono flex items-center">
                  E-ComLive v3.0 
                  <span className="ml-3 px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 border border-slate-200 font-normal uppercase tracking-wider">{t('samplePreview')}</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">Four-Dimensional Structured Annotation System (Quad-Layer)</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
             <div className="text-xs text-slate-400 font-mono hidden sm:block">
                {t('lblDisplaying').replace('{current}', filteredData.length.toString()).replace('{total}', '3,150,000')}
             </div>
             <div className="bg-slate-100 p-1 rounded-lg flex items-center border border-slate-200">
                <button 
                    onClick={() => setShowJson(false)}
                    className={`p-1.5 rounded-md transition-all flex items-center space-x-2 ${!showJson ? 'bg-white shadow-sm text-primary-600 font-medium' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <LayoutList size={16} />
                    <span className="text-xs hidden md:inline">{t('lblVisual')}</span>
                </button>
                <button 
                    onClick={() => setShowJson(true)}
                    className={`p-1.5 rounded-md transition-all flex items-center space-x-2 ${showJson ? 'bg-white shadow-sm text-primary-600 font-medium' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Code size={16} />
                     <span className="text-xs hidden md:inline">{t('lblJsonl')}</span>
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* 3. Main Content */}
      <div className="w-full px-6 md:px-12 py-8 space-y-8">
        
        {/* Intro Banner */}
        <div className="bg-gradient-to-r from-primary-700 to-indigo-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute -right-10 -top-10 opacity-10 transform rotate-12">
                <Hash size={200} />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-lg font-bold mb-2 flex items-center">
                        <Zap size={20} className="mr-2 text-yellow-300" /> Multi-Layer Annotation System
                    </h3>
                    <p className="text-primary-100 text-sm max-w-4xl leading-relaxed">
                        Each entry is enriched with <span className="font-semibold text-white bg-primary-600/50 px-1 rounded">{t('lblPragmatic')}</span>, <span className="font-semibold text-white bg-primary-600/50 px-1 rounded">{t('lblSentiment')}</span>, <span className="font-semibold text-white bg-primary-600/50 px-1 rounded">{t('lblStyle')}</span>, and detailed <span className="font-semibold text-white bg-primary-600/50 px-1 rounded">{t('lblLinguistic')}</span>.
                    </p>
                </div>
            </div>
        </div>

        {filteredData.map((item, index) => (
          <div key={item.basic_layer.sentence_id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
            
            {/* Card Header: Metadata Row */}
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
               <div className="flex items-center space-x-6 text-xs text-slate-500 font-mono">
                  <div className="flex items-center bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">
                     <span className="font-bold text-slate-700 mr-2">UUID:</span>
                     {item.basic_layer.sentence_id}
                  </div>
                  <div className="flex items-center hidden sm:flex">
                    <Clock size={12} className="mr-1.5 text-slate-400" />
                    {new Date(item.basic_layer.timestamp).toLocaleString()}
                  </div>
                  <div className="flex items-center hidden sm:flex">
                    <Smartphone size={12} className="mr-1.5 text-slate-400" />
                    {item.basic_layer.platform}
                  </div>
               </div>
               
               <div>
                  {getScenarioBadge(item.pragmatic_layer.business_scenario)}
               </div>
            </div>

            {showJson ? (
                // JSON VIEW
                <div className="p-0 bg-slate-900 overflow-x-auto">
                    <pre className="p-6 text-xs md:text-sm font-mono text-green-400 leading-relaxed">
                        {JSON.stringify(item, null, 2)}
                    </pre>
                </div>
            ) : (
                // VISUAL VIEW
                <div className="flex flex-col lg:flex-row">
                    
                    {/* Main Content: Language & Linguistics (Expanded Left Side) */}
                    <div className="flex-grow p-6 space-y-8 lg:border-r border-slate-100">
                        
                        {/* 1. Translation Pair */}
                        <div className="space-y-6">
                            {/* Source */}
                            <div>
                                <div className="flex items-center mb-2">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded mr-2">ZH-CN</span>
                                    <span className="text-xs font-medium text-slate-500">{t('lblSourceText')}</span>
                                </div>
                                <p className="text-xl text-slate-800 font-medium leading-relaxed p-4 rounded-lg bg-white border border-transparent hover:border-slate-100 transition-colors">
                                    {item.language_layer.source_text_zh}
                                </p>
                            </div>

                            {/* Divider with Label */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-slate-100"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-2 text-[10px] text-slate-300 font-mono uppercase tracking-widest">Translation & Normalization</span>
                                </div>
                            </div>

                            {/* Target Comparison Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Raw */}
                                <div className="flex flex-col h-full">
                                    <div className="flex items-center mb-2">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded mr-2">MS-RAW</span>
                                        <span className="text-xs font-medium text-slate-500">{t('lblRawInput')}</span>
                                    </div>
                                    <div className="flex-grow p-4 rounded-lg bg-slate-50 border border-slate-200 font-mono text-sm text-slate-600 leading-relaxed">
                                        {item.language_layer.raw_text_ms}
                                    </div>
                                </div>

                                {/* Normalized */}
                                <div className="flex flex-col h-full">
                                    <div className="flex items-center mb-2">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-primary-100 bg-primary-600 text-white px-1.5 py-0.5 rounded mr-2">MS-NORM</span>
                                        <span className="text-xs font-medium text-primary-600">{t('lblNormalized')}</span>
                                    </div>
                                    <div className="flex-grow p-4 rounded-lg bg-green-50/30 border border-green-100 text-base text-slate-800 leading-relaxed">
                                        {item.language_layer.normalized_text_ms}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Linguistic Insights (Moved to Bottom to fill space) */}
                        <div className="pt-2">
                             <div className="flex items-center space-x-3 mb-5">
                                <div className="h-px bg-slate-100 flex-grow"></div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                                    <Sparkles size={12} className="mr-1.5 text-amber-500" />
                                    {t('lblLinguistic')}
                                </span>
                                <div className="h-px bg-slate-100 flex-grow"></div>
                             </div>
                             
                             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {/* Normalization Map Box */}
                                {Object.keys(item.style_layer.abbreviations_handled).length > 0 ? (
                                     <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-100">
                                        <div className="text-[11px] font-bold text-slate-400 mb-3 flex items-center uppercase tracking-wider">
                                            <FileText size={12} className="mr-1.5"/> {t('lblNormMap')}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                             {Object.entries(item.style_layer.abbreviations_handled).map(([short, full]) => (
                                                <div key={short} className="flex items-center bg-white border border-slate-200 rounded-md px-2.5 py-1.5 shadow-sm hover:shadow-md transition-shadow cursor-default">
                                                    <span className="text-red-500 font-mono text-xs font-medium">{short}</span>
                                                    <ArrowRight size={10} className="mx-2 text-slate-300" />
                                                    <span className="text-green-600 font-mono text-xs font-bold">{full}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-100 flex items-center justify-center text-slate-400 text-xs italic">
                                        {t('lblNoNormNeeded')}
                                    </div>
                                )}

                                 {/* Loanwords & Style Box */}
                                 <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-100 flex flex-col justify-between">
                                    
                                    {/* Loanwords */}
                                    <div className="mb-4">
                                        <div className="text-[11px] font-bold text-slate-400 mb-3 flex items-center uppercase tracking-wider">
                                            <Globe size={12} className="mr-1.5"/> {t('lblLoanwords')}
                                        </div>
                                        {item.language_layer.english_loanwords.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {item.language_layer.english_loanwords.map(w => (
                                                    <span key={w} className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-md text-xs font-mono font-medium">
                                                        {w}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 text-xs italic">{t('lblNoneDetected')}</span>
                                        )}
                                    </div>

                                    {/* Small Style Indicators */}
                                    <div className="pt-4 border-t border-slate-200">
                                         <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">{t('lblStyle')}</span>
                                                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600 font-medium">
                                                    {item.style_layer.style}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">{t('lblRojak')}</span>
                                                <span className={`font-mono font-bold ${item.style_layer.contains_rojak ? 'text-blue-600' : 'text-slate-300'}`}>
                                                    {item.style_layer.contains_rojak ? t('lblDetected') : t('lblNone')}
                                                </span>
                                            </div>
                                         </div>
                                    </div>
                                </div>
                             </div>
                        </div>

                    </div>

                    {/* Right Sidebar: High Level Analysis (Narrower, cleaner) */}
                    <div className="w-full lg:w-72 bg-slate-50/30 p-6 flex-shrink-0 flex flex-col space-y-8">
                        
                        {/* Pragmatic Analysis */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center border-b border-slate-200 pb-2">
                                <MessageCircle size={12} className="mr-2" /> {t('lblPragmatic')}
                            </h4>
                            
                            <div className="space-y-6">
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase">{t('lblUserIntent')}</div>
                                    <div className="flex flex-wrap gap-2">
                                        {item.pragmatic_layer.intent.map(i => (
                                            <span key={i} className="px-3 py-1.5 rounded-lg text-sm bg-white border border-slate-200 text-slate-700 shadow-sm font-medium w-full text-center">
                                                {i}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase">{t('lblSentiment')}</div>
                                    <div className={`flex items-center justify-center px-4 py-3 rounded-lg border ${getSentimentStyle(item.pragmatic_layer.sentiment)}`}>
                                        {item.pragmatic_layer.sentiment === 'angry' && <AlertCircle size={16} className="mr-2" />}
                                        <span className="text-sm font-bold uppercase tracking-wide">{getSentimentLabel(item.pragmatic_layer.sentiment)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Extra Meta (Optional place for more tags) */}
                        <div className="flex-grow"></div>
                        
                        <div className="text-[10px] text-slate-300 font-mono text-center">
                            Analysis v3.0.1
                        </div>

                    </div>
                </div>
            )}
          </div>
        ))}
        
        {/* Pagination Dummy */}
        <div className="flex justify-center pt-8 pb-8">
             <div className="inline-flex rounded-md shadow-sm">
                <button className="px-5 py-2.5 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-l-lg hover:bg-slate-50 transition-colors">Previous</button>
                <button className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 border border-primary-600 hover:bg-primary-700 transition-colors">1</button>
                <button className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border-t border-b border-r border-slate-300 hover:bg-slate-50 transition-colors">2</button>
                <button className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border-t border-b border-r border-slate-300 hover:bg-slate-50 transition-colors">3</button>
                <button className="px-5 py-2.5 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-r-lg hover:bg-slate-50 transition-colors">Next</button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default SamplePreview;