/**
 * Permission Utilities
 * Handles role-based access control (RBAC) permissions
 */
import type { UserRole } from '@/contexts/AuthContext';

// ==================== Permission Definitions ====================

export type Permission =
  | 'dashboard.view'                    // 查看仪表盘
  | 'dashboard.view_kpi'                  // 查看仪表盘 KPI
  | 'dashboard.view_business_scenarios'   // 查看业务场景视图
  | 'dashboard.export_data'              // 导出数据
  | 'corpus.view_all'                    // 查看所有语料
  | 'corpus.view_public_only'           // 仅查看公开语料
  | 'corpus.download'                    // 下载语料
  | 'sample.preview_full'                 // 完整样本预览
  | 'sample.preview_limited';             // 限制样本预览

// ==================== Role-Permission Mapping ====================

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // 超级管理员拥有所有权限
    'dashboard.view',
    'dashboard.view_kpi',
    'dashboard.view_business_scenarios',
    'dashboard.export_data',
    'corpus.view_all',
    'corpus.view_public_only',
    'corpus.download',
    'sample.preview_full',
    'sample.preview_limited',
  ],
  member: [
    // 普通成员只能使用公开功能和基本查看
    'dashboard.view',
    'dashboard.view_kpi',
    'corpus.view_public_only',
    'sample.preview_limited',
  ],
};

// ==================== Permission Check Functions ====================

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Check if a role has all specified permissions (AND logic)
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return permissions.every(p => rolePermissions.includes(p));
}

/**
 * Check if a role has any of the specified permissions (OR logic)
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return permissions.some(p => rolePermissions.includes(p));
}

/**
 * Check if user can access dashboard
 */
export function canAccessDashboard(role: UserRole): boolean {
  return hasPermission(role, 'dashboard.view');
}

/**
 * Check if user can view business scenarios
 */
export function canViewBusinessScenarios(role: UserRole): boolean {
  return hasPermission(role, 'dashboard.view_business_scenarios');
}

/**
 * Check if user can export data
 */
export function canExportData(role: UserRole): boolean {
  return hasPermission(role, 'dashboard.export_data');
}

/**
 * Check if user can view all corpora
 */
export function canViewAllCorpora(role: UserRole): boolean {
  return hasPermission(role, 'corpus.view_all');
}

/**
 * Check if user can download corpus
 */
export function canDownloadCorpus(role: UserRole): boolean {
  return hasPermission(role, 'corpus.download');
}

/**
 * Check if user can view full sample preview
 */
export function canViewFullSamplePreview(role: UserRole): boolean {
  return hasPermission(role, 'sample.preview_full');
}
