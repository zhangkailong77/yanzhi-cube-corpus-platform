/**
 * 登录页面
 */
import { useEffect } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { useAuth } from '../contexts/AuthContext';

interface LoginPageProps {
  onSuccess?: () => void;
}

export function LoginPage({ onSuccess }: LoginPageProps) {
  const { isAuthenticated } = useAuth();

  // 如果已登录，跳转到首页
  useEffect(() => {
    if (isAuthenticated) {
      onSuccess?.();
    }
  }, [isAuthenticated, onSuccess]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter-blur-xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter-blur-xl opacity-20 animate-blob delay-2000" />
      </div>

      {/* 登录表单 */}
      <LoginForm onSuccess={onSuccess} />
    </div>
  );
}

// 添加背景动画样式
const style = document.createElement('style');
style.textContent = `
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.95); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-blob {
    animation: blob 7s infinite;
  }
  .delay-2000 {
    animation-delay: 2s;
  }
`;
document.head.appendChild(style);
