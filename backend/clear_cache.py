import os
import pymysql

# 手动解析 .env 文件（如果存在），支持多种编码
env_vars = {}
for encoding in ['utf-8', 'gbk', 'utf-16']:
    try:
        if os.path.exists(".env"):
            with open(".env", "r", encoding=encoding) as f:
                for line in f:
                    if "=" in line and not line.startswith("#"):
                        parts = line.strip().split("=", 1)
                        if len(parts) == 2:
                            key, value = parts
                            env_vars[key] = value
            break # 成功读取则退出循环
    except Exception:
        continue

host = env_vars.get('DB_HOST', 'localhost')
port = int(env_vars.get('DB_PORT', '3306'))
user = env_vars.get('DB_USER', 'root')
password = env_vars.get('DB_PASSWORD', '')
database = env_vars.get('DB_NAME', 'corpus_management')

try:
    connection = pymysql.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=database,
        charset='utf8mb4'
    )
    cursor = connection.cursor()
    sql = "DELETE FROM statistics_cache WHERE stat_type = 'corpus_freq'"
    cursor.execute(sql)
    connection.commit()
    print("✓ Statistics cache cleared successfully.")
except Exception as e:
    print(f"✗ Failed to clear cache: {e}")
finally:
    if 'connection' in locals():
        connection.close()
