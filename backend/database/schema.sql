-- ============================================
-- 语料库管理平台 - 数据库表结构
-- ============================================

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `corpus_management`
DEFAULT CHARACTER SET utf8mb4
DEFAULT COLLATE utf8mb4_unicode_ci;

USE `corpus_management`;

-- ============================================
-- 用户表
-- ============================================
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希（bcrypt）',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `role` ENUM('admin', 'member') NOT NULL DEFAULT 'member' COMMENT '角色：admin-超级管理员，member-普通成员',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否激活',
  `last_login_at` TIMESTAMP NULL DEFAULT NULL COMMENT '最后登录时间',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================
-- 初始管理员账户
-- ============================================
-- 用户名: admin
-- 密码: Yanzhi2026
-- bcrypt 哈希 (cost=12)

INSERT INTO `users` (`username`, `password_hash`, `email`, `role`)
VALUES (
    'admin',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7xT8aH4q6u',
    'admin@yanzhi.com',
    'admin'
) ON DUPLICATE KEY UPDATE `username` = `username`;

-- ============================================
-- 数据库初始化完成
-- ============================================
