/**
 * Not Found Page Component
 * 404 error page for invalid URLs
 */
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/components/LanguageContext';
import { Home } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-slate-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-8">
          <span className="text-6xl font-bold text-slate-400">404</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {t('not_found.title') || 'Page Not Found'}
        </h1>
        <p className="text-slate-600 mb-8">
          {t('not_found.message') || 'The page you are looking for does not exist.'}
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Home className="w-4 h-4" />
          {t('not_found.go_home') || 'Go Home'}
        </button>
      </div>
    </div>
  );
}
export default NotFoundPage;
