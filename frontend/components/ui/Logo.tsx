import React from 'react';
import { useLanguage } from '../LanguageContext';

interface LogoProps {
  size?: 'small' | 'large';
}

const Logo: React.FC<LogoProps> = ({ size = 'small' }) => {
  const { t } = useLanguage();

  if (size === 'large') {
    return (
      <div className="flex flex-col items-start select-none">
        <div className="flex items-center">
          <div className="relative flex items-center justify-center w-28 h-28 rounded-2xl mr-3 overflow-hidden">
            <img src="/2.png" alt="颜" className="w-20 h-20 object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900">{t('title')}</span>
            <span className="text-sm font-semibold tracking-wider text-slate-500 uppercase mt-1">
              {t('subtitle')}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center select-none">
      <div className="relative flex items-center justify-center w-26 h-12 rounded-lg mr-2 overflow-hidden">
        <img src="/1.png" alt="颜" className="w-28 h-14 object-contain" />
      </div>
      {/* <span className="text-lg font-bold tracking-tight text-slate-900">{t('title')}</span> */}
    </div>
  );
};

export default Logo;