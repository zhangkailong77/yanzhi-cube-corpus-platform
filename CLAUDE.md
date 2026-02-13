# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

颜值立方（Yanzhi Cube）是一个多语言语料库管理平台，使用 React 19 和 Vite 6 构建。应用提供语料搜索、预览和仪表盘功能，支持 5 种语言的数据集（中文、英文、泰语、越南语、马来语）。

### 基于角色的访问控制（RBAC）

平台实现了基于角色的访问控制，有两种用户角色：
- **admin**（超级管理员）- 完整访问所有功能和数据
- **member**（普通成员）- 受限访问，仅能使用公开/通用语料和基本仪表盘功能

**实施计划**：详见 `docs/plan/rbac-implementation-plan.md` 了解 RBAC 实施的详细阶段和架构设计。

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (runs on port 3000, host 0.0.0.0)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Required Configuration**: Set `GEMINI_API_KEY` in `.env.local` before running the app.

## Architecture

### 技术栈
- **运行时**：Vite 6，ES 模块（type: "module"）
- **前端**：React 19.2.4 + TypeScript 5.8.2
- **UI 框架**：Tailwind CSS（通过 CDN）+ Lucide React 图标
- **样式**：Utility-first CSS，使用 Tailwind，Inter + JetBrains Mono 字体

### Project Structure

```
├── App.tsx                 # Main app with view routing (home/search/preview/dashboard)
├── index.tsx               # React entry point
├── index.html              # HTML shell with Tailwind CDN, importmap, custom config
├── components/
│   ├── LanguageContext.tsx # i18n context (zh/en/th/vi/ms languages)
│   ├── ui/Logo.tsx        # Reusable logo component
│   ├── Navbar.tsx          # Top navigation with language switcher
│   ├── Hero.tsx            # Home page search interface
│   ├── StatsOverview.tsx    # Corpus statistics overview
│   ├── Contributers.tsx    # Contributors section
│   ├── SearchResults.tsx    # Search results table with domain filters
│   ├── SamplePreview.tsx    # Detailed corpus sample view (Quad-Layer annotation)
│   └── Dashboard.tsx       # Data assets dashboard with KPIs and charts
└── vite.config.ts          # Vite config with path alias (@ = root dir)
```

### Key Architectural Patterns

**View Routing**: The app uses simple state-based routing (not React Router). `App.tsx` manages `view` state: `'home' | 'search' | 'preview' | 'dashboard'`. Navigation functions like `handleSearch`, `handleGoHome`, `handlePreview`, `handleDashboard` switch views and scroll to top.

**Internationalization (i18n)**: All translations stored in `LanguageContext.tsx` as a large object keyed by language code. Components use `useLanguage()` hook to access `t(key)` function. No external i18n library - hand-rolled context provider.

**Import Maps**: Dependencies loaded via ESM (esm.sh) through import map in `index.html`. Notably:
- React imports: `https://esm.sh/react@^19.2.4/`
- No local node_modules React in browser - uses CDN modules
- Lucide React also via CDN

**Path Aliases**: `@` mapped to root directory in both `tsconfig.json` and `vite.config.ts`. Use `@/components/...` for imports.

### 组件通信模式

**语言对选择**：用于 `Hero.tsx`、`SearchResults.tsx`、`SamplePreview.tsx`。模式：两个选择下拉框，防止源语言和目标语言相同。目标选择在源语言选择前禁用。

**域过滤**：语料按业务域分类：`ecommerce`（电商）| `tourism`（旅游）| `business`（商业）| `economy`（经济）| `general`（通用）。每个域在搜索结果中有颜色编码的徽章。

**基于角色的渲染**：使用 `PermissionGuard` 组件根据用户角色条件性渲染 UI 元素。管理员可以访问所有功能，普通成员只能访问公开/通用语料和基本仪表盘。

**Domain Filtering**: Corpora categorized by business domain: `ecommerce | tourism | business | economy | general`. Each domain has color-coded badges in search results.

**Dashboard Views**: Dashboard supports three view modes:
- `overview`: KPI cards + timeline chart
- Language-specific views (when viewMode is language code): Not fully implemented
- Business scenario views (consultation/transaction/support/operations/feedback): Show intent analysis and channel sentiment

### 数据模型

**用户角色**：
```typescript
type UserRole = 'admin' | 'member';

interface User {
  id: number;
  username: string;
  email: string | null;
  role: UserRole;        // 'admin' = 超级管理员, 'member' = 普通成员
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}
```

**权限类型**：
```typescript
type Permission =
  | 'dashboard.view'                    // 查看仪表盘
  | 'dashboard.view_kpi'                  // 查看仪表盘 KPI
  | 'dashboard.view_business_scenarios'   // 查看业务场景视图
  | 'dashboard.export_data'              // 导出数据
  | 'corpus.view_all'                    // 查看所有语料
  | 'corpus.view_public_only'           // 仅查看公开语料
  | 'corpus.download'                    // 下载语料
  | 'sample.preview_full'                 // 完整样本预览
  | 'sample.preview_limited';             // 限止样本预览
```

**Corpus Item Structure** (SearchResults.tsx):
```typescript
{
  id: number;
  name: string;           // e.g., "OpenSubtitles v2018"
  sentences: string;         // Formatted count, e.g., "1,204,500"
  sTok: string;             // Source token count
  tTok: string;             // Target token count
  tags: ScenarioTag[];      // Domain application tags
}
```

**Quad-Layer Annotation System** (SamplePreview.tsx):
- `basic_layer`: sentence_id, timestamp, platform
- `language_layer`: source_text_zh, raw_text_ms, normalized_text_ms, english_loanwords
- `pragmatic_layer`: intent[], sentiment, business_scenario
- `style_layer`: style, contains_rojak, abbreviations_handled

**角色权限映射**：
```typescript
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // 超级管理员拥有所有权限
  ],
  member: [
    // 普通成员只能使用公开功能和基本查看
  ],
};
```

### Styling Conventions

- **Colors**: Primary blue palette (`primary-50` to `primary-900`), slate grays for text/borders
- **Typography**: Inter for sans-serif, JetBrains Mono for mono/numbers
- **Components**: Extensive use of rounded-xl, border-slate-200, shadow-sm for cards
- **Responsive**: Heavy use of `hidden lg:block` type utilities for progressive disclosure
- **State**: Disabled states use `bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed`

## Configuration Files

**前端配置**

**vite.config.ts**:
- Server: port 3000, host 0.0.0.0
- Environment variables: `process.env.GEMINI_API_KEY` injected via `define`
- Path alias: `@` → project root

**tsconfig.json**:
- Target: ES2022
- JSX: react-jsx (automatic runtime)
- Module resolution: bundler (Vite-native)
- Paths: `@/*` maps to `./*`

**后端配置**

**backend/api/main.py**:
- FastAPI 应用入口
- CORS 配置：允许所有来源（`allow_origins=["*"]`）
- JWT 密钥配置：用于 token 签名和验证
- 数据库连接：异步 MySQL 连接（aiomysql）
- API 路由前缀：`/api`

**backend/database/connection.py**:
- 数据库配置：host、port、user、password、database、charset
- 异步引擎配置：连接池、预、回收时间
- 会话工厂：AsyncSession 管理

## RBAC 实施参考

### 权限系统设计原则

1. **最小权限原则**：用户只应获得完成其工作所需的最低权限
2. **防御深度**：多层访问控制（UI 组件 → 上下文检查 → API 验证）
3. **显式优于隐式**：明确显示功能不可用而非隐藏
4. **失败安全**：权限检查失败时返回明确错误信息

### 角色功能矩阵

| 功能 | 超级管理员 | 普通成员 |
|-----|-----------|----------|
| 仪表盘概览 | ✓ | ✓ |
| 仪表盘 KPI 卡片 | ✓ | ✓ |
| 仪表盘业务场景视图 | ✓ | ✗ |
| 仪表盘数据导出 | ✓ | ✗ |
| 搜索所有语料 | ✓ | 仅公开/通用 |
| 搜索私有/官方语料 | ✓ | ✗ |
| 下载语料数据 | ✓ | ✗ |
| 样本完整预览（四层标注） | ✓ | 仅基础+语言层 |
| 系统全局统计 | ✓ | 限制访问 |
| 管理员面板 | ✓ | ✗ |

### 实施状态

- [x] 基础权限系统（`permissions.ts`）- 已规划
- [ ] 访问控制上下文（`AccessControlContext.tsx`）- 已规划
- [ ] 授权钩子（`useAuthorization.ts`）- 已规划
- [ ] 权限守卫组件（`PermissionGuard.tsx`）- 已规划
- [ ] 未授权提示组件（`UnauthorizedAlert.tsx`）- 已规划
- [ ] 组件级权限控制集成 - 已规划
- [ ] 后端 API 权限验证 - 待实施

**注意**：完整的 RBAC 实施计划请参考 `docs/plan/rbac-implementation-plan.md`

**tsconfig.json**:
- Target: ES2022
- JSX: react-jsx (automatic runtime)
- Module resolution: bundler (Vite-native)
- Paths: `@/*` maps to `./*`
