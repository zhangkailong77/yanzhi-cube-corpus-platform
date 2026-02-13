# 实施计划：基于角色的访问控制 (RBAC)

## 项目概述

颜值立方语料库管理平台目前有基本的认证系统（`admin` 和 `member`），但没有实施基于角色的访问控制（RBAC）。当前所有认证用户具有相同的访问级别。此计划将实现适当的 RBAC 来区分超级管理员和普通成员的特权和数据可见性。

## 当前状态分析

### 现有认证基础设施

**文件：`frontend/contexts/AuthContext.tsx`**
- 用户类型定义：`UserRole = 'admin' | 'member'`
- 用户接口包含：`id`、`username`、`email`、`role`、`is_active`、`last_login_at`、`created_at`
- AuthContext 提供：`user`、`token`、`isAuthenticated`、`isLoading`、`login`、`register`、`logout`
- API 基础 URL：`http://localhost:8000`
- Token 存储：localStorage (`auth_token`、`auth_user`)

**文件：`frontend/components/Navbar.tsx`**
- 角色显示已实现（第 132-139 行）
- 管理员显示"超级管理员"，普通成员显示"普通成员"
- 用户菜单显示用户名和角色

### 当前访问控制问题

1. **仪表盘（`Dashboard.tsx`）**
   - 无基于角色的过滤
   - 所有 KPI 数据、图表和业务场景视图对所有用户可见
   - 导出按钮没有任何限制

2. **搜索结果（`SearchResults.tsx`）**
   - 所有语料数据对所有认证用户可见
   - 无基于用户所有权或访问级别的过滤
   - 下载功能没有角色检查

3. **样本预览（`SamplePreview.tsx`）**
   - 详细的四层标注数据对所有用户可见
   - 查看敏感数据没有任何限制

4. **主搜索页（`Hero.tsx`）**
   - 仅需要认证（非基于角色）
   - 所有认证用户都可以搜索

## 功能需求

### 管理员（超级管理员）访问
   - 完整访问所有仪表盘特权和数据
   - 查看所有域和来源的语料
   - 访问详细的样本预览
   - 导出数据功能
   - 查看系统范围的统计和 KPI
   - 访问所有业务场景视图

### 普通成员访问
   - 有限的仪表盘视图（仅概览，无详细业务场景）
   - 仅能访问公开/开放的语料
   - 受限搜索（无法访问私有/官方语料）
   - 无数据导出功能
   - 有限的样本预览访问
   - 无法查看系统范围的敏感统计

## 架构变更

### 需要创建的新文件

1. **`frontend/utils/permissions.ts`**
   - 权限类型定义
   - 角色到权限的映射关系
   - 可复用的权限常量

2. **`frontend/contexts/AccessControlContext.tsx`**
   - 权限检查工具
   - 基于角色的访问钩子
   - 功能标志配置

3. **`frontend/hooks/useAuthorization.ts`**
   - 自定义授权检查钩子
   - 可复用的权限谓词

4. **`frontend/components/access/PermissionGuard.tsx`**
   - 基于权限的条件渲染组件
   - 未授权访问的后备 UI

5. **`frontend/components/access/UnauthorizedAlert.tsx`**
   - 可复用的访问拒绝提示组件

### 需要修改的文件（7 个）

1. **`frontend/components/Dashboard.tsx`**
2. **`frontend/components/SearchResults.tsx`**
3. **`frontend/components/SamplePreview.tsx`**
4. **`frontend/components/Navbar.tsx`**
5. **`frontend/components/Hero.tsx`**
6. **`frontend/App.tsx`**
7. **`frontend/contexts/AuthContext.tsx`**

## 实施步骤

### 阶段 1：基础设施 - 访问控制系统

#### 步骤 1：创建权限类型和常量

**文件：`frontend/utils/permissions.ts`**

**操作：** 定义权限类型和角色到权限的映射关系
**原因：** 集中管理的权限定义
**依赖：** 无
**风险：** 低

```typescript
// 定义权限类型
export type Permission =
  | 'dashboard.view'                    // 查看仪表盘
  | 'dashboard.view_kpi'                  // 查看仪表盘 KPI
  | 'dashboard.view_business_scenarios'   // 查看业务场景视图
  | 'dashboard.export_data'              // 导出数据
  | 'corpus.view_all'                    // 查看所有语料
  | 'corpus.view_public_only'           // 仅查看公开语料
  | 'corpus.download'                    // 下载语料
  | 'sample.preview_full'                 // 完整样本预览
  | 'sample.preview_limited';             // 限止样本预览

// 角色到权限的映射
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'dashboard.view',
    'dashboard.view_kpi',
    'dashboard.view_business_scenarios',
    'dashboard.export_data',
    'corpus.view_all',
    'corpus.download',
    'sample.preview_full',
  ],
  member: [
    'dashboard.view',
    'dashboard.view_kpi',
    'corpus.view_public_only',
    'sample.preview_limited',
  ],
};
```

#### 步骤 2：创建 AccessControlContext

**文件：`frontend/contexts/AccessControlContext.tsx`**

**操作：** 创建包含权限检查工具的上下文
**原因：** 集中管理的访问控制逻辑
**依赖：** 步骤 1
**风险：** 低

```typescript
import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { ROLE_PERMISSIONS, Permission } from '../utils/permissions';

export interface AccessControlContextValue {
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  canViewDashboard: () => boolean;
  canViewBusinessScenarios: () => boolean;
  canExportData: () => boolean;
  canDownloadCorpus: () => boolean;
}

const AccessControlContext = createContext<AccessControlContextValue | undefined>(undefined);

export function AccessControlProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role].includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return permissions.some(p => hasPermission(p));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return permissions.every(p => hasPermission(p));
  };

  const canViewDashboard = (): boolean => hasPermission('dashboard.view');
  const canViewBusinessScenarios = (): boolean => hasPermission('dashboard.view_business_scenarios');
  const canExportData = (): boolean => hasPermission('dashboard.export_data');
  const canDownloadCorpus = (): boolean => hasPermission('corpus.download');

  const value: AccessControlContextValue = {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canViewDashboard,
    canViewBusinessScenarios,
    canExportData,
    canDownloadCorpus,
  };

  return (
    <AccessControlContext.Provider value={value}>
      {children}
    </AccessControlContext.Provider>
  );
}

export function useAccessControl() {
  const context = useContext(AccessControlContext);
  if (!context) {
    throw new Error('useAccessControl must be used within AccessControlProvider');
  }
  return context;
}
```

#### 步骤 3：创建 useAuthorization 钩子

**文件：`frontend/hooks/useAuthorization.ts`**

**操作：** 创建用于授权检查的自定义钩子
**原因：** 可复用的授权逻辑
**依赖：** 步骤 2
**风险：** 低

```typescript
import { useAccessControl } from '../contexts/AccessControlContext';

export function useAuthorization() {
  const context = useAccessControl();
  if (!context) {
    throw new Error('useAuthorization must be used within AccessControlProvider');
  }
  return context;
}
```

#### 步骤 4：创建 PermissionGuard 组件

**文件：`frontend/components/access/PermissionGuard.tsx`**

**操作：** 基于权限的条件渲染组件
**原因：** 声明式基于权限的 UI
**依赖：** 步骤 3
**风险：** 低

```typescript
import { useAccessControl } from '../../hooks/useAuthorization';
import { Permission } from '../../utils/permissions';

interface PermissionGuardProps {
  permission: Permission | Permission[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGuard({ permission, fallback, children }: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission } = useAccessControl();

  const check = Array.isArray(permission)
    ? hasAnyPermission(permission)
    : hasPermission(permission);

  return check ? <>{children}</> : <>{fallback}</>;
}
```

#### 步骤 5：创建 UnauthorizedAlert 组件

**文件：`frontend/components/access/UnauthorizedAlert.tsx`**

**操作：** 创建可复用的访问拒绝提示组件
**原因：** 一致的未授权访问 UX
**依赖：** 无
**风险：** 低

```typescript
interface UnauthorizedAlertProps {
  feature?: string;
}

export function UnauthorizedAlert({ feature = '此功能' }: UnauthorizedAlertProps) {
  return (
    <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200/50 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <svg className="h-6 w-6 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m3 4h6a2 2 0 0 1 2.83 2.83L21 8M5 19h14a2 2 0 0 1 2v6a2 2 0 0 0-2H7a2 2 0 0 0 0 0z" />
        </svg>
        <div>
          <h3 className="font-semibold text-amber-800">访问受限</h3>
          <p className="text-sm text-amber-700">
            {feature} 仅对超级管理员开放。您的当前账号权限不足。
          </p>
        </div>
      </div>
    </div>
  );
}
```

#### 步骤 6：更新 App.tsx 包含 AccessControlProvider

**文件：`frontend/App.tsx`**

**操作：** 用 AccessControlProvider 包装应用
**原因：** 使访问控制在整个应用中可用
**依赖：** 步骤 2
**风险：** 中等（影响整个应用）

```typescript
import { AccessControlProvider } from './contexts/AccessControlContext';

// 在 App 组件的 return 语句中：
return (
  <AuthProvider>
    <AccessControlProvider>
      <LanguageProvider>
        {/* ... */}
      </LanguageProvider>
    </AccessControlProvider>
  </AuthProvider>
);
```

### 阶段 2：组件级 RBAC 实施

#### 步骤 7：更新 Dashboard 组件

**文件：`frontend/components/Dashboard.tsx`**

**操作：**
1. 导入 `useAuthorization` 钩子
2. 为非管理员用户隐藏导出按钮
3. 为普通成员用户隐藏业务场景视图模式
4. 为成员用户在业务场景处显示受限访问提示

**原因：** 仪表盘包含管理员专属功能
**依赖：** 阶段 1 完成
**风险：** 中等

**变更内容：**
```typescript
const Dashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const { canViewBusinessScenarios, canExportData } = useAuthorization();
  // ...

  // 隐藏导出按钮
  {!canExportData() && (
    // 不要渲染导出按钮
  )}

  // 过滤视图模式
  const viewModeOptions = [
    { value: 'overview', label: t('dashViewOverview') },
    { value: 'language', label: t('dashViewLanguage') },
    // 仅管理员可见业务场景
    ...(canViewBusinessScenarios() ? [
      { value: 'consultation', label: t('tabPresales') },
      { value: 'transaction', label: t('tabInsales') },
      { value: 'support', label: t('tabAftersales') },
      { value: 'operations', label: t('tabLogistics') },
      { value: 'feedback', label: t('tabReviews') },
    ] : []),
  ];
};
```

#### 步骤 8：更新 SearchResults 组件

**文件：`frontend/components/SearchResults.tsx`**

**操作：**
1. 导入 `useAuthorization` 和 `PermissionGuard`
2. 根据用户角色过滤语料数据
3. 为成员用户隐藏下载按钮
4. 在私有/官方语料上为成员显示"私有"标签

**原因：** 成员用户不应访问私有语料或下载数据
**依赖：** 阶段 1 完成
**风险：** 中等

**变更内容：**
```typescript
const SearchResults: React.FC<SearchResultsProps> = ({ ... }) => {
  const { canDownloadCorpus, canViewAllCorpora } = useAuthorization();

  // 根据角色过滤数据
  const filteredResults = results.filter(item => {
    // 域于域的过滤
    if (!selectedDomain) return true;
    if (!item.tags?.some(tag => tag.type === selectedDomain)) return false;

    // 基于角色的过滤
    if (!canViewAllCorpora()) {
      // 成员用户只能看到公开/通用语料
      return item.tags?.some(tag => tag.type === 'general');
    }
    return true;
  });

  // 为成员禁用下载按钮
  <button
    disabled={!canDownloadCorpus()}
    className={!canDownloadCorpus() ? 'opacity-50 cursor-not-allowed' : ''}
  >
    <Download size={18} />
  </button>;
};
```

#### 步骤 9：更新 SamplePreview 组件

**文件：`frontend/components/SamplePreview.tsx`**

**操作：**
1. 导入授权工具
2. 为成员用户隐藏语用层和风格层数据
3. 为成员用户显示限止视图（基础层+语言层）
4. 为成员用户显示访问受限的横幅提示

**原因：** 详细的标注数据可能敏感
**依赖：** 阶段 1 完成
**风险：** 低-中

**变更内容：**
```typescript
const SamplePreview: React.FC<SamplePreviewProps> = ({ ... }) => {
  const { canViewFullPreview } = useAuthorization();

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-20">
      {/* 成员用户访问受限警告 */}
      {!canViewFullPreview() && (
        <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200/50 px-6 py-3">
          <p className="text-sm text-amber-700">
            限止预览：完整标注信息仅对超级管理员开放。
          </p>
        </div>
      )}

      {/* 为成员用户隐藏语用层和风格层 */}
      {canViewFullPreview() && (
        <div className="right-sidebar">
          {/* 语用层 */}
        </div>
      )}
    </div>
  );
};
```

#### 步骤 10：更新 Navbar 组件

**文件：`frontend/components/Navbar.tsx`**

**操作：**
1. 在菜单中添加用户角色的视觉指示
2. 考虑添加管理员专属菜单项（如"管理员面板"）
3. 保留现有角色显示功能

**原因：** 导航中的清晰角色指示
**依赖：** 阶段 1 完成
**风险：** 低

**变更内容：**
```typescript
const Navbar: React.FC<NavbarProps> = ({ ... }) => {
  const { user } = useAuth();
  const { canViewAdminPanel } = useAuthorization();

  return (
    <nav>
      {/* 如果是管理员，显示管理员面板链接 */}
      {canViewAdminPanel() && (
        <a href="#" className="...">
          管理员面板
        </a>
      )}
    </nav>
  );
};
```

#### 步骤 11：更新 Hero 组件

**文件：`frontend/components/Hero.tsx`**

**操作：**
1. 保留现有认证检查（非基于角色）
2. 考虑添加关于访问级别的提示
3. 确保搜索对成员用户仍然允许（公开语料）

**原因：** 搜索入口点应指示访问级别
**依赖：** 无（保持现有行为）
**风险：** 低

### 阶段 3：后端 API 准备

#### 步骤 12：更新 AuthContext API 调用

**文件：`frontend/contexts/AuthContext.tsx`**

**操作：**
1. 确保所有 API 调用包含授权头
2. 准备基于角色的响应过滤
3. 如需要，添加 token 刷新逻辑

**原因：** 后端将需要强制执行 RBAC
**依赖：** 后端 API 变更
**风险：** 中等（API 契约变更）

**变更内容：**
```typescript
// 确保 apiRequest 包含授权
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
```

### 阶段 4：测试和验证

#### 步骤 13：创建 RBAC 测试场景

**文件：`frontend/__tests__/rbac.test.tsx`

**操作：**
1. 测试管理员对所有功能的访问
2. 测试成员用户的受限访问
3. 测试未认证用户的访问
4. 测试权限工具
5. 测试不同角色的 UI 组件

**原因：** 确保 RBAC 正确工作
**依赖：** 所有之前的步骤
**风险：** 低（仅测试）

**单元测试：**
- `frontend/utils/permissions.ts` - 权限映射准确性
- `frontend/contexts/AccessControlContext.tsx` - 授权谓词逻辑
- `frontend/hooks/useAuthorization.ts` - 授权检查
- `frontend/components/access/PermissionGuard.tsx` - 组件条件渲染

**集成测试流：**
1. 管理员登录 → 仪表盘完整访问 ✓
2. 成员登录 → 仪表盘受限访问 ✓
3. 管理员搜索 → 查看所有语料 ✓
4. 成员搜索 → 仅查看公开语料 ✓
5. 管理员预览 → 完整标注数据 ✓
6. 成员预览 → 限止标注数据 ✓
7. 导出按钮可见性（仅管理员）✓
8. 下载按钮功能（仅管理员）✓

#### 步骤 14：手动测试清单

**操作：**
1. 管理员用户流程验证
2. 普通成员用户流程验证
3. 验证优雅降级
4. 检查浏览器 DevTools 中隐藏元素
5. 验证无控制台错误

**原因：** 手动验证 UX
**依赖：** 所有实施步骤
**风险：** 低

## 风险评估和缓解措施

| 风险 | 严重性 | 缓解措施 |
|-------|-------|---------|
| 客户端 RBAC 可被绕过 | 高 | 这仅是 UX 层实施，后端必须实施服务端 RBAC 才能真正安全数据 |
| 破坏现有用户工作流 | 中 | 渐进式实施，彻底测试 |
| 性能影响 | 低 | 在上下文中缓存权限计算 |

## 安全注意事项

### 客户端安全
1. **纵深防御**：客户端 RBAC 是 UX，不是安全
2. **禁用而非隐藏**：禁用功能，不要只隐藏它
3. **API 授权**：所有 API 调用必须包含授权头
4. **无硬编码秘密**：不要在代码中嵌入管理员凭据

### 后端要求（未来实施）
1. JWT token 应包含角色声明
2. 所有端点必须验证用户角色
3. 数据库层面的过滤，不仅是响应层
4. 每用户层级的速率限制
5. 管理员操作的审计日志

## 成功标准

- [ ] 管理员用户可以访问所有仪表盘功能
- [ ] 管理员用户可以查看所有语料（公开、官方、社区、合成）
- [ ] 管理员用户可以导出数据
- [ ] 管理员用户可以下载语料
- [ ] 管理员用户可以看到完整样本预览（所有层）
- [ ] 普通成员用户可以访问基本仪表盘概览
- [ ] 普通成员用户无法查看详细业务场景视图
- [ ] 普通成员用户只能查看公开/通用语料
- [ ] 普通成员用户无法导出数据
- [ ] 普通成员用户无法下载语料
- [ ] 普通成员用户只能看到限止样本预览（基础层+语言层）
- [ ] 未认证用户访问受限功能时会被提示登录
- [ ] 访问被拒绝时有清晰的视觉反馈
- [ ] 无控制台错误与授权相关
- [ ] 角色切换（登出/登录）正确更新 UI
- [ ] 所有现有功能对管理员用户保持完整

## 注意事项

1. **后端依赖**：此计划专注于前端 RBAC 实施。后端 API 预期将独立强制执行基于角色的数据过滤。

2. **数据所有权**：目前没有用户拥有数据的概念。未来迭代可能添加"我的语料"功能，允许成员上传和管理自己的数据集。

3. **可扩展性**：权限系统设计为可扩展。额外的角色（如"审核员"、"高级用户"）可以在不进行重大重构的情况下添加。

4. **测试环境**：使用提供的测试凭据（admin：Yanzhi2026）测试管理员功能。

---

**生成时间**：2025-02-13
**计划版本**：1.0
**作者**：Claude Code Planner Agent
