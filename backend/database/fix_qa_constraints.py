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

async def fix_constraints():
    print(f"🚀 Fixing constraints in {DB_CONFIG['database']}...")
    
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
            # 1. Fix qa_samples
            print("🔧 Updating 'qa_samples' unique constraint...")
            # Detect existing unique index name
            cursor.execute("SHOW INDEX FROM qa_samples WHERE Key_name = 'uk_qa_id'")
            if cursor.fetchone():
                cursor.execute("ALTER TABLE qa_samples DROP INDEX uk_qa_id")
            
            # Add new composite index
            cursor.execute("ALTER TABLE qa_samples ADD UNIQUE KEY `uk_qa_corpus_id` (`corpus_id`, `qa_id`)")
            
            # 2. Fix terminology_samples
            print("🔧 Updating 'terminology_samples' unique constraint...")
            cursor.execute("SHOW INDEX FROM terminology_samples WHERE Column_name = 'term_id' AND Non_unique = 0")
            row = cursor.fetchone()
            if row:
                index_name = row[2] # Key_name
                cursor.execute(f"ALTER TABLE terminology_samples DROP INDEX {index_name}")
            
            # Add new composite index
            cursor.execute("ALTER TABLE terminology_samples ADD UNIQUE KEY `uk_term_corpus_id` (`corpus_id`, `term_id`)")
            
        connection.commit()
        print("✅ Constraints fixed successfully!")
    except Exception as e:
        print(f"❌ Fix failed: {e}")
    finally:
        connection.close()

if __name__ == "__main__":
    asyncio.run(fix_constraints())
