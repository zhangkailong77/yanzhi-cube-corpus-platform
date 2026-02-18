# 添加路由系统实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为颜值立方语料库平台添加 URL 路由系统，在不改变样式和页面逻辑的前提下，实现 URL 区分不同页面，支持页面导航和 URL 可分享。

**Architecture:** 使用 React Router v6 创建路由系统，将现有的状态管理（view, searchParams, selectedCorpusId）替换为 URL 路由和查询参数。App.tsx 简化为布局组件，各页面组件内部使用 React Router hooks 进行导航。

**Tech Stack:** React Router v6, React 19, TypeScript

---

## 阶段 1：基础架构搭建

### Task 1: 创建路由类型定义文件

**Files:**
- Create: `frontend/router/types.ts`

**Step 1: 创建 types.ts 文件**

```typescript
export type AppRoute = '/' | '/search' | '/preview/:id' | '/dashboard' | '/unauthorized';

export interface NavigationState {
  from?: string;
  // 其他需要传递的 state
}
```

**Step 2: 验证文件创建成功**

检查 `frontend/router/types.ts` 文件是否存在。

**Step 3: 提交**

```bash
git add frontend/router/types.ts
git commit -m "feat: add router types definition"
```

---

### Task 2: 创建路由配置文件

**Files:**
- Create: `frontend/router/index.tsx`

**Step 1: 创建路由配置组件**

```tsx
import { Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import SearchResults from '@/pages/SearchResults';
import SamplePreview from '@/pages/SamplePreview';
import Dashboard from '@/pages/Dashboard';
import Unauthorized from '@/pages/Unauthorized';
import NotFound from '@/pages/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/preview/:id" element={<SamplePreview />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
```

**Step 2: 验证文件创建成功**

检查 `frontend/router/index.tsx` 文件是否存在。

**Step 3: 提交**

```bash
git add frontend/router/index.tsx
git commit -m "feat: add router configuration"
```

---

### Task 3: 在 index.tsx 中添加 BrowserRouter

**Files:**
- Modify: `frontend/index.tsx`

**Step 1: 添加 BrowserRouter 包裹**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

**Step 2: 验证开发服务器正常运行**

运行: `cd frontend && npm run dev`
Expected: 服务器启动，浏览器显示页面，控制台无错误

**Step 3: 提交**

```bash
git add frontend/index.tsx
git commit -m "feat: wrap app with BrowserRouter"
```

---

## 阶段 2：简化 App.tsx

### Task 4: 修改 App.tsx 为布局组件

**Files:**
- Modify: `frontend/App.tsx`

**Step 1: 简化 App.tsx，移除路由相关状态**

```tsx
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import AppRoutes from './router';
import { LanguageProvider } from './components/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { LoginModal } from './components/auth/LoginModal';
import { AlertCircle, X } from 'lucide-react';

const App: React.FC = () => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleLoginClick = () => {
    setLoginModalOpen(true);
  };

  const handleLoginClose = () => {
    setLoginModalOpen(false);
  };

  const handleLoginSuccess = () => {
    setLoginModalOpen(false);
  };

  return (
    <AuthProvider>
      <LanguageProvider>
        <div className={`min-h-screen flex flex-col bg-white transition-all duration-300 ${loginModalOpen ? 'blur-sm' : ''}`}>
          <Navbar onLoginClick={handleLoginClick} />

          <main className="flex-grow">
            <AppRoutes />
          </main>

          <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-100 mt-auto bg-white">
            <p>&copy; {new Date().getFullYear()} 颜值立方 Yanzhi Cube. All rights reserved.</p>
          </footer>
        </div>

        <LoginModal
          isOpen={loginModalOpen}
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
```

**Step 2: 验证页面正常渲染**

运行: `cd frontend && npm run dev`
Expected: 页面显示，没有布局错误

**Step 3: 提交**

```bash
git add frontend/App.tsx
git commit -m "refactor: simplify App.tsx to layout component"
```

---

## 阶段 3：修改页面组件（逐个）

### Task 5: 修改 Home.tsx 页面

**Files:**
- Modify: `frontend/pages/Home.tsx`
- Modify: `frontend/components/Hero.tsx`

**Step 1: 修改 Home.tsx（如果需要）**

```tsx
import Hero from '@/components/Hero';
import StatsOverview from '@/components/StatsOverview';

export function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <StatsOverview />
    </div>
  );
}
export default HomePage;
```

**Step 2: 修改 Hero.tsx，使用 useNavigate**

在 Hero 组件中：
- 移除 `onSearch` prop
- 添加 `import { useNavigate } from 'react-router-dom';`
- 使用 `const navigate = useNavigate();`
- 搜索按钮点击时：`navigate('/search?source=' + source + '&target=' + target);`

**Step 3: 测试首页搜索功能**

运行开发服务器，在首页输入搜索条件并点击搜索
Expected: 跳转到 `/search?source=xxx&target=yyy`

**Step 4: 提交**

```bash
git add frontend/pages/Home.tsx frontend/components/Hero.tsx
git commit -m "feat: add navigation to Home page"
```

---

### Task 6: 修改 SearchResults.tsx 页面

**Files:**
- Modify: `frontend/pages/SearchResults.tsx`

**Step 1: 修改 SearchResults.tsx，使用 useSearchParams**

```tsx
import { useSearchParams, useNavigate } from 'react-router-dom';

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const source = searchParams.get('source') || '';
  const target = searchParams.get('target') || '';

  const handleSearch = (newSource: string, newTarget: string) => {
    navigate(`/search?source=${newSource}&target=${newTarget}`);
  };

  const handlePreview = (id: number) => {
    navigate(`/preview/${id}`);
  };

  // 其余组件逻辑保持不变
}
export default SearchResultsPage;
```

**Step 2: 测试搜索结果页功能**

1. 从首页跳转到搜索结果页
2. 验证 URL 参数正确显示
3. 点击预览按钮
Expected: 跳转到 `/preview/:id`

**Step 3: 提交**

```bash
git add frontend/pages/SearchResults.tsx
git commit -m "feat: add useSearchParams to SearchResults page"
```

---

### Task 7: 修改 SamplePreview.tsx 页面

**Files:**
- Modify: `frontend/pages/SamplePreview.tsx`

**Step 1: 修改 SamplePreview.tsx，使用 useParams**

```tsx
import { useParams, useNavigate } from 'react-router-dom';

export function SamplePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const corpusId = id ? parseInt(id) : null;

  const handleBack = () => {
    navigate(-1); // 返回上一页
  };

  // 其余组件逻辑保持不变
}
export default SamplePreviewPage;
```

**Step 2: 测试预览页功能**

1. 从搜索结果页跳转到预览页
2. 点击返回按钮
Expected: 返回搜索结果页，URL 参数保留

**Step 3: 提交**

```bash
git add frontend/pages/SamplePreview.tsx
git commit -m "feat: add useParams to SamplePreview page"
```

---

### Task 8: 修改 Dashboard.tsx 页面

**Files:**
- Modify: `frontend/pages/Dashboard.tsx`

**Step 1: 检查 Dashboard.tsx 是否需要修改**

如果 Dashboard 页面没有使用来自 App.tsx 的 props，则无需修改。

如果需要修改，确保使用 React Router hooks 进行导航。

**Step 2: 提交（如果有修改）**

```bash
git add frontend/pages/Dashboard.tsx
git commit -m "refactor: update Dashboard page for routing"
```

---

## 阶段 4：修改公共组件

### Task 9: 修改 Navbar.tsx 组件

**Files:**
- Modify: `frontend/components/Navbar.tsx`

**Step 1: 修改 Navbar.tsx，移除 props，使用 useNavigate**

```tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './ui/Logo';
import User from 'lucide-react/dist/esm/icons/user';
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Globe from 'lucide-react/dist/esm/icons/globe';
import { useLanguage } from './LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <nav className="w-full border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-sm z-50">
      <div className="w-full px-6 md:px-12 h-16 flex items-center justify-between">
        <div className="flex-shrink-0 cursor-pointer" onClick={handleLogoClick}>
          <Logo size="small" />
        </div>

        <div className="flex items-center space-x-4 md:space-x-6">
          {/* Language Switcher - 保持不变 */}
          <div className="relative group">
            <button className="flex items-center text-slate-500 hover:text-slate-900 transition-colors p-2">
              <Globe size={18} className="mr-1" />
              <span className="text-sm font-medium uppercase">{language}</span>
            </button>
            <div className="absolute right-0 mt-0 w-32 bg-white rounded-lg shadow-lg border border-slate-100 py-1 hidden group-hover:block transition-all">
              <button
                onClick={() => setLanguage('zh')}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
              >
                中文
              </button>
              <button
                onClick={() => setLanguage('en')}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
              >
                English
              </button>
              <button
                onClick={() => setLanguage('th')}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
              >
                ไทย
              </button>
              <button
                onClick={() => setLanguage('vi')}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
              >
                Tiếng Việt
              </button>
              <button
                onClick={() => setLanguage('ms')}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
              >
                Melayu
              </button>
            </div>
          </div>

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User size={18} />
                <span className="text-sm font-medium hidden md:inline">
                  {user?.username || 'User'}
                </span>
                <ChevronDown size={16} className="text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="text-xs text-slate-500">Username</div>
                    <div className="text-sm font-medium text-slate-900">{user?.username}</div>
                  </div>
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="text-xs text-slate-500">Role</div>
                    <div className="text-sm font-medium">
                      {user?.role === 'admin' ? (
                        <span className="text-primary-600">超级管理员</span>
                      ) : (
                        <span className="text-slate-600">普通成员</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    <LogOut size={16} className="mr-2" />
                    登出
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {}} // 登录逻辑由 App.tsx 的状态控制
              className="flex items-center space-x-2 px-4 py-1.5 text-sm font-semibold rounded-full bg-primary-600 text-white hover:bg-primary-700 shadow-sm transition-colors"
            >
              <User size={18} />
              <span className="hidden md:inline">登录</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
```

**Step 2: 测试导航功能**

1. 点击 Logo
2. 登录后点击用户菜单
Expected: 正确导航到对应页面

**Step 3: 提交**

```bash
git add frontend/components/Navbar.tsx
git commit -m "refactor: update Navbar with useNavigate"
```

---

## 阶段 5：测试验证

### Task 10: 完整功能测试

**Files:**
- Test: 手动测试所有功能

**Step 1: 测试首页功能**

1. 访问 `http://localhost:3001/`
2. 验证页面正常显示
3. 输入搜索条件并点击搜索
Expected: 跳转到 `/search?source=xxx&target=yyy`

**Step 2: 测试搜索结果页功能**

1. 在搜索结果页查看内容
2. 点击预览按钮
Expected: 跳转到 `/preview/:id`

**Step 3: 测试预览页功能**

1. 查看预览内容
2. 点击返回按钮
Expected: 返回搜索结果页，URL 参数保留

**Step 4: 测试 Dashboard 功能**

1. 登录后点击 Dashboard
Expected: 跳转到 `/dashboard`

**Step 5: 测试无效路由**

1. 访问 `/invalid-route`
Expected: 显示 404 页面

**Step 6: 测试浏览器前进/后退**

1. 在页面间导航
2. 使用浏览器的前进/后退按钮
Expected: 正确导航到历史页面

**Step 7: 提交（如需要修复）**

```bash
git add .
git commit -m "test: complete routing system tests"
```

---

## 总结

本实现计划按照以下步骤逐步完成：
1. ✅ 创建路由类型和配置文件
2. ✅ 添加 BrowserRouter 包裹
3. ✅ 简化 App.tsx 为布局组件
4. ✅ 逐个修改页面组件（Home, SearchResults, SamplePreview, Dashboard）
5. ✅ 修改公共组件（Navbar）
6. ✅ 完整功能测试

每个步骤都有明确的文件路径、代码实现和验证方法，确保可以逐步验证功能正常。
