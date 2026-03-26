import React from 'react';

interface LogoProps {
  size?: 'small' | 'large';
}

const Logo: React.FC<LogoProps> = ({ size = 'small' }) => {
  if (size === 'large') {
    return (
      <div className="flex items-center select-none">
        <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl overflow-hidden">
          <img src="/2.png" alt="平台头像" className="w-20 h-20 object-contain" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 select-none">
      <span className="text-[25px] font-semibold tracking-wide text-slate-700 whitespace-nowrap">
        桂海丝语产业学院
      </span>
      <div className="relative flex items-center justify-center w-[200px] h-[80px] overflow-hidden">
        <img src="/logo3.png" alt="logo3" className="w-[200px] h-[80px] object-contain" />
      </div>
      <div className="relative flex items-center justify-center w-26 h-12 rounded-lg overflow-hidden">
        <img src="/1.png" alt="颜" className="w-28 h-14 object-contain" />
      </div>
      {/* <span className="text-lg font-bold tracking-tight text-slate-900">{t('title')}</span> */}
    </div>
  );
};

export default Logo;
