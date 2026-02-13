"""
数据库初始化脚本
运行此脚本来初始化数据库和创建表结构
"""
import asyncio
import pymysql
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from pathlib import Path

# 数据库配置
DB_CONFIG = {
    'host': '192.168.31.11',
    'port': 3306,
    'user': 'root',
    'password': '123456',
    'charset': 'utf8mb4'
}

DB_NAME = 'corpus_management'


def create_database():
    """创建数据库（如果不存在）"""
    print(f"🔌 连接到 MySQL 服务器: {DB_CONFIG['host']}:{DB_CONFIG['port']}")

    try:
        # 先连接到 MySQL 服务器（不指定数据库）
        connection = pymysql.connect(**DB_CONFIG)
        cursor = connection.cursor()

        # 创建数据库
        cursor.execute(
            f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` "
            f"DEFAULT CHARACTER SET utf8mb4 "
            f"DEFAULT COLLATE utf8mb4_unicode_ci"
        )
        print(f"✓ 数据库 '{DB_NAME}' 已就绪")

        cursor.close()
        connection.close()

    except Exception as e:
        print(f"✗ 创建数据库失败: {e}")
        raise


def execute_schema():
    """执行 schema.sql 脚本"""
    # 构建 SQLAlchemy 连接 URL
    database_url = f"mysql+pymysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_NAME}?charset=utf8mb4"

    print(f"🔌 连接到数据库: {DB_NAME}")

    # 读取 schema.sql
    schema_path = Path(__file__).parent / "schema.sql"
    with open(schema_path, 'r', encoding='utf-8') as f:
        sql_script = f.read()

    try:
        # 创建引擎
        engine = create_engine(database_url, echo=True)

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
                        print(f"⚠ 执行语句时出错: {e}")
                        print(f"   语句: {statement[:100]}...")

        print("✓ 数据库表结构创建成功")

        # 验证管理员账户
        with engine.begin() as conn:
            result = conn.execute(text("SELECT username, email, role FROM users WHERE username = 'admin'"))
            admin = result.fetchone()
            if admin:
                print(f"✓ 管理员账户已创建: {admin[0]} ({admin[2]})")
            else:
                print("⚠ 管理员账户未找到")

        engine.dispose()

    except Exception as e:
        print(f"✗ 执行 schema 失败: {e}")
        raise


async def verify_initial_admin():
    """验证初始管理员账户"""
    # 密码: Yanzhi2026 的 bcrypt 哈希
    expected_hash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7xT8aH4q6u"

    database_url = f"mysql+aiomysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_NAME}?charset=utf8mb4"

    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
    from sqlalchemy.orm import sessionmaker

    engine = create_async_engine(database_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        from sqlalchemy import text
        result = await session.execute(
            text("SELECT id, username, password_hash, role FROM users WHERE username = 'admin'")
        )
        admin = result.fetchone()

        if admin:
            print(f"✓ 管理员账户验证通过:")
            print(f"   - 用户名: {admin[1]}")
            print(f"   - 角色: {admin[3]}")
            print(f"   - 密码: Yanzhi2026")
        else:
            print("⚠ 管理员账户未找到，请检查 schema.sql")

    await engine.dispose()


def main():
    """主函数"""
    print("=" * 50)
    print("语料库管理平台 - 数据库初始化")
    print("=" * 50)

    try:
        # 步骤 1: 创建数据库
        create_database()

        # 步骤 2: 执行 schema
        execute_schema()

        # 步骤 3: 验证管理员账户（异步）
        asyncio.run(verify_initial_admin())

        print("\n" + "=" * 50)
        print("✓ 数据库初始化完成！")
        print("=" * 50)
        print("\n📝 登录信息:")
        print("   用户名: admin")
        print("   密码: Yanzhi2026")
        print("\n💡 请运行 'python -m api.main' 启动 API 服务器")

    except Exception as e:
        print(f"\n✗ 初始化失败: {e}")
        raise


if __name__ == "__main__":
    main()
