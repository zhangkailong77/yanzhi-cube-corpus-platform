"""
重置管理员密码
"""
import asyncio
import os
from pathlib import Path
from passlib.context import CryptContext
from sqlalchemy import create_engine, select, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

# 加载环境变量
from dotenv import load_dotenv
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# 数据库配置（从环境变量读取）
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', '3306')),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'charset': 'utf8mb4'
}

DB_NAME = os.getenv('DB_NAME', 'corpus_management')
USERNAME = 'admin'
NEW_PASSWORD = os.getenv('ADMIN_RESET_PASSWORD', 'Yanzhi2026.')


def get_password_hash(password: str) -> str:
    """生成密码哈希"""
    pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
    return pwd_context.hash(password)


async def reset_password():
    """重置密码"""
    # 生成新的哈希
    new_hash = get_password_hash(NEW_PASSWORD)
    print(f"新密码哈希: {new_hash}")

    # 创建数据库连接
    database_url = f"mysql+aiomysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_NAME}?charset=utf8mb4"

    engine = create_async_engine(database_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # 更新密码
        stmt = text("""
            UPDATE users
            SET password_hash = :hash
            WHERE username = :username
        """)
        result = await session.execute(stmt, {"hash": new_hash, "username": USERNAME})
        await session.commit()

        if result.rowcount > 0:
            print(f"✓ 密码已重置:")
            print(f"   用户名: {USERNAME}")
            print(f"   密码: {NEW_PASSWORD}")
        else:
            print(f"✗ 用户 '{USERNAME}' 不存在")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(reset_password())
