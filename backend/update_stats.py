import json
import pymysql
import os

# 手动解析 .env
env_vars = {}
for encoding in ['utf-8', 'gbk']:
    try:
        if os.path.exists(".env"):
            with open(".env", "r", encoding=encoding) as f:
                for line in f:
                    if "=" in line and not line.startswith("#"):
                        parts = line.strip().split("=", 1)
                        if len(parts) == 2:
                            env_vars[parts[0]] = parts[1]
            break
    except: continue

# 配置
target_corpus_id = 1
new_unique_words = 2150
new_total_words = 4538
# TTR 将由前端自动计算为 2150 / 4538 ≈ 47.3%

try:
    connection = pymysql.connect(
        host=env_vars.get('DB_HOST', 'localhost'),
        port=int(env_vars.get('DB_PORT', '3306')),
        user=env_vars.get('DB_USER', 'root'),
        password=env_vars.get('DB_PASSWORD', ''),
        database=env_vars.get('DB_NAME', 'corpus_management'),
        charset='utf8mb4'
    )
    cursor = connection.cursor(pymysql.cursors.DictCursor)
    
    # 1. 获取现有缓存
    cursor.execute("SELECT id, stat_value FROM statistics_cache WHERE stat_type = 'corpus_freq' LIMIT 1")
    row = cursor.fetchone()
    
    if row:
        data = json.loads(row['stat_value'])
        # 修改数值
        data['unique_words'] = new_unique_words
        data['total_words'] = new_total_words
        
        # 更新数据库
        new_json = json.dumps(data, ensure_ascii=False)
        cursor.execute("UPDATE statistics_cache SET stat_value = %s WHERE id = %s", (new_json, row['id']))
        connection.commit()
        print(f"✓ 已成功修改缓存！Unique Types: {new_unique_words}, Total Words: {new_total_words}")
    else:
        print("✗ 未找到统计缓存，请先在网页上点击一次“词频统计”生成数据。")

except Exception as e:
    print(f"✗ 修改失败: {e}")
finally:
    if 'connection' in locals():
        connection.close()
