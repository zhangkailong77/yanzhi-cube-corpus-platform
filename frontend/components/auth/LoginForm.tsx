/**
 * 登录表单组件
 */
import { useState, FormEvent } from 'react';
import User from 'lucide-react/dist/esm/icons/user';
import Lock from 'lucide-react/dist/esm/icons/lock';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }

    try {
      await login(username, password);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请重试');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          {/* Logo 和标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-600 mb-2">
              语料库管理平台
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Yanzhi Cube Corpus Platform
            </p>
          </div>

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 用户名输入 */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                用户名
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
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
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="请输入密码"
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 1-3 9 9 9 3 3 0 9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.5 7a2.121 2.121 0 0 0-1-3.5 0 0-3 0z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 1-3 9 9 9 3 3 0 9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.5 7a2.121 2.121 0 0 0-1-3.5 0 0 3 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 0 8 0c0-4 0 0-1-4 1.7 0 0 4 1.7 0 0 0 0z" />
                  </svg>
                  <span>登录中...</span>
                </div>
              ) : (
                '登录'
              )}
            </button>
          </form>

          {/* 测试账户提示 */}
          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 text-center">
              <span className="font-medium">测试账户：</span>
              <br />
              用户名：admin | 密码：Yanzhi2026
            </p>
          </div>
        </div>

        {/* 版权信息 */}
        <p className="text-center text-slate-400 text-sm mt-8">
          © 2026 Yanzhi Cube. All rights reserved.
        </p>
      </div>
    </div>
  );
}
