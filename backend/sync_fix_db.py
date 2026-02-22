from sqlalchemy import create_engine, text
import os
from pathlib import Path
from dotenv import load_dotenv

def fix_db_sync():
    print("🚀 正在通过同步引擎修复数据库...")
    
    # 手动加载 .env
    env_path = Path(".env")
    load_dotenv(env_path)
    
    host = os.getenv('DB_HOST', 'localhost')
    port = os.getenv('DB_PORT', '3306')
    user = os.getenv('DB_USER', 'root')
    password = os.getenv('DB_PASSWORD', '')
    database = os.getenv('DB_NAME', 'corpus_management')
    
    url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"
    print(f"🔗 连接到: {host}:{port}/{database}")
    
    engine = create_engine(url)
    
    with engine.begin() as conn:
        print("📋 检查表结构...")
        res = conn.execute(text("DESCRIBE statistics_cache"))
        cols = {row[0]: row[1] for row in res.fetchall()}
        print(f"当前字段: {cols}")
        
        # 1. 修改 stat_value 为 TEXT
        if 'stat_value' in cols:
            print("📋 正在修改 stat_value 字段类型为 TEXT...")
            conn.execute(text("ALTER TABLE statistics_cache MODIFY COLUMN stat_value TEXT NOT NULL"))
            
        # 2. 检查 extra_metadata 并重命名为 metadata
        if 'extra_metadata' in cols:
            print("📋 发现旧字段 extra_metadata，正在重命名为 metadata...")
            try:
                conn.execute(text("ALTER TABLE statistics_cache CHANGE extra_metadata metadata JSON NULL"))
            except:
                conn.execute(text("ALTER TABLE statistics_cache RENAME COLUMN extra_metadata TO metadata"))
        elif 'metadata' not in cols:
            print("📋 正在添加 metadata 字段...")
            conn.execute(text("ALTER TABLE statistics_cache ADD COLUMN metadata JSON NULL"))
            
        print("✓ 修复完成！再次验证结果...")
        res = conn.execute(text("DESCRIBE statistics_cache"))
        print(f"最后结果: {res.fetchall()}")

if __name__ == "__main__":
    fix_db_sync()
