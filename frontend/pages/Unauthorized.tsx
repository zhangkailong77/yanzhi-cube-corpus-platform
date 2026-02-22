/**
 * Unauthorized Page Component
 * Shown when users lack required permissions
 */
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/components/LanguageContext';
import { AlertTriangle } from 'lucide-react';

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-amber-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {t('unauthorized.title') || 'Unauthorized Access'}
        </h1>
        <p className="text-slate-600 mb-8">
          {t('unauthorized.message') || 'You do not have permission to access this resource.'}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleGoBack}
            className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {t('unauthorized.go_back') || 'Go Back'}
          </button>
          <button
            onClick={handleGoHome}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {t('unauthorized.go_home') || 'Go Home'}
          </button>
        </div>
      </div>
    </div>
  );
}
export default UnauthorizedPage;
