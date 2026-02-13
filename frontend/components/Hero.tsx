import React, { useState } from 'react';
import Logo from './ui/Logo';
import { Search, ChevronDown } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface HeroProps {
  onSearch: (source: string, target: string) => void;
  onLoginClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onSearch, onLoginClick }) => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [sourceLang, setSourceLang] = useState('');
  const [targetLang, setTargetLang] = useState('');

  const languages = [
    { code: 'zh', label: t('langChinese') },
    { code: 'en', label: t('langEnglish') },
    { code: 'th', label: t('langThai') },
    { code: 'vi', label: t('langVietnamese') },
    { code: 'ms', label: t('langMalay') },
  ];

  const handleSearchClick = () => {
    if (!isAuthenticated) {
      onLoginClick();
      return;
    }
    if (sourceLang && targetLang) {
      onSearch(sourceLang, targetLang);
    }
  };

  return (
    <div className="w-full bg-white py-16 border-b border-slate-100">
      <div className="w-full px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-8 md:space-y-0 md:space-x-12">
          
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Logo size="large" />
          </div>

          {/* Search/Actions Section */}
          <div className="flex-grow w-full max-w-3xl pt-2">
            <h1 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight font-mono">
              {t('findCorpora')}
            </h1>

            <div className="flex flex-col sm:flex-row gap-3">
              
              {/* Select Source Language */}
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400 group-hover:text-primary-600">
                    <ChevronDown size={16} />
                </div>
                <select 
                    className="block w-full pl-4 pr-10 py-3 text-base border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 rounded-lg bg-slate-50 hover:bg-white border transition-all appearance-none text-slate-700 font-mono shadow-sm"
                    value={sourceLang}
                    onChange={(e) => {
                        setSourceLang(e.target.value);
                        if (e.target.value === targetLang) {
                           setTargetLang(''); 
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
                <div className={`absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none ${!sourceLang ? 'text-slate-200' : 'text-slate-400 group-hover:text-primary-600'}`}>
                    <ChevronDown size={16} />
                </div>
                 <select 
                    className={`block w-full pl-4 pr-10 py-3 text-base border rounded-lg appearance-none font-mono shadow-sm transition-all
                        ${!sourceLang 
                            ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed' 
                            : 'bg-slate-50 border-slate-200 hover:bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer'
                        }`}
                    disabled={!sourceLang}
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                >
                  <option value="" disabled>
                      {!sourceLang ? t('pickSourceFirst') : t('selectTarget')}
                  </option>
                  {languages.map(lang => (
                    <option key={`target-${lang.code}`} value={lang.code}>{lang.label}</option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <button
                  onClick={handleSearchClick}
                  className={`p-3 border rounded-lg shadow-sm transition-all flex items-center justify-center
                    ${sourceLang && targetLang
                      ? 'bg-primary-600 border-primary-600 text-white hover:bg-primary-700 hover:shadow-md cursor-pointer'
                      : 'bg-white border-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  disabled={!sourceLang || !targetLang}
              >
                <Search size={20} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Hero;