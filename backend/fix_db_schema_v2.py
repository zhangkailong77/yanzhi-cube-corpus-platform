import os
import asyncio
from pathlib import Path
from sqlalchemy import text
from database.connection import async_engine

async def fix_schema():
    print("🚀 正在重新修复数据库结构...")
    try:
        # 直接获取连接并执行，确保提交
        async with async_engine.connect() as conn:
            # 1. 修改 stat_value 长度从 255 增加到 TEXT
            print("📋 正在修改 stat_value 字段类型为 TEXT...")
            await conn.execute(text("ALTER TABLE statistics_cache MODIFY COLUMN stat_value TEXT NOT NULL;"))
            await conn.commit()
            
            # 2. 检查字段名
            print("📋 检查并修复字段名...")
            result = await conn.execute(text("SHOW COLUMNS FROM statistics_cache;"))
            cols_info = result.fetchall()
            columns = [c[0] for c in cols_info]
            types = {c[0]: c[1] for c in cols_info}
            
            print(f"当前字段: {columns}")
            print(f"当前类型: {types}")
            
            if 'extra_metadata' in columns:
                print("📋 发现旧字段 extra_metadata，正在重命名为 metadata...")
                # 注意：MySQL 8.0+ 支持 RENAME COLUMN，旧版本用 CHANGE
                try:
                    await conn.execute(text("ALTER TABLE statistics_cache CHANGE extra_metadata metadata JSON NULL;"))
                except:
                    await conn.execute(text("ALTER TABLE statistics_cache RENAME COLUMN extra_metadata TO metadata;"))
                await conn.commit()
            
            # 再次确认修改后结果
            result = await conn.execute(text("SHOW COLUMNS FROM statistics_cache;"))
            print(f"修复后结果: {result.fetchall()}")
            
        print("✓ 数据库结构处理完成！")
            
    except Exception as e:
        print(f"✗ 修复过程出错: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    from dotenv import load_dotenv
    env_path = Path(__file__).parent / ".env"
    load_dotenv(env_path)
    
    asyncio.run(fix_schema())
