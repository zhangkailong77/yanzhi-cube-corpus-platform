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

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'search' | 'preview' | 'dashboard'>('home');
  const [searchParams, setSearchParams] = useState({ source: '', target: '' });
  const [selectedCorpusId, setSelectedCorpusId] = useState<number | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

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
              <SamplePreview corpusId={selectedCorpusId} onBack={handleBackFromPreview} />
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
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
