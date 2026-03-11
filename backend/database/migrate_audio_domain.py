"""
为音频语料增加 domain 枚举和值表。
"""
import asyncio
import os
from pathlib import Path

import pymysql
from dotenv import load_dotenv

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', '3306')),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'corpus_management'),
    'charset': 'utf8mb4'
}


async def migrate() -> None:
    connection = pymysql.connect(
        host=DB_CONFIG['host'],
        port=DB_CONFIG['port'],
        user=DB_CONFIG['user'],
        password=DB_CONFIG['password'],
        database=DB_CONFIG['database'],
        charset=DB_CONFIG['charset']
    )

    try:
        with connection.cursor() as cursor:
            enum_values = "'ecommerce', 'tourism', 'business', 'economy', 'general', 'terminology', 'qa', 'alignment', 'process', 'case', 'struction', 'audio'"

            cursor.execute(
                f"ALTER TABLE `corpora` MODIFY COLUMN `domain` ENUM({enum_values}) NOT NULL DEFAULT 'general'"
            )
            cursor.execute(
                f"ALTER TABLE `corpus_tags` MODIFY COLUMN `tag_type` ENUM({enum_values}) NOT NULL"
            )

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS `audio_samples` (
              `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
              `corpus_id` INT UNSIGNED NOT NULL COMMENT '所属语料库ID',
              `audio_id` VARCHAR(100) NOT NULL COMMENT '音频唯一标识',
              `audio_url` TEXT NOT NULL COMMENT '音频访问地址',
              `transcript` TEXT DEFAULT NULL COMMENT '转写文本',
              `duration_seconds` VARCHAR(30) DEFAULT NULL COMMENT '音频时长（秒）',
              `language` VARCHAR(20) DEFAULT NULL COMMENT '语言代码',
              `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
              PRIMARY KEY (`id`),
              UNIQUE KEY `uk_audio_corpus_id` (`corpus_id`, `audio_id`),
              KEY `idx_audio_corpus_id` (`corpus_id`),
              CONSTRAINT `fk_audio_corpus_id` FOREIGN KEY (`corpus_id`) REFERENCES `corpora` (`id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='音频语料样本表'
            """)

        connection.commit()
        print("✅ Audio migration completed")
    finally:
        connection.close()


if __name__ == "__main__":
    asyncio.run(migrate())
