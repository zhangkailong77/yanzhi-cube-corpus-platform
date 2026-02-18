# 路由系统添加设计文档

**日期**: 2025-02-18
**项目**: 颜值立方语料库平台

## 1. 问题概述

当前项目使用 `useState('home' | 'search' | 'preview' | 'dashboard')` 控制视图切换，导致所有页面显示相同的 URL `192.168.31.86:3001`。需要在不改变样式和页面逻辑的前提下，添加路由系统实现 URL 区分不同页面。

## 2. 设计目标

- 添加 URL 路由区分不同页面
- 保持现有样式和页面逻辑不变
- 支持页面间导航和 URL 可分享
- 最小化代码改动

## 3. 架构设计

### 3.1 目录结构

```
frontend/
├── router/
│   ├── index.tsx          # 新增：路由配置文件
│   ├── types.ts           # 新增：路由类型定义
│   └── utils.ts           # 已存在：导航工具
├── App.tsx                # 修改：简化为布局组件
├── index.tsx              # 修改：添加 BrowserRouter
└── pages/                 # 已存在的页面组件
    ├── Home.tsx
    ├── SearchResults.tsx
    ├── SamplePreview.tsx
    ├── Dashboard.tsx
    ├── Unauthorized.tsx
    └── NotFound.tsx
```

### 3.2 组件职责

**全局公共组件**（在所有页面显示）：
- `Navbar` - 顶部导航栏
- `Footer` - 页脚
- `LoginModal` - 登录模态框
- `ErrorAlert` - 错误提示

**页面特定组件**（只在对应路由显示）：
- Home: Hero + StatsOverview
- SearchResults: SearchResults
- SamplePreview: SamplePreview
- Dashboard: Dashboard
- Unauthorized: Unauthorized
- NotFound: NotFound

## 4. 路由配置

### 4.1 路由路径映射

| 当前状态视图 | 路由路径 | 组件 | 说明 |
|------------|---------|------|------|
| home | `/` | `pages/Home.tsx` | 首页 |
| search | `/search` | `pages/SearchResults.tsx` | 搜索结果页 |
| preview | `/preview/:id` | `pages/SamplePreview.tsx` | 语料预览页 |
| dashboard | `/dashboard` | `pages/Dashboard.tsx` | 管理面板 |
| - | `/unauthorized` | `pages/Unauthorized.tsx` | 无权限页 |
| - | `*` | `pages/NotFound.tsx` | 404 页面 |

### 4.2 URL 查询参数

**搜索结果页**：
- 格式：`/search?source=zh&target=en`
- 使用 `useSearchParams()` 读取参数
- 从预览页返回时 URL 参数自动保留

## 5. 数据流和状态管理

### 5.1 状态管理变化

**移除的状态**（由路由管理）：
- `view` - 由 URL 路径决定
- `searchParams` - 由 URL 查询参数管理
- `selectedCorpusId` - 由路由参数 `/preview/:id` 管理

**保留的状态**（在 App.tsx 中）：
- `loginModalOpen` - 控制登录模态框
- `alertMessage` - 控制错误提示

**全局 Context**（保持不变）：
- `AuthProvider` - 用户认证
- `LanguageProvider` - 语言切换

### 5.2 导航流程

- 首页 → 搜索: `useNavigate('/search?source=xxx&target=yyy')`
- 搜索 → 预览: `useNavigate('/preview/${id}')`
- 预览 → 返回: `navigate(-1)` 或 `navigate('/search')`
- Logo → 首页: `useNavigate('/')`
- Dashboard: `useNavigate('/dashboard')`

## 6. 实现计划

### 阶段 1：基础架构
1. 创建 `router/types.ts` - 路由类型定义
2. 创建 `router/index.tsx` - 路由配置
3. 修改 `index.tsx` - 添加 BrowserRouter 包裹

### 阶段 2：简化 App.tsx
1. 移除 view, searchParams, selectedCorpusId 状态
2. 移除相关处理函数
3. 添加 `<AppRoutes />` 组件
4. 保持公共组件和模态框

### 阶段 3：修改页面组件（逐个）
1. **Home.tsx** - Hero 使用 useNavigate 跳转
2. **SearchResults.tsx** - 使用 useSearchParams
3. **SamplePreview.tsx** - 使用 useParams
4. **Dashboard.tsx** - 无需修改
5. **Unauthorized.tsx** - 无需修改
6. **NotFound.tsx** - 无需修改

### 阶段 4：修改公共组件
1. **Navbar.tsx** - 移除 props，使用 useNavigate

### 阶段 5：测试验证
1. 验证所有页面路由正常
2. 验证 URL 参数正确传递
3. 验证页面导航流畅
4. 验证样式和功能不变

## 7. 关键技术点

- 使用 `react-router-dom` v6
- 使用 `useNavigate()` 进行导航
- 使用 `useSearchParams()` 处理查询参数
- 使用 `useParams()` 获取路由参数
- 使用 `navigate(-1)` 返回上一页

## 8. 注意事项

- 保持所有样式类不变
- 保持所有组件内部逻辑不变
- 只修改导航和状态管理方式
- 逐步验证每个页面功能
