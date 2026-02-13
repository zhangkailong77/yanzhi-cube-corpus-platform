/**
 * 认证状态管理 Context
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ==================== 类型定义 ====================

export type UserRole = 'admin' | 'member';

export interface User {
  id: number;
  username: string;
  email: string | null;
  role: UserRole;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email?: string) => Promise<void>;
  logout: () => void;
}

// ==================== Context ====================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ==================== Provider ====================

interface AuthProviderProps {
  children: ReactNode;
}

const API_BASE_URL = 'http://localhost:8000';

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 初始化时从 localStorage 读取 token
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 登录函数
  const login = async (username: string, password: string): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '登录失败');
      }

      const data = await response.json();

      // 保存 token 和用户信息
      setToken(data.access_token);
      setUser(data.user);

      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 注册函数
  const register = async (username: string, password: string, email?: string): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '注册失败');
      }

      const data = await response.json();

      // 保存 token 和用户信息
      setToken(data.access_token);
      setUser(data.user);

      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 登出函数
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ==================== Hook ====================

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

// ==================== API 辅助函数 ====================

export async function apiRequest(
  endpoint: string,
  token: string | null,
  options: RequestInit = {}
): Promise<Response> {
  const headers: HeadersInit = {
    ...options.headers,
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
}
