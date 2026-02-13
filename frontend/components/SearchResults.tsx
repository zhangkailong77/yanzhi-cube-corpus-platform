import React, { useState, useEffect } from 'react';
import { Eye, Download, Link as LinkIcon, ArrowUpDown, ChevronDown, Search, Tag, Filter } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface SearchResultsProps {
  sourceLang: string;
  targetLang: string;
  onSearch: (source: string, target: string) => void;
  onPreview?: (id: number) => void;
}

interface ScenarioTag {
  label: string;
  type: 'ecommerce' | 'tourism' | 'business' | 'economy' | 'general';
}

const SearchResults: React.FC<SearchResultsProps> = ({ sourceLang, targetLang, onSearch, onPreview }) => {
  const { t } = useLanguage();
  
  // Local state for the dropdowns
  const [localSource, setLocalSource] = useState(sourceLang);
  const [localTarget, setLocalTarget] = useState(targetLang);
  const [selectedDomain, setSelectedDomain] = useState<string>('');

  // Sync local state if props change (though usually this component remounts on search)
  useEffect(() => {
    setLocalSource(sourceLang);
    setLocalTarget(targetLang);
  }, [sourceLang, targetLang]);

  const languages = [
    { code: 'zh', label: t('langChinese') },
    { code: 'en', label: t('langEnglish') },
    { code: 'th', label: t('langThai') },
    { code: 'vi', label: t('langVietnamese') },
    { code: 'ms', label: t('langMalay') },
  ];

  const handleSearchClick = () => {
    if (localSource && localTarget) {
      onSearch(localSource, localTarget);
    }
  };

  const getLangName = (code: string) => {
    switch (code) {
      case 'zh': return 'Chinese (cmn)';
      case 'en': return 'English (en)';
      case 'th': return 'Thai (th)';
      case 'vi': return 'Vietnamese (vi)';
      case 'ms': return 'Malay (ms)';
      default: return code;
    }
  };

  // Helper to get badge styles based on tag type
  const getTagStyle = (type: string) => {
    switch (type) {
      case 'ecommerce': // Blue for E-commerce (Sales, Logistics)
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'tourism': // Teal/Emerald for Tourism (Culture, Travel)
        return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'business': // Indigo/Purple for Business (RCEP, Analysis)
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'economy': // Amber/Orange for Low-altitude/Tech
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  // Mock data generator with Scenario Tags
  const generateMockData = () => {
    return [
      { 
        id: 1, 
        name: 'Tatoeba v2023-04-12', 
        sentences: '47,378', sTok: '48,303', tTok: '332,218',
        tags: [
          { label: '入境游便利化', type: 'tourism' },
          { label: '文化出海', type: 'tourism' }
        ] as ScenarioTag[]
      },
      { 
        id: 2, 
        name: 'OpenSubtitles v2018', 
        sentences: '1,204,500', sTok: '8,402,100', tTok: '9,120,440',
        tags: [
          { label: '跨境直播', type: 'business' },
          { label: '口语对话', type: 'general' }
        ] as ScenarioTag[]
      },
      { 
        id: 3, 
        name: 'GlobalVoices v2018q4', 
        sentences: '12,402', sTok: '250,110', tTok: '280,400',
        tags: [
          { label: '研学旅游', type: 'tourism' },
          { label: '新闻资讯', type: 'general' }
        ] as ScenarioTag[]
      },
      { 
        id: 4, 
        name: 'MultiCC v2.1', 
        sentences: '8,400,122', sTok: '95,400,200', tTok: '102,400,500',
        tags: [
          { label: '售前咨询', type: 'ecommerce' },
          { label: '商品参数', type: 'ecommerce' },
          { label: '库存查询', type: 'ecommerce' }
        ] as ScenarioTag[]
      },
      { 
        id: 9, 
        name: 'E-ComLive v3.0', 
        sentences: '3,150,000', sTok: '28,400,100', tTok: '30,100,500',
        tags: [
          { label: '售中跟单', type: 'ecommerce' },
          { label: '改价议价', type: 'ecommerce' }
        ] as ScenarioTag[]
      },
      { 
        id: 5, 
        name: 'TED2020 v1', 
        sentences: '5,200', sTok: '60,100', tTok: '65,200',
        tags: [
          { label: 'RCEP贸易规则', type: 'business' },
          { label: '专业术语', type: 'business' }
        ] as ScenarioTag[]
      },
      { 
        id: 6, 
        name: 'QED v2.0a', 
        sentences: '15,020', sTok: '180,400', tTok: '195,200',
        tags: [
          { label: '低空经济', type: 'economy' },
          { label: '无人机', type: 'economy' },
          { label: '农业林业', type: 'economy' }
        ] as ScenarioTag[]
      },
      { 
        id: 7, 
        name: 'KDE4 v2', 
        sentences: '8,900', sTok: '45,000', tTok: '48,000',
        tags: [
          { label: '跨境数据分析', type: 'business' },
          { label: '软件本地化', type: 'general' }
        ] as ScenarioTag[]
      },
      { 
        id: 8, 
        name: 'Ubuntu v14.10', 
        sentences: '4,500', sTok: '22,000', tTok: '24,000',
        tags: [
          { label: '售后维权', type: 'ecommerce' },
          { label: '退换货处理', type: 'ecommerce' }
        ] as ScenarioTag[]
      },
    ];
  };

  const results = generateMockData();

  const filteredResults = results.filter(item => {
    if (!selectedDomain) return true;
    return item.tags?.some(tag => tag.type === selectedDomain);
  });

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-20">
      
      {/* Search Bar Section */}
      <div className="w-full bg-white border-b border-slate-100 py-6 px-6 md:px-12">
        <div className="max-w-3xl">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Select Source Language */}
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400 group-hover:text-primary-600">
                    <ChevronDown size={16} />
                </div>
                <select 
                    className="block w-full pl-4 pr-10 py-2.5 text-sm border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 rounded-lg bg-slate-50 hover:bg-white border transition-all appearance-none text-slate-700 font-mono shadow-sm"
                    value={localSource}
                    onChange={(e) => {
                        setLocalSource(e.target.value);
                        if (e.target.value === localTarget) {
                           setLocalTarget(''); 
                        }
                    }}
                >
                  <option value="" disabled>{t('selectSource')}</option>
                  {languages.map(lang => (
                    <option key={`source-${lang.code}`} value={lang.code}>{lang.label}</option>
                  ))}
                </select>
              </div>

              {/* Select Target Language */}
              <div className="relative flex-1 group">
                <div className={`absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none ${!localSource ? 'text-slate-200' : 'text-slate-400 group-hover:text-primary-600'}`}>
                    <ChevronDown size={16} />
                </div>
                 <select 
                    className={`block w-full pl-4 pr-10 py-2.5 text-sm border rounded-lg appearance-none font-mono shadow-sm transition-all
                        ${!localSource 
                            ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed' 
                            : 'bg-slate-50 border-slate-200 hover:bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer'
                        }`}
                    disabled={!localSource}
                    value={localTarget}
                    onChange={(e) => setLocalTarget(e.target.value)}
                >
                  <option value="" disabled>
                      {!localSource ? t('pickSourceFirst') : t('selectTarget')}
                  </option>
                  {languages.map(lang => (
                    <option key={`target-${lang.code}`} value={lang.code}>{lang.label}</option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <button 
                  onClick={handleSearchClick}
                  className={`p-2.5 border rounded-lg shadow-sm transition-all flex items-center justify-center min-w-[3rem]
                  ${localSource && localTarget 
                    ? 'bg-primary-600 border-primary-600 text-white hover:bg-primary-700 hover:shadow-md cursor-pointer' 
                    : 'bg-white border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                  disabled={!localSource || !localTarget}
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
                        value={selectedDomain}
                        onChange={(e) => setSelectedDomain(e.target.value)}
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

      {/* Header Info */}
      <div className="w-full bg-white border-b border-slate-200 py-10 px-6 md:px-12">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 font-mono tracking-tight">
          {t('resourcesFound').replace('{count}', filteredResults.length.toString())}: <span className="text-primary-600">{getLangName(sourceLang)}</span> - <span className="text-primary-600">{getLangName(targetLang)}</span> ({filteredResults.length} found)
        </h2>
      </div>

      {/* Table Container */}
      <div className="w-full px-6 md:px-12 mt-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono items-center">
            <div className="col-span-3 lg:col-span-2 flex items-center cursor-pointer hover:text-slate-700">
              {t('headerCorpus')} 
            </div>
            <div className="col-span-2 lg:col-span-1 text-right flex items-center justify-end cursor-pointer hover:text-slate-700 group">
              {t('headerSentences')}
              <ArrowUpDown size={12} className="ml-1 opacity-0 group-hover:opacity-100" />
            </div>
            <div className="col-span-2 text-right hidden lg:block">
              {sourceLang.toUpperCase()} {t('headerTokens')}
            </div>
             <div className="col-span-2 text-right hidden lg:block">
              {targetLang.toUpperCase()} {t('headerTokens')}
            </div>
            <div className="col-span-2 lg:col-span-1 text-center">{t('headerSample')}</div>
            <div className="col-span-3 lg:col-span-2 text-center">{t('headerBilingual')}</div>
            <div className="col-span-2 text-center hidden xl:block">{t('headerMonolingual')}</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-100">
            {filteredResults.length > 0 ? filteredResults.map((item, idx) => (
              <div key={item.id} className={`grid grid-cols-12 gap-4 px-6 py-5 items-start hover:bg-blue-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                
                {/* Corpus Name & Tags */}
                <div className="col-span-3 lg:col-span-2 flex flex-col space-y-2">
                  <div className="font-mono text-sm font-semibold text-slate-800 break-words">
                    {item.name}
                  </div>
                  {/* Scenario Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags && item.tags.map((tag, tagIdx) => (
                      <span 
                        key={tagIdx} 
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${getTagStyle(tag.type)}`}
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sentences */}
                <div className="col-span-2 lg:col-span-1 text-right font-mono text-sm text-slate-600 mt-1">
                  {item.sentences}
                </div>

                {/* Source Tokens */}
                <div className="col-span-2 text-right font-mono text-sm text-slate-500 hidden lg:block mt-1">
                  {item.sTok}
                </div>

                {/* Target Tokens */}
                <div className="col-span-2 text-right font-mono text-sm text-slate-500 hidden lg:block mt-1">
                  {item.tTok}
                </div>

                {/* Sample */}
                <div className="col-span-2 lg:col-span-1 flex justify-center mt-1">
                   <button 
                     onClick={() => onPreview && onPreview(item.id)}
                     className="p-2 text-primary-500 hover:text-primary-700 hover:bg-primary-50 rounded-full transition-colors"
                     title="View Sample"
                   >
                     <Eye size={18} />
                   </button>
                </div>

                {/* Bilingual */}
                <div className="col-span-3 lg:col-span-2 flex items-center justify-center space-x-2 mt-1">
                   <div className="relative group/dropdown">
                      <button className="flex items-center px-3 py-1.5 border border-slate-200 rounded-md bg-white text-xs font-mono text-slate-600 hover:border-primary-300 focus:outline-none">
                         moses <ChevronDown size={12} className="ml-1" />
                      </button>
                      {/* Fake Dropdown content */}
                      <div className="absolute top-full left-0 w-32 bg-white border border-slate-200 shadow-lg rounded-md mt-1 hidden group-hover/dropdown:block z-10">
                          <div className="px-3 py-2 hover:bg-slate-50 text-xs font-mono cursor-pointer">tmx</div>
                          <div className="px-3 py-2 hover:bg-slate-50 text-xs font-mono cursor-pointer">xliff</div>
                      </div>
                   </div>
                   <button className="p-2 text-slate-400 hover:text-primary-600 transition-colors">
                     <Download size={18} />
                   </button>
                    <button className="p-2 text-slate-300 hover:text-primary-600 transition-colors">
                     <LinkIcon size={16} />
                   </button>
                </div>

                {/* Monolingual (Hidden on smaller screens, shown on XL) */}
                <div className="col-span-2 hidden xl:flex items-center justify-center space-x-2 mt-1">
                   <div className="relative group/dropdown">
                      <button className="flex items-center px-3 py-1.5 border border-slate-200 rounded-md bg-white text-xs font-mono text-slate-600 hover:border-primary-300 focus:outline-none">
                         txt {sourceLang} <ChevronDown size={12} className="ml-1" />
                      </button>
                   </div>
                   <button className="p-2 text-slate-400 hover:text-primary-600 transition-colors">
                     <Download size={18} />
                   </button>
                   <button className="p-2 text-slate-300 hover:text-primary-600 transition-colors">
                     <LinkIcon size={16} />
                   </button>
                </div>

              </div>
            )) : (
                <div className="px-6 py-12 text-center text-slate-400 font-mono text-sm">
                    No results found for this domain filter.
                </div>
            )}
          </div>

           {/* Footer of table */}
           <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-400 font-mono text-center">
              End of results
           </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;