import React from 'react';
import Logo from './ui/Logo';
import User from 'lucide-react/dist/esm/icons/user';
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Globe from 'lucide-react/dist/esm/icons/globe';
import { useLanguage } from './LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onLogoClick?: () => void;
  onDashboardClick?: () => void;
  onLoginClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogoClick, onDashboardClick, onLoginClick }) => {
  const { t, language, setLanguage } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

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
              <button
                onClick={() => setLanguage('zh')}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${language === 'zh' ? 'text-primary-600 font-bold' : 'text-slate-700'}`}
              >
                中文
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${language === 'en' ? 'text-primary-600 font-bold' : 'text-slate-700'}`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('th')}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${language === 'th' ? 'text-primary-600 font-bold' : 'text-slate-700'}`}
              >
                ไทย
              </button>
              <button
                onClick={() => setLanguage('vi')}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${language === 'vi' ? 'text-primary-600 font-bold' : 'text-slate-700'}`}
              >
                Tiếng Việt
              </button>
              <button
                onClick={() => setLanguage('ms')}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${language === 'ms' ? 'text-primary-600 font-bold' : 'text-slate-700'}`}
              >
                Melayu
              </button>
            </div>
          </div>

          {/* Theme Toggle (Simulated) */}
          <button className="text-amber-500 hover:bg-amber-50 p-2 rounded-full transition-colors hidden sm:block">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          </button>

          {/* Contribution Link */}
          {/* <a
            href="#"
            className="hidden lg:block text-sm font-medium text-slate-600 hover:text-slate-900 font-mono"
          >
            {t('contribute')}
          </a> */}

          {/* Publications Link */}
          {/* <a
            href="#"
            className="hidden lg:block text-sm font-medium text-slate-600 hover:text-slate-900 font-mono"
          >
            {t('publications')}
          </a> */}

          {/* Dashboard Button */}
          <button
            onClick={onDashboardClick}
            className="hidden md:block px-4 py-1.5 text-sm font-semibold rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {t('dashboard')}
          </button>

          {/* User Menu (Login/Profile/Logout) */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User size={18} />
                <span className="text-sm font-medium hidden md:inline">
                  {user?.username || 'User'}
                </span>
                <ChevronDown size={16} className="text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1">
                  {/* User Info */}
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="text-xs text-slate-500">Username</div>
                    <div className="text-sm font-medium text-slate-900">{user?.username}</div>
                  </div>
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="text-xs text-slate-500">Role</div>
                    <div className="text-sm font-medium">
                      {user?.role === 'admin' ? (
                        <span className="text-primary-600">超级管理员</span>
                      ) : (
                        <span className="text-slate-600">普通成员</span>
                      )}
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    <LogOut size={16} className="mr-2" />
                    登出
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center space-x-2 px-4 py-1.5 text-sm font-semibold rounded-full bg-primary-600 text-white hover:bg-primary-700 shadow-sm transition-colors shadow-primary-200"
            >
              <User size={18} />
              <span className="hidden md:inline">登录</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
