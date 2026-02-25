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
    print(f"🚀 Starting scenario table migration for {DB_CONFIG['database']}...")
    
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
            # Create scenario_samples table
            print("📝 Ensuring 'scenario_samples' table exists...")
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS `scenario_samples` (
              `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
              `corpus_id` INT UNSIGNED NOT NULL COMMENT '所属语料库ID',
              `instruction_id` VARCHAR(50) NOT NULL COMMENT '指令唯一标识',
              `instruction_type` VARCHAR(50) DEFAULT NULL COMMENT '指令类型',
              `task` TEXT DEFAULT NULL COMMENT '任务描述',
              `output` TEXT DEFAULT NULL COMMENT '输出内容',
              `tags` JSON DEFAULT NULL COMMENT '标签列表',
              `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
              PRIMARY KEY (`id`),
              UNIQUE KEY `uk_scenario_corpus_id` (`corpus_id`, `instruction_id`),
              KEY `idx_corpus_id` (`corpus_id`),
              CONSTRAINT `fk_scenario_corpus_id` FOREIGN KEY (`corpus_id`) REFERENCES `corpora` (`id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='场景指令语料样本表'
            """)
            
        connection.commit()
        print("✅ Migration completed successfully!")
    except Exception as e:
        print(f"❌ Migration failed: {e}")
    finally:
        connection.close()

if __name__ == "__main__":
    asyncio.run(migrate())
