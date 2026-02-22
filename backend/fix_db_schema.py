import os
import asyncio
from pathlib import Path
from sqlalchemy import text
from database.connection import async_engine

async def fix_schema():
    print("🚀 正在修复数据库结构...")
    try:
        async with async_engine.begin() as conn:
            # 1. 修改 stat_value 长度从 255 增加到 TEXT
            print("📋 正在修改 stat_value 字段类型为 TEXT...")
            await conn.execute(text("ALTER TABLE statistics_cache MODIFY COLUMN stat_value TEXT NOT NULL;"))
            
            # 2. 检查并重命名 extra_metadata 为 metadata (如果存在的话)
            # 根据用户截图，已经是 metadata 了，但为了保险起见，我们做一个检查
            print("📋 检查字段名...")
            # 注意：在 MySQL 中，如果字段已经是 metadata，下面的 rename 会报错，所以我们先查询一下
            result = await conn.execute(text("SHOW COLUMNS FROM statistics_cache;"))
            columns = [row[0] for row in result.fetchall()]
            
            if 'extra_metadata' in columns and 'metadata' not in columns:
                print("📋 发现旧字段 extra_metadata，正在重命名为 metadata...")
                await conn.execute(text("ALTER TABLE statistics_cache CHANGE extra_metadata metadata JSON NULL;"))
            elif 'metadata' not in columns:
                print("📋 正在创建 metadata 字段...")
                await conn.execute(text("ALTER TABLE statistics_cache ADD COLUMN metadata JSON NULL AFTER stat_value;"))
            
            print("✓ 数据库结构修复完成！")
            
    except Exception as e:
        print(f"✗ 修复失败: {e}")

if __name__ == "__main__":
    # 加载环境变量
    from dotenv import load_dotenv
    env_path = Path(__file__).parent / ".env"
    load_dotenv(env_path)
    
    asyncio.run(fix_schema())
