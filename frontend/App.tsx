import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StatsOverview from './components/StatsOverview';
// import Contributors from './components/Contributors';
import SearchResults from './components/SearchResults';
import SamplePreview from './components/SamplePreview';
import Dashboard from './components/Dashboard';
import { LanguageProvider } from './components/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { LoginModal } from './components/auth/LoginModal';
import { AlertCircle, X } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'search' | 'preview' | 'dashboard'>('home');
  const [searchParams, setSearchParams] = useState({ source: '', target: '' });
  const [selectedCorpusId, setSelectedCorpusId] = useState<number | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleSearch = (source: string, target: string) => {
    setSearchParams({ source, target });
    setView('search');
    window.scrollTo(0, 0);
  };

  const handleGoHome = () => {
    setView('home');
    setSearchParams({ source: '', target: '' });
    window.scrollTo(0, 0);
  };

  const handlePreview = (id: number) => {
    setSelectedCorpusId(id);
    setView('preview');
    window.scrollTo(0, 0);
  };

  const handleBackFromPreview = () => {
    setView('search');
    window.scrollTo(0, 0);
  };

  const handleDashboard = () => {
    setView('dashboard');
    window.scrollTo(0, 0);
  };

  const handleLoginClick = () => {
    setLoginModalOpen(true);
  };

  const handleLoginClose = () => {
    setLoginModalOpen(false);
  };

  const handleLoginSuccess = () => {
    setLoginModalOpen(false);
  };

  return (
    <AuthProvider>
      <LanguageProvider>
        <div className={`min-h-screen flex flex-col bg-white transition-all duration-300 ${loginModalOpen ? 'blur-sm' : ''}`}>
          <Navbar onLogoClick={handleGoHome} onDashboardClick={handleDashboard} onLoginClick={handleLoginClick} />

          <main className="flex-grow">
            {view === 'home' && (
              <>
                <Hero onSearch={handleSearch} onLoginClick={handleLoginClick} />
                <StatsOverview />
                {/* <Contributors /> */}
              </>
            )}

            {view === 'search' && (
              <SearchResults
                sourceLang={searchParams.source}
                targetLang={searchParams.target}
                onSearch={handleSearch}
                onPreview={handlePreview}
              />
            )}

            {view === 'preview' && (
              <SamplePreview
                corpusId={selectedCorpusId}
                onBack={handleBackFromPreview}
                onError={(error) => {
                  setAlertMessage(error);
                  setView('search');
                }}
              />
            )}

            {view === 'dashboard' && (
              <Dashboard />
            )}
          </main>

          {/* Simple Footer to close of page visually */}
          <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-100 mt-auto bg-white">
            <p>&copy; {new Date().getFullYear()} 颜值立方 Yanzhi Cube. All rights reserved.</p>
          </footer>
        </div>

        {/* 登录模态框 */}
        <LoginModal
          isOpen={loginModalOpen}
          onClose={handleLoginClose}
          onSuccess={handleLoginSuccess}
        />

        {/* 错误提示弹窗 - 现代黑白色风格 */}
        {alertMessage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="alert"
            aria-modal="true"
            aria-labelledby="error-title"
          >
            {/* 背景遮罩 */}
            <div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
              onClick={() => setAlertMessage(null)}
            />

            {/* 弹窗主体 - 黑白极简风格 */}
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-scale-in">
              {/* 关闭按钮 */}
              <button
                onClick={() => setAlertMessage(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-200 cursor-pointer"
                aria-label="关闭"
              >
                <X size={18} />
              </button>

              {/* 内容区域 */}
              <div className="p-8">
                {/* 图标容器 */}
                <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center">
                    <AlertCircle className="text-white dark:text-slate-900" size={22} strokeWidth={2.5} />
                  </div>
                </div>

                {/* 标题 */}
                <h3
                  id="error-title"
                  className="text-xl font-bold text-slate-900 dark:text-white text-center mb-3"
                >
                  无权访问
                </h3>

                {/* 错误消息 */}
                <p className="text-slate-500 dark:text-slate-400 text-center text-sm leading-relaxed mb-6">
                  {alertMessage}
                </p>

                {/* 操作按钮 */}
                <button
                  onClick={() => setAlertMessage(null)}
                  className="w-full px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all duration-200 cursor-pointer"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        )}
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
