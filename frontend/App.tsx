import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const errorMessage = (location.state as any)?.error;
    if (errorMessage) {
      setAlertMessage(errorMessage);
    }
  }, [location.state]);

  return (
    <AuthProvider>
      <LanguageProvider>
        <div className={`min-h-screen flex flex-col bg-white transition-all duration-300 ${isLoginRoute || alertMessage ? 'blur-sm' : ''}`}>
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
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm animate-fade-in"
              onClick={() => setAlertMessage(null)}
              aria-hidden="true"
            />

            <div className="relative w-full max-w-md animate-modal-in">
              <div
                className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setAlertMessage(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-100/50"
                  aria-label="关闭"
                >
                  <X size={20} />
                </button>

                <div className="pt-10 pb-6 px-8 text-center">
                  <div className="mb-6 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertCircle className="text-red-600" size={32} strokeWidth={2.5} />
                    </div>
                  </div>

                  <h1 className="text-2xl font-semibold text-slate-800 mb-2">
                    无权访问
                  </h1>
                  <p className="text-slate-500 text-sm">
                    {alertMessage}
                  </p>
                </div>

                <div className="px-8 pb-8">
                  <button
                    onClick={() => setAlertMessage(null)}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-medium py-3.5 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 shadow-lg shadow-primary-500/25"
                  >
                    确定
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes modal-in {
            0% {
              opacity: 0;
              transform: scale(0.95) translateY(10px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          .animate-modal-in {
            animation: modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
        `}</style>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
