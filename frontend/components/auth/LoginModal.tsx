/**
 * 玻录模态框组件 - 玻璃拟态风格
 */
import { useState } from 'react';
import X from 'lucide-react/dist/esm/icons/x';
import User from 'lucide-react/dist/esm/icons/user';
import Lock from 'lucide-react/dist/esm/icons/lock';
import Eye from 'lucide-react/dist/esm/icons/eye';
import EyeOff from 'lucide-react/dist/esm/icons/eye-off';
import { useAuth } from '../../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const { login, register, isLoading } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true); // true=登录, false=注册
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }

    // 注册模式下，邮箱必填
    if (!isLoginMode && !displayName.trim()) {
      setError('请输入姓名');
      return;
    }

    // 注册模式下，邮箱必填
    if (!isLoginMode && !email.trim()) {
      setError('请输入邮箱');
      return;
    }

    try {
      if (isLoginMode) {
        await login(username, password);
      } else {
        await register(displayName, username, password, email);
      }
      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : isLoginMode ? '登录失败，请重试' : '注册失败，请重试');
    }
  };

  const handleClose = () => {
    setUsername('');
    setDisplayName('');
    setPassword('');
    setEmail('');
    setError('');
    onClose();
  };

  // 阻止背景滚动
  if (!isOpen) return null;

  return (
    <>
      {/* 背景模糊遮罩 */}
      <div
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* 模态框容器 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md animate-modal-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 玻璃拟态卡片 */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* 关闭按钮 */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-100/50"
              aria-label="关闭"
            >
              <X size={20} />
            </button>

            {/* Logo 和标题 */}
            <div className="pt-10 pb-6 px-8 text-center">
              {/* Logo */}
              <div className="mb-6 flex justify-center">
                <img
                  src="/2.png"
                  alt="Yanzhi Cube Logo"
                  className="h-16 w-16 object-contain drop-shadow-lg"
                />
              </div>

              <h1 className="text-2xl font-semibold text-slate-800 mb-2">
                {isLoginMode ? '欢迎回来' : '创建账户'}
              </h1>
              <p className="text-slate-500 text-sm">
                {isLoginMode ? '登录到颜值立方语料库管理平台' : '注册成为颜值立方语料库管理平台用户'}
              </p>
            </div>

            {/* 登录表单 */}
            <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
              {/* 用户名输入 */}
              {!isLoginMode && (
                <div className="space-y-2">
                  <label
                    htmlFor="modal-display-name"
                    className="block text-sm font-medium text-slate-700"
                  >
                    姓名
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                    <input
                      id="modal-display-name"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200/50 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all placeholder:text-slate-400"
                      placeholder="请输入姓名"
                      disabled={isLoading}
                      autoComplete="name"
                      required={!isLoginMode}
                    />
                  </div>
                </div>
              )}

              {/* 用户名输入 */}
              <div className="space-y-2">
                <label
                  htmlFor="modal-username"
                  className="block text-sm font-medium text-slate-700"
                >
                  用户名
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  <input
                    id="modal-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200/50 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all placeholder:text-slate-400"
                    placeholder="请输入用户名"
                    disabled={isLoading}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* 密码输入 */}
              <div className="space-y-2">
                <label
                  htmlFor="modal-password"
                  className="block text-sm font-medium text-slate-700"
                >
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  <input
                    id="modal-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-slate-50/50 border border-slate-200/50 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all placeholder:text-slate-400"
                    placeholder="请输入密码"
                    disabled={isLoading}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* 邮箱输入（仅注册模式显示） */}
              {!isLoginMode && (
                <div className="space-y-2">
                  <label
                    htmlFor="modal-email"
                    className="block text-sm font-medium text-slate-700"
                  >
                    邮箱
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 0 1 2.83 2.83L21 8M5 19h14a2 2 0 0 1-2 2v6a2 2 0 0 1-2-2H7a2 2 0 0 1-2 2z" />
                    </svg>
                    <input
                      id="modal-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200/50 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all placeholder:text-slate-400"
                      placeholder="请输入邮箱"
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>
                </div>
              )}

              {/* 错误提示 */}
              {error && (
                <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-600 rounded-xl p-3 text-sm flex items-start gap-2">
                  <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth={2} />
                    <path strokeLinecap="round" strokeWidth={2} d="M12 8v4m0 4h8" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* 登录/注册按钮 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-medium py-3.5 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/25"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 0 8 0c0-4 0 0-1-4 1.7 0 0 4 1.7 0 0 0 0z" />
                    </svg>
                    <span>{isLoginMode ? '登录中...' : '注册中...'}</span>
                  </div>
                ) : (
                  isLoginMode ? '登录' : '注册'
                )}
              </button>

              {/* 登录/注册切换 */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsLoginMode(!isLoginMode)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoginMode ? '还没有账户？立即注册' : '已有账户？立即登录'}
                </button>
              </div>
            </form>

            {/* 底部装饰 */}
            <div className="px-8 pb-6">
              <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 0 0 0 2v12a2 2 0 0 0 0-2h-12a2 2 0 0 0 0-2z" />
                  </svg>
                  安全加密
                </span>
                <span className="w-px h-3 bg-slate-200" />
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 2.854-6.942 12-7.074-7.074m0 0-4.142-8.364-9.29-6.583M21 12a9 9 0 1 1-18 0 2.854 6.942 12 7.074 7.074m0 0 4.142 8.364 9.29 6.583" />
                  </svg>
                  隐私保护
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 模态框动画样式 */}
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
    </>
  );
}
