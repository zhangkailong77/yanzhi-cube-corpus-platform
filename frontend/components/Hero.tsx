import React, { useState } from 'react';
import Logo from './ui/Logo';
import { Search, ChevronDown } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Hero: React.FC = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [category, setCategory] = useState('');

  const categories = [
    { code: 'terminology', label: t('catTerminology') },
    { code: 'qa', label: t('catQA') },
    { code: 'alignment', label: t('catAlignment') },
    { code: 'process', label: t('catProcess') },
    { code: 'case', label: t('catCase') },
    { code: 'struction', label: t('catInstruction') },
  ];

  const handleSearchClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (category) {
      navigate(`/search?domain=${category}`);
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

              {/* Select Category */}
              <div className="relative flex-grow group">
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400 group-hover:text-primary-600">
                  <ChevronDown size={18} />
                </div>
                <select
                  className="block w-full pl-5 pr-12 py-4 text-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 rounded-xl bg-slate-50 hover:bg-white border transition-all appearance-none text-slate-700 font-mono shadow-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="" disabled>请选择语料库分类...</option>
                  {categories.map(cat => (
                    <option key={cat.code} value={cat.code}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearchClick}
                className={`px-8 py-4 border rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 font-bold
                    ${category
                    ? 'bg-primary-600 border-primary-600 text-white hover:bg-primary-700 hover:shadow-md cursor-pointer'
                    : 'bg-white border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                disabled={!category}
              >
                <Search size={22} />
                <span>立即探索</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Hero;