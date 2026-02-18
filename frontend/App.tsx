import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import AppRoutes from './router';
import { LanguageProvider } from './components/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { AlertCircle, X } from 'lucide-react';
import { LoginModal } from './components/auth/LoginModal';

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const isLoginRoute = location.pathname === '/login';
  const fromPath = (location.state as any)?.from || '/';

  const handleLoginClose = () => {
    navigate(fromPath);
  };

  const handleLoginSuccess = () => {
    navigate(fromPath);
  };

  return (
    <AuthProvider>
      <LanguageProvider>
        <div className={`min-h-screen flex flex-col bg-white transition-all duration-300 ${isLoginRoute ? 'blur-sm' : ''}`}>
          <Navbar />

          <main className="flex-grow">
            <AppRoutes />
          </main>

          <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-100 mt-auto bg-white">
            <p>&copy; {new Date().getFullYear()} 颜值立方 Yanzhi Cube. All rights reserved.</p>
          </footer>
        </div>

        <LoginModal
          isOpen={isLoginRoute}
          onClose={handleLoginClose}
          onSuccess={handleLoginSuccess}
        />

        {alertMessage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="alert"
            aria-modal="true"
            aria-labelledby="error-title"
          >
            <div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
              onClick={() => setAlertMessage(null)}
            />

            <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-scale-in">
              <button
                onClick={() => setAlertMessage(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400 dark:text-slate-500 hover:text-slate-600 transition-all duration-200 cursor-pointer"
                aria-label="关闭"
              >
                <X size={18} />
              </button>

              <div className="p-8">
                <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center">
                    <AlertCircle className="text-white dark:text-slate-900" size={22} strokeWidth={2.5} />
                  </div>
                </div>

                <h3
                  id="error-title"
                  className="text-xl font-bold text-slate-900 dark:text-white text-center mb-3"
                >
                  无权访问
                </h3>

                <p className="text-slate-500 dark:text-slate-400 text-center text-sm leading-relaxed mb-6">
                  {alertMessage}
                </p>

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
