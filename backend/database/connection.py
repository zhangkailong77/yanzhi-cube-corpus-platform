"""
数据库连接管理
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from contextlib import asynccontextmanager

# 数据库配置
DB_CONFIG = {
    'host': '192.168.31.11',
    'port': 3306,
    'user': 'root',
    'password': '123456',
    'database': 'corpus_management',
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


async def init_database():
    """初始化数据库连接（应用启动时调用）"""
    try:
        from sqlalchemy import text
        async with async_engine.begin() as conn:
            # 测试连接
            await conn.execute(text("SELECT 1"))
        print(f"✓ 数据库连接成功: {DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}")
    except Exception as e:
        print(f"✗ 数据库连接失败: {e}")
        print(f"💡 请先运行: conda run -n corpus python -m database.init_db")
        raise


async def close_database():
    """关闭数据库连接"""
    await async_engine.dispose()
    print("✓ 数据库连接已关闭")
