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
    '$2b$12$rZoA.3yTmjtiKhKzaTRr3OFcrrkx9OyNMaKHeFmSSIsu75kdcejhm',
    'admin@yanzhi.com',
    'admin'
) ON DUPLICATE KEY UPDATE `username` = `username`;

-- ============================================
-- 语料库表
-- ============================================
DROP TABLE IF EXISTS `corpora`;

CREATE TABLE `corpora` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '语料库ID',
  `name` VARCHAR(200) NOT NULL COMMENT '语料库名称',
  `description` TEXT DEFAULT NULL COMMENT '语料库描述',
  `source_lang` VARCHAR(10) NOT NULL COMMENT '源语言代码',
  `target_lang` VARCHAR(10) NOT NULL COMMENT '目标语言代码',
  `source_name` VARCHAR(50) NOT NULL COMMENT '源语言名称',
  `target_name` VARCHAR(50) NOT NULL COMMENT '目标语言名称',
  `sentence_count` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '句子数',
  `source_token_count` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '源语言 token 数',
  `target_token_count` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '目标语言 token 数',
  `domain` ENUM('ecommerce', 'tourism', 'business', 'economy', 'general') NOT NULL DEFAULT 'general' COMMENT '业务域',
  `source_type` ENUM('official', 'community', 'synthetic') NOT NULL DEFAULT 'official' COMMENT '数据来源类型',
  `is_public` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否公开',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_lang_pair` (`source_lang`, `target_lang`),
  KEY `idx_domain` (`domain`),
  KEY `idx_source_type` (`source_type`),
  KEY `idx_is_public` (`is_public`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='语料库表';

-- ============================================
-- 语料样本表
-- ============================================
DROP TABLE IF EXISTS `samples`;

CREATE TABLE `samples` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '样本ID',
  `corpus_id` INT UNSIGNED NOT NULL COMMENT '所属语料库ID',
  `sentence_id` VARCHAR(50) NOT NULL COMMENT '句子唯一标识',
  `platform` VARCHAR(50) DEFAULT NULL COMMENT '来源平台',
  `timestamp` DATETIME DEFAULT NULL COMMENT '时间戳',

  -- 语言层 (language_layer)
  `source_text` TEXT NOT NULL COMMENT '源语言文本',
  `raw_text` TEXT DEFAULT NULL COMMENT '原始目标语言文本',
  `normalized_text` TEXT DEFAULT NULL COMMENT '标准化目标语言文本',
  `english_loanwords` JSON DEFAULT NULL COMMENT '英语借词列表',

  -- 语用层 (pragmatic_layer)
  `intent` JSON DEFAULT NULL COMMENT '意图列表',
  `sentiment` ENUM('neutral', 'positive', 'negative', 'angry') DEFAULT 'neutral' COMMENT '情感极性',
  `business_scenario` ENUM('pre-sales', 'in-sales', 'after-sales') DEFAULT NULL COMMENT '业务场景',

  -- 风格层 (style_layer)
  `style` VARCHAR(50) DEFAULT NULL COMMENT '文本风格',
  `contains_rojak` BOOLEAN DEFAULT FALSE COMMENT '是否包含混合语言',
  `abbreviations_handled` JSON DEFAULT NULL COMMENT '缩写映射表',

  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sentence_id` (`sentence_id`),
  KEY `idx_corpus_id` (`corpus_id`),
  KEY `idx_sentiment` (`sentiment`),
  KEY `idx_business_scenario` (`business_scenario`),
  KEY `idx_style` (`style`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='语料样本表';

-- ============================================
-- 语料库域标签关联表
-- ============================================
DROP TABLE IF EXISTS `corpus_tags`;

CREATE TABLE `corpus_tags` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `corpus_id` INT UNSIGNED NOT NULL COMMENT '语料库ID',
  `tag_label` VARCHAR(50) NOT NULL COMMENT '标签名称',
  `tag_type` ENUM('ecommerce', 'tourism', 'business', 'economy', 'general') NOT NULL COMMENT '标签类型',
  PRIMARY KEY (`id`),
  KEY `idx_corpus_id` (`corpus_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 统计概览缓存表
-- ============================================
DROP TABLE IF EXISTS `statistics_cache`;

CREATE TABLE `statistics_cache` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `stat_type` VARCHAR(50) NOT NULL COMMENT '统计类型',
  `stat_key` VARCHAR(100) NOT NULL COMMENT '统计键',
  `stat_value` VARCHAR(255) NOT NULL COMMENT '统计值',
  `metadata` JSON DEFAULT NULL COMMENT '附加元数据',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_type_key` (`stat_type`, `stat_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='统计缓存表';

-- ============================================
-- 数据库初始化完成
-- ============================================
