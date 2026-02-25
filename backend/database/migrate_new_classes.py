import asyncio
import pymysql
import os
from pathlib import Path
from dotenv import load_dotenv

# 加载环境变量
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

async def migrate():
    print(f"🚀 Starting migration for {DB_CONFIG['database']}...")
    
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
            # 1. Update Domain ENUM in corpora table
            print("📝 Updating domain ENUM in 'corpora' table...")
            new_enum = "'ecommerce', 'tourism', 'business', 'economy', 'general', 'terminology', 'qa', 'alignment', 'process', 'case', 'struction'"
            cursor.execute(f"ALTER TABLE `corpora` MODIFY COLUMN `domain` ENUM({new_enum}) NOT NULL DEFAULT 'general'")
            
            # 2. Update tag_type ENUM in corpus_tags table
            print("📝 Updating tag_type ENUM in 'corpus_tags' table...")
            cursor.execute(f"ALTER TABLE `corpus_tags` MODIFY COLUMN `tag_type` ENUM({new_enum}) NOT NULL")
            
            # 3. Create terminology_samples if missing (from schema.sql or manual)
            print("📝 Ensuring 'terminology_samples' table exists...")
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS `terminology_samples` (
              `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
              `corpus_id` INT UNSIGNED NOT NULL COMMENT '所属语料库ID',
              `term_id` VARCHAR(50) NOT NULL COMMENT '术语唯一标识',
              `term` VARCHAR(200) NOT NULL COMMENT '术语名称',
              `abbreviation` VARCHAR(50) DEFAULT NULL COMMENT '术语缩写',
              `category` VARCHAR(100) NOT NULL COMMENT '术语分类',
              `definition` TEXT NOT NULL COMMENT '术语定义',
              `examples` JSON DEFAULT NULL COMMENT '例句列表 (JSON Array)',
              `related_terms` JSON DEFAULT NULL COMMENT '相关术语列表 (JSON Array)',
              `translations` JSON DEFAULT NULL COMMENT '多语言翻译映射 (JSON Object)',
              `tags` JSON DEFAULT NULL COMMENT '标签列表 (JSON Array)',
              `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
              PRIMARY KEY (`id`),
              UNIQUE KEY `uk_term_id` (`term_id`),
              KEY `idx_corpus_id` (`corpus_id`),
              CONSTRAINT `fk_term_corpus_id` FOREIGN KEY (`corpus_id`) REFERENCES `corpora` (`id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='术语语料样本表'
            """)
            
        connection.commit()
        print("✅ Migration completed successfully!")
    except Exception as e:
        print(f"❌ Migration failed: {e}")
    finally:
        connection.close()

if __name__ == "__main__":
    asyncio.run(migrate())
