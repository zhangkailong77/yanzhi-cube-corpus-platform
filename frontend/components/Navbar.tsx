import React from 'react';
import Logo from './ui/Logo';
import { Sun, Globe } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface NavbarProps {
    onLogoClick?: () => void;
    onDashboardClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogoClick, onDashboardClick }) => {
  const { t, language, setLanguage } = useLanguage();

  return (
    <nav className="w-full border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-sm z-50">
      <div className="w-full px-6 md:px-12 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex-shrink-0 cursor-pointer" onClick={onLogoClick}>
          <Logo size="small" />
        </div>

        {/* Right: Nav Items */}
        <div className="flex items-center space-x-4 md:space-x-6">
            
            {/* Language Switcher */}
            <div className="relative group">
              <button className="flex items-center text-slate-500 hover:text-slate-900 transition-colors p-2">
                <Globe size={18} className="mr-1" />
                <span className="text-sm font-medium uppercase">{language}</span>
              </button>
              <div className="absolute right-0 mt-0 w-32 bg-white rounded-lg shadow-lg border border-slate-100 py-1 hidden group-hover:block transition-all">
                <button onClick={() => setLanguage('zh')} className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${language === 'zh' ? 'text-primary-600 font-bold' : 'text-slate-700'}`}>中文</button>
                <button onClick={() => setLanguage('en')} className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${language === 'en' ? 'text-primary-600 font-bold' : 'text-slate-700'}`}>English</button>
                <button onClick={() => setLanguage('th')} className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${language === 'th' ? 'text-primary-600 font-bold' : 'text-slate-700'}`}>ไทย</button>
                <button onClick={() => setLanguage('vi')} className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${language === 'vi' ? 'text-primary-600 font-bold' : 'text-slate-700'}`}>Tiếng Việt</button>
                <button onClick={() => setLanguage('ms')} className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${language === 'ms' ? 'text-primary-600 font-bold' : 'text-slate-700'}`}>Melayu</button>
              </div>
            </div>

            {/* Theme Toggle (Simulated) */}
            <button className="text-amber-500 hover:bg-amber-50 p-2 rounded-full transition-colors hidden sm:block">
                <Sun size={20} fill="currentColor" className="opacity-80"/>
            </button>

            <a href="#" className="hidden lg:block text-sm font-medium text-slate-600 hover:text-slate-900 font-mono">
                {t('contribute')}
            </a>
            <a href="#" className="hidden lg:block text-sm font-medium text-slate-600 hover:text-slate-900 font-mono">
                {t('publications')}
            </a>

            <div className="flex items-center space-x-2">
                <button className="hidden md:block px-4 py-1.5 text-sm font-semibold rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
                    {t('corpora')}
                </button>
                <button className="hidden md:block px-4 py-1.5 text-sm font-semibold rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
                    {t('synthetic')}
                </button>
                <button 
                  onClick={onDashboardClick}
                  className="px-4 py-1.5 text-sm font-semibold rounded-full bg-primary-600 text-white hover:bg-primary-700 shadow-md transition-colors shadow-primary-200"
                >
                    {t('dashboard')}
                </button>
            </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;