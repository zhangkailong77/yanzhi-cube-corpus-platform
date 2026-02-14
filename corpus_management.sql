/*
 Navicat Premium Data Transfer

 Source Server         : localhost_3308
 Source Server Type    : MySQL
 Source Server Version : 80042 (8.0.42)
 Source Host           : localhost:3308
 Source Schema         : corpus_management

 Target Server Type    : MySQL
 Target Server Version : 80042 (8.0.42)
 File Encoding         : 65001

 Date: 14/02/2026 17:56:51
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for corpora
-- ----------------------------
DROP TABLE IF EXISTS `corpora`;
CREATE TABLE `corpora`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '语料库ID',
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '语料库名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '语料库描述',
  `source_lang` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '源语言代码',
  `target_lang` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '目标语言代码',
  `source_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '源语言名称',
  `target_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '目标语言名称',
  `sentence_count` bigint UNSIGNED NOT NULL DEFAULT 0 COMMENT '句子数',
  `source_token_count` bigint UNSIGNED NOT NULL DEFAULT 0 COMMENT '源语言 token 数',
  `target_token_count` bigint UNSIGNED NOT NULL DEFAULT 0 COMMENT '目标语言 token 数',
  `domain` enum('ecommerce','tourism','business','economy','general') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general' COMMENT '业务域',
  `source_type` enum('official','community','synthetic') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'official' COMMENT '数据来源类型',
  `is_public` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否公开',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_lang_pair`(`source_lang` ASC, `target_lang` ASC) USING BTREE,
  INDEX `idx_domain`(`domain` ASC) USING BTREE,
  INDEX `idx_source_type`(`source_type` ASC) USING BTREE,
  INDEX `idx_is_public`(`is_public` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '语料库表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of corpora
-- ----------------------------
INSERT INTO `corpora` VALUES (1, 'Tatoeba v2023-04-12', 'Tatoeba 多语言平行句对数据集', 'en', 'zh', 'English', 'Chinese', 47378, 48303, 332218, 'general', 'community', 0, '2026-02-14 11:24:18', '2026-02-14 17:15:02');
INSERT INTO `corpora` VALUES (2, 'OpenSubtitles v2018', '电影和电视剧字幕平行语料', 'en', 'zh', 'English', 'Chinese', 1204500, 8402100, 9120440, 'general', 'official', 0, '2026-02-14 11:24:18', '2026-02-14 17:15:02');
INSERT INTO `corpora` VALUES (3, 'Shopee E-commerce CS', 'Shopee 电商客服对话语料', 'zh', 'ms', 'Chinese', 'Malay', 35003, 280000, 320000, 'ecommerce', 'official', 1, '2026-02-14 11:24:18', '2026-02-14 14:35:59');
INSERT INTO `corpora` VALUES (4, 'Traveloka Tourism', 'Traveloka 旅游平台语料', 'en', 'th', 'English', 'Thai', 28000, 196000, 210000, 'tourism', 'official', 0, '2026-02-14 11:24:18', '2026-02-14 17:15:02');
INSERT INTO `corpora` VALUES (5, 'Grab Transport', 'Grab 出行平台对话语料', 'en', 'vi', 'English', 'Vietnamese', 22000, 154000, 165000, 'tourism', 'official', 0, '2026-02-14 11:24:18', '2026-02-14 11:24:18');
INSERT INTO `corpora` VALUES (6, 'ASEAN Business News', '东盟商业新闻平行语料', 'en', 'ms', 'English', 'Malay', 15000, 450000, 480000, 'business', 'official', 0, '2026-02-14 11:24:18', '2026-02-14 17:15:02');
INSERT INTO `corpora` VALUES (7, 'Shopee Reviews MY', 'Shopee 马来西亚商品评论语料', 'ms', 'en', 'Malay', 'English', 85000, 595000, 620000, 'ecommerce', 'community', 0, '2026-02-14 11:24:18', '2026-02-14 17:15:02');
INSERT INTO `corpora` VALUES (8, 'Thai Hotel Booking', '泰国酒店预订对话语料', 'en', 'th', 'English', 'Thai', 18000, 126000, 140000, 'tourism', 'synthetic', 0, '2026-02-14 11:24:18', '2026-02-14 17:15:02');
INSERT INTO `corpora` VALUES (9, 'Vietnamese Banking', '越南银行客服对话语料', 'en', 'vi', 'English', 'Vietnamese', 12000, 96000, 108000, 'business', 'official', 0, '2026-02-14 11:24:18', '2026-02-14 11:24:18');
INSERT INTO `corpora` VALUES (10, 'Malay Economy News', '马来西亚经济新闻语料', 'ms', 'zh', 'Malay', 'Chinese', 9500, 285000, 310000, 'economy', 'official', 0, '2026-02-14 11:24:18', '2026-02-14 17:15:02');

-- ----------------------------
-- Table structure for corpus_tags
-- ----------------------------
DROP TABLE IF EXISTS `corpus_tags`;
CREATE TABLE `corpus_tags`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `corpus_id` int UNSIGNED NOT NULL COMMENT '语料库ID',
  `tag_label` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '标签名称',
  `tag_type` enum('ecommerce','tourism','business','economy','general') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '标签类型',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_corpus_id`(`corpus_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 30 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of corpus_tags
-- ----------------------------
INSERT INTO `corpus_tags` VALUES (1, 1, 'General', 'general');
INSERT INTO `corpus_tags` VALUES (2, 1, 'Open Data', 'general');
INSERT INTO `corpus_tags` VALUES (3, 2, 'Movies', 'general');
INSERT INTO `corpus_tags` VALUES (4, 2, 'TV Shows', 'general');
INSERT INTO `corpus_tags` VALUES (5, 2, 'Entertainment', 'general');
INSERT INTO `corpus_tags` VALUES (6, 3, 'E-commerce', 'ecommerce');
INSERT INTO `corpus_tags` VALUES (7, 3, 'Customer Service', 'ecommerce');
INSERT INTO `corpus_tags` VALUES (8, 3, 'Shopee', 'ecommerce');
INSERT INTO `corpus_tags` VALUES (9, 4, 'Tourism', 'tourism');
INSERT INTO `corpus_tags` VALUES (10, 4, 'Travel', 'tourism');
INSERT INTO `corpus_tags` VALUES (11, 4, 'Booking', 'tourism');
INSERT INTO `corpus_tags` VALUES (12, 5, 'Transport', 'tourism');
INSERT INTO `corpus_tags` VALUES (13, 5, 'Grab', 'tourism');
INSERT INTO `corpus_tags` VALUES (14, 5, 'Rideshare', 'tourism');
INSERT INTO `corpus_tags` VALUES (15, 6, 'Business', 'business');
INSERT INTO `corpus_tags` VALUES (16, 6, 'News', 'business');
INSERT INTO `corpus_tags` VALUES (17, 6, 'Finance', 'business');
INSERT INTO `corpus_tags` VALUES (18, 7, 'E-commerce', 'ecommerce');
INSERT INTO `corpus_tags` VALUES (19, 7, 'Reviews', 'ecommerce');
INSERT INTO `corpus_tags` VALUES (20, 7, 'Social', 'ecommerce');
INSERT INTO `corpus_tags` VALUES (21, 8, 'Tourism', 'tourism');
INSERT INTO `corpus_tags` VALUES (22, 8, 'Hotels', 'tourism');
INSERT INTO `corpus_tags` VALUES (23, 8, 'Booking', 'tourism');
INSERT INTO `corpus_tags` VALUES (24, 9, 'Banking', 'business');
INSERT INTO `corpus_tags` VALUES (25, 9, 'Finance', 'business');
INSERT INTO `corpus_tags` VALUES (26, 9, 'Customer Service', 'business');
INSERT INTO `corpus_tags` VALUES (27, 10, 'Economy', 'economy');
INSERT INTO `corpus_tags` VALUES (28, 10, 'News', 'economy');
INSERT INTO `corpus_tags` VALUES (29, 10, 'Finance', 'economy');

-- ----------------------------
-- Table structure for samples
-- ----------------------------
DROP TABLE IF EXISTS `samples`;
CREATE TABLE `samples`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '样本ID',
  `corpus_id` int UNSIGNED NOT NULL COMMENT '所属语料库ID',
  `sentence_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '句子唯一标识',
  `platform` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '来源平台',
  `timestamp` datetime NULL DEFAULT NULL COMMENT '时间戳',
  `source_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '源语言文本',
  `raw_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '原始目标语言文本',
  `normalized_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '标准化目标语言文本',
  `english_loanwords` json NULL COMMENT '英语借词列表',
  `intent` json NULL COMMENT '意图列表',
  `sentiment` enum('neutral','positive','negative','angry') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'neutral' COMMENT '情感极性',
  `business_scenario` enum('pre-sales','in-sales','after-sales') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '业务场景',
  `style` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '文本风格',
  `contains_rojak` tinyint(1) NULL DEFAULT 0 COMMENT '是否包含混合语言',
  `abbreviations_handled` json NULL COMMENT '缩写映射表',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_sentence_id`(`sentence_id` ASC) USING BTREE,
  INDEX `idx_corpus_id`(`corpus_id` ASC) USING BTREE,
  INDEX `idx_sentiment`(`sentiment` ASC) USING BTREE,
  INDEX `idx_business_scenario`(`business_scenario` ASC) USING BTREE,
  INDEX `idx_style`(`style` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '语料样本表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of samples
-- ----------------------------
INSERT INTO `samples` VALUES (1, 3, 'MY-CS-2024-1046', 'Shopee', '2024-11-16 10:20:05', '请问这件商品有红色吗？我想要红色的', 'ada color merah ke? saya nak color merah', 'ada warna merah ke? saya nak warna merah', '[\"color\", \"red\"]', '[\"product_inquiry\", \"color_check\"]', 'neutral', 'pre-sales', 'Colloquial', 1, '{\"nak\": \"mahu\"}', '2026-02-14 11:24:18');
INSERT INTO `samples` VALUES (2, 3, 'MY-CS-2024-1047', 'Shopee', '2024-11-16 10:25:30', '什么时候能发货？急用', 'billehleh boleh hantar? saya nak urgent', 'bila boleh hantar? saya nak urgent', '[\"urgent\"]', '[\"shipping_inquiry\"]', 'positive', 'in-sales', 'Colloquial', 0, '{\"saya\": \"saya\", \"bilehleh\": \"bila\"}', '2026-02-14 11:24:18');
INSERT INTO `samples` VALUES (3, 3, 'MY-CS-2024-1048', 'Shopee', '2024-11-16 11:00:00', '谢谢，已收到货，很满意', 'tq dah sampai, berpuas hati', 'terima kasih dah sampai, berpuas hati', '[\"tq\"]', '[\"feedback\", \"thank_you\"]', 'positive', 'after-sales', 'Colloquial', 0, '{\"tq\": \"terima kasih\"}', '2026-02-14 11:24:18');
INSERT INTO `samples` VALUES (7, 3, 'MY-CS-2024-1056', 'Shopee', '2024-11-16 10:20:05', '老板，这个是正品吗？我今天下单的话什么时候能发货？', 'Boss, brg ni ori ke? Kalo sy order harini bila blh pos?', 'Boss, barang ini original ke? Kalau saya order hari ini bila boleh pos?', '[\"original\"]', '[\"询问真伪\", \"询问发货时间\"]', 'neutral', 'pre-sales', 'Colloquial', 1, '{\"ni\": \"ini\", \"sy\": \"saya\", \"blh\": \"boleh\", \"brg\": \"barang\", \"kalo\": \"kalau\", \"harini\": \"hari ini\"}', '2026-02-14 14:35:59');
INSERT INTO `samples` VALUES (8, 3, 'MY-CS-2024-0892', 'Shopee', '2024-11-12 14:30:00', '亲，这个还有现货吗？能便宜点吗？', 'Hi sis, brg ni ready stock ke? Boleh murah sikit tak?', 'Hi kakak, barang ini ready stock ke? Boleh murah sedikit tak?', '[\"ready stock\"]', '[\"询问库存\", \"砍价\"]', 'neutral', 'in-sales', 'Colloquial', 1, '{\"ni\": \"ini\", \"brg\": \"barang\", \"sikit\": \"sedikit\"}', '2026-02-14 14:35:59');
INSERT INTO `samples` VALUES (9, 3, 'MY-CS-2024-1055', 'TikTok', '2024-11-15 09:15:22', '我等了整整一个星期了，物流一直没更新，我要退款！', 'Dah seminggu sy tunggu tracking x update pun! Nak refund skrg jgk!', 'Sudah seminggu saya tunggu tracking tak update pun! Nak refund sekarang juga!', '[\"tracking\", \"update\", \"refund\"]', '[\"催发货\", \"退货退款\"]', 'angry', 'after-sales', 'Colloquial', 1, '{\"x\": \"tak\", \"sy\": \"saya\", \"jgk\": \"juga\", \"skrg\": \"sekarang\"}', '2026-02-14 14:35:59');

-- ----------------------------
-- Table structure for statistics_cache
-- ----------------------------
DROP TABLE IF EXISTS `statistics_cache`;
CREATE TABLE `statistics_cache`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `stat_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '统计类型',
  `stat_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '统计键',
  `stat_value` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '统计值',
  `metadata` json NULL COMMENT '附加元数据',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_type_key`(`stat_type` ASC, `stat_key` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '统计缓存表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of statistics_cache
-- ----------------------------

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名',
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码哈希（bcrypt）',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '邮箱',
  `role` enum('admin','member') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'member' COMMENT '角色：admin-超级管理员，member-普通成员',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否激活',
  `last_login_at` timestamp NULL DEFAULT NULL COMMENT '最后登录时间',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_username`(`username` ASC) USING BTREE,
  UNIQUE INDEX `uk_email`(`email` ASC) USING BTREE,
  INDEX `idx_role`(`role` ASC) USING BTREE,
  INDEX `idx_is_active`(`is_active` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'admin', '$2b$12$6SH.oyVrfmfnWVbj14A9O./fkYlU6dO.pxmed.vW4bnhO3vAS9tre', 'admin@yanzhi.com', 'admin', 1, '2026-02-14 09:30:27', '2026-02-14 09:29:50', '2026-02-14 09:30:27');
INSERT INTO `users` VALUES (2, '18250636865', '$2b$12$cLXt6ZFxqeeO1TeY9kPUSO6N6Xdgy.peDQd6Ux0PkieWd.RMHFjri', 'zhangkailong77@gmail.com', 'member', 1, '2026-02-14 17:02:08', '2026-02-14 09:30:59', '2026-02-14 17:02:08');

SET FOREIGN_KEY_CHECKS = 1;
