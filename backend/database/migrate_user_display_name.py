"""
为 users 表新增 display_name 字段，并为历史用户回填默认值。
"""
import asyncio
import os
from pathlib import Path

import pymysql
from dotenv import load_dotenv

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "3306")),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "corpus_management"),
    "charset": "utf8mb4",
}


async def migrate() -> None:
    connection = pymysql.connect(
        host=DB_CONFIG["host"],
        port=DB_CONFIG["port"],
        user=DB_CONFIG["user"],
        password=DB_CONFIG["password"],
        database=DB_CONFIG["database"],
        charset=DB_CONFIG["charset"],
    )

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT COUNT(*)
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = %s
                  AND TABLE_NAME = 'users'
                  AND COLUMN_NAME = 'display_name'
                """,
                (DB_CONFIG["database"],),
            )
            exists = int(cursor.fetchone()[0] or 0)

            if exists == 0:
                cursor.execute(
                    """
                    ALTER TABLE `users`
                    ADD COLUMN `display_name` VARCHAR(100) NULL COMMENT '显示姓名'
                    AFTER `username`
                    """
                )

            cursor.execute(
                """
                UPDATE `users`
                SET `display_name` = `username`
                WHERE `display_name` IS NULL OR TRIM(`display_name`) = ''
                """
            )

        connection.commit()
        print("✅ user.display_name migration completed")
    finally:
        connection.close()


if __name__ == "__main__":
    asyncio.run(migrate())

