"""
数据库连接管理
"""
import os
from pathlib import Path
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from contextlib import asynccontextmanager

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
    'database': os.getenv('DB_NAME', 'corpus_management'),
    'charset': 'utf8mb4'
}

# 构建数据库 URL
DATABASE_URL_SYNC = f"mysql+pymysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}?charset=utf8mb4"
DATABASE_URL_ASYNC = f"mysql+aiomysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}?charset=utf8mb4"

# 创建异步引擎
async_engine = create_async_engine(
    DATABASE_URL_ASYNC,
    echo=True,  # 开发环境打印 SQL
    pool_pre_ping=True,
    pool_recycle=3600,
    pool_size=10,
    max_overflow=20,
)

# 创建会话工厂
async_session_maker = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db():
    """获取数据库会话（依赖注入用）"""
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def ensure_database_exists():
    """确保数据库存在，如果不存在则创建"""
    import pymysql

    # 先连接到 MySQL 服务器（不指定数据库）
    base_config = {
        'host': DB_CONFIG['host'],
        'port': DB_CONFIG['port'],
        'user': DB_CONFIG['user'],
        'password': DB_CONFIG['password'],
        'charset': 'utf8mb4'
    }

    try:
        connection = pymysql.connect(**base_config)
        cursor = connection.cursor()

        # 检查数据库是否存在
        cursor.execute(
            f"SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA "
            f"WHERE SCHEMA_NAME = '{DB_CONFIG['database']}'"
        )
        result = cursor.fetchone()

        if not result:
            # 创建数据库
            print(f"📦 数据库 '{DB_CONFIG['database']}' 不存在，正在创建...")
            cursor.execute(
                f"CREATE DATABASE IF NOT EXISTS `{DB_CONFIG['database']}` "
                f"DEFAULT CHARACTER SET utf8mb4 "
                f"DEFAULT COLLATE utf8mb4_unicode_ci"
            )
            print(f"✓ 数据库 '{DB_CONFIG['database']}' 已创建")
        else:
            print(f"✓ 数据库 '{DB_CONFIG['database']}' 已存在")

        cursor.close()
        connection.close()

    except Exception as e:
        print(f"✗ 检查/创建数据库失败: {e}")
        raise


async def ensure_tables_exist():
    """确保数据库表存在，如果不存在则创建"""
    from sqlalchemy import text, create_engine

    # 使用同步引擎执行 schema
    schema_path = Path(__file__).parent / "schema.sql"
    if not schema_path.exists():
        print(f"⚠ schema.sql 文件不存在，跳过表创建")
        return

    # 读取 schema.sql
    with open(schema_path, 'r', encoding='utf-8') as f:
        sql_script = f.read()

    database_url_sync = f"mysql+pymysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}?charset=utf8mb4"
    engine = create_engine(database_url_sync, echo=False)

    # 所有需要创建的表
    REQUIRED_TABLES = ['users', 'corpora', 'samples', 'corpus_tags', 'statistics_cache']

    try:
        # 检查所有表是否已存在
        from sqlalchemy import inspect
        inspector = inspect(engine)
        existing_tables = set(inspector.get_table_names())

        missing_tables = [t for t in REQUIRED_TABLES if t not in existing_tables]

        if not missing_tables:
            # 所有表都存在
            print(f"✓ 数据库表已存在 ({len(existing_tables)} 个表)")
            # 验证管理员账户
            with engine.begin() as conn:
                result = conn.execute(text("SELECT username, email, role FROM users WHERE username = 'admin'"))
                admin = result.fetchone()
                if admin:
                    print(f"✓ 管理员账户已存在: {admin[0]} ({admin[1]})")
                else:
                    print(f"⚠ 管理员账户不存在，将创建默认账户")
                    from passlib.context import CryptContext
                    pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
                    password_hash = pwd_context.hash('Yanzhi2026')
                    conn.execute(text(
                        "INSERT INTO `users` (`username`, `password_hash`, `email`, `role`) "
                        "VALUES (:username, :password_hash, :email, :role)"
                    ), {"username": "admin", "password_hash": password_hash, "email": "admin@yanzhi.com", "role": "admin"})
                    print(f"✓ 管理员账户已创建: admin (admin@yanzhi.com)")
            engine.dispose()
            return

        # 有缺失的表
        print(f"📋 缺少以下表: {missing_tables}，正在创建...")

    except Exception as e:
        print(f"⚠ 检查表是否存在时出错: {e}，将尝试创建表")
        missing_tables = REQUIRED_TABLES

    # 创建缺失的表
    print(f"📋 数据库表不完整，正在创建...")

    try:
        with engine.begin() as conn:
            # 分割并执行 SQL 语句
            statements = [
                s.strip()
                for s in sql_script.split(';')
                if s.strip() and not s.strip().startswith('--')
            ]

            for statement in statements:
                if statement:
                    try:
                        conn.execute(text(statement))
                    except Exception as e:
                        # 忽略已存在的表/数据库错误
                        error_str = str(e).lower()
                        if "already exists" not in error_str and "duplicate" not in error_str:
                            print(f"⚠ 执行语句时出错: {e}")
                            print(f"   语句: {statement[:100]}...")

        print("✓ 数据库表创建成功")

        # 验证管理员账户
        with engine.begin() as conn:
            result = conn.execute(text("SELECT username, email, role FROM users WHERE username = 'admin'"))
            admin = result.fetchone()
            if admin:
                print(f"✓ 管理员账户已存在: {admin[0]} ({admin[1]})")

        engine.dispose()

    except Exception as e:
        print(f"✗ 创建数据库表失败: {e}")
        raise


async def init_database():
    """初始化数据库连接（应用启动时调用）"""
    try:
        # 步骤 1: 确保数据库存在
        await ensure_database_exists()

        # 步骤 2: 确保表结构存在
        await ensure_tables_exist()

        from sqlalchemy import text
        async with async_engine.begin() as conn:
            # 测试连接
            await conn.execute(text("SELECT 1"))
        print(f"✓ 数据库连接成功: {DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}")
    except Exception as e:
        error_msg = str(e)
        if "Unknown database" in error_msg or "1049" in error_msg:
            # 数据库不存在，尝试创建
            try:
                await ensure_database_exists()
                await ensure_tables_exist()
                # 再次尝试连接
                from sqlalchemy import text
                async with async_engine.begin() as conn:
                    await conn.execute(text("SELECT 1"))
                print(f"✓ 数据库连接成功: {DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}")
            except Exception as create_error:
                print(f"✗ 数据库连接失败: {create_error}")
                raise
        else:
            print(f"✗ 数据库连接失败: {e}")
            raise


async def close_database():
    """关闭数据库连接"""
    await async_engine.dispose()
    print("✓ 数据库连接已关闭")
