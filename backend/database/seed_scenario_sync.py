
import os
import json
import pymysql
from pathlib import Path
from dotenv import load_dotenv

# Load env
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = int(os.getenv('DB_PORT', '3306'))
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'corpus_management')

def seed_scenario():
    print(f"🚀 (Sync) Seeding Scenario data into {DB_NAME}...")
    
    # Path to scenario_zh.json
    res_path = Path(__file__).parent.parent.parent / "docs" / "resource" / "class6" / "scenario_zh.json"
    if not res_path.exists():
        print(f"❌ File not found: {res_path}")
        return

    with open(res_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        samples = data.get('data', [])

    conn = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        charset='utf8mb4'
    )
    
    try:
        with conn.cursor() as cursor:
            # 1. Create or get Corpus
            cursor.execute("SELECT id FROM corpora WHERE name = %s", ("场景指令示例库",))
            res = cursor.fetchone()
            
            if not res:
                cursor.execute("""
                    INSERT INTO corpora (name, description, domain, source_lang, target_lang, source_name, target_name, sentence_count, is_public)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, ("场景指令示例库", "Class 6 Scenario Data for testing", "scenario", "zh", "zh", "Input", "Output", 0, 1))
                conn.commit()
                corpus_id = conn.insert_id()
                print(f"✅ Created Corpus: {corpus_id}")
            else:
                corpus_id = res[0]
                print(f"ℹ️ Using existing Corpus: {corpus_id}")

            # 2. Add Samples
            count = 0
            for idx, item in enumerate(samples[:20]):
                inst_id = item.get('instruction_id', f"INST-SEED-{idx}")
                
                # Check exist
                cursor.execute("SELECT id FROM scenario_samples WHERE corpus_id = %s AND instruction_id = %s", (corpus_id, inst_id))
                if cursor.fetchone():
                    continue

                cursor.execute("""
                    INSERT INTO scenario_samples (corpus_id, instruction_id, instruction_type, task, output, tags)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (corpus_id, inst_id, item.get('instruction_type', 'scenario'), item.get('task', ''), item.get('output', ''), json.dumps(item.get('tags', []))))
                count += 1
            
            # Update count
            cursor.execute("UPDATE corpora SET sentence_count = sentence_count + %s WHERE id = %s", (count, corpus_id))
            conn.commit()
            print(f"✅ Imported {count} scenario samples.")

    finally:
        conn.close()

if __name__ == "__main__":
    seed_scenario()
