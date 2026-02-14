"""
语料库数据迁移脚本
将初始语料库和样本数据插入数据库
"""
import asyncio
import pymysql
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from pathlib import Path
from datetime import datetime
import json
from dotenv import load_dotenv

# 加载环境变量
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


def get_password_hash(password: str) -> str:
    """生成密码哈希（这里不需要，只是为了引用）"""
    return ""


# 初始语料库数据
CORPORA_DATA = [
    {
        "name": "Tatoeba v2023-04-12",
        "description": "Tatoeba 多语言平行句对数据集",
        "source_lang": "en",
        "target_lang": "zh",
        "source_name": "English",
        "target_name": "Chinese",
        "sentence_count": 47378,
        "source_token_count": 48303,
        "target_token_count": 332218,
        "domain": "general",
        "source_type": "community",
        "is_public": False,
    },
    {
        "name": "OpenSubtitles v2018",
        "description": "电影和电视剧字幕平行语料",
        "source_lang": "en",
        "target_lang": "zh",
        "source_name": "English",
        "target_name": "Chinese",
        "sentence_count": 1204500,
        "source_token_count": 8402100,
        "target_token_count": 9120440,
        "domain": "general",
        "source_type": "official",
        "is_public": False,
    },
    {
        "name": "Shopee E-commerce CS",
        "description": "Shopee 电商客服对话语料",
        "source_lang": "zh",
        "target_lang": "ms",
        "source_name": "Chinese",
        "target_name": "Malay",
        "sentence_count": 35000,
        "source_token_count": 280000,
        "target_token_count": 320000,
        "domain": "ecommerce",
        "source_type": "official",
        "is_public": True,
        "tags": ["E-commerce", "Customer Service", "Shopee"]
    },
    {
        "name": "Traveloka Tourism",
        "description": "Traveloka 旅游平台语料",
        "source_lang": "en",
        "target_lang": "th",
        "source_name": "English",
        "target_name": "Thai",
        "sentence_count": 28000,
        "source_token_count": 196000,
        "target_token_count": 210000,
        "domain": "tourism",
        "source_type": "official",
        "is_public": False,
    },
    {
        "name": "Grab Transport",
        "description": "Grab 出行平台对话语料",
        "source_lang": "en",
        "target_lang": "vi",
        "source_name": "English",
        "target_name": "Vietnamese",
        "sentence_count": 22000,
        "source_token_count": 154000,
        "target_token_count": 165000,
        "domain": "tourism",
        "source_type": "official",
        "is_public": False,
        "tags": ["Transport", "Grab", "Rideshare"]
    },
    {
        "name": "ASEAN Business News",
        "description": "东盟商业新闻平行语料",
        "source_lang": "en",
        "target_lang": "ms",
        "source_name": "English",
        "target_name": "Malay",
        "sentence_count": 15000,
        "source_token_count": 450000,
        "target_token_count": 480000,
        "domain": "business",
        "source_type": "official",
        "is_public": False,
    },
    {
        "name": "Shopee Reviews MY",
        "description": "Shopee 马来西亚商品评论语料",
        "source_lang": "ms",
        "target_lang": "en",
        "source_name": "Malay",
        "target_name": "English",
        "sentence_count": 85000,
        "source_token_count": 595000,
        "target_token_count": 620000,
        "domain": "ecommerce",
        "source_type": "community",
        "is_public": False,
    },
    {
        "name": "Thai Hotel Booking",
        "description": "泰国酒店预订对话语料",
        "source_lang": "en",
        "target_lang": "th",
        "source_name": "English",
        "target_name": "Thai",
        "sentence_count": 18000,
        "source_token_count": 126000,
        "target_token_count": 140000,
        "domain": "tourism",
        "source_type": "synthetic",
        "is_public": False,
    },
    {
        "name": "Vietnamese Banking",
        "description": "越南银行客服对话语料",
        "source_lang": "en",
        "target_lang": "vi",
        "source_name": "English",
        "target_name": "Vietnamese",
        "sentence_count": 12000,
        "source_token_count": 96000,
        "target_token_count": 108000,
        "domain": "business",
        "source_type": "official",
        "is_public": False,
        "tags": ["Banking", "Finance", "Customer Service"]
    },
    {
        "name": "Malay Economy News",
        "description": "马来西亚经济新闻语料",
        "source_lang": "ms",
        "target_lang": "zh",
        "source_name": "Malay",
        "target_name": "Chinese",
        "sentence_count": 9500,
        "source_token_count": 285000,
        "target_token_count": 310000,
        "domain": "economy",
        "source_type": "official",
        "is_public": False,
    },
]

# 样本数据
SAMPLES_DATA = [
    {
        "corpus_id": 3,  # Shopee E-commerce CS
        "sentence_id": "MY-CS-2024-1046",
        "platform": "Shopee",
        "timestamp": "2024-11-16 10:20:05",
        "source_text": "请问这件商品有红色吗？我想要红色的",
        "raw_text": "ada color merah ke? saya nak color merah",
        "normalized_text": "ada warna merah ke? saya nak warna merah",
        "english_loanwords": ["color", "red"],
        "intent": ["product_inquiry", "color_check"],
        "sentiment": "neutral",
        "business_scenario": "pre-sales",
        "style": "Colloquial",
        "contains_rojak": True,
        "abbreviations_handled": {"nak": "mahu"}
    },
    {
        "corpus_id": 3,
        "sentence_id": "MY-CS-2024-1047",
        "platform": "Shopee",
        "timestamp": "2024-11-16 10:25:30",
        "source_text": "什么时候能发货？急用",
        "raw_text": "billehleh boleh hantar? saya nak urgent",
        "normalized_text": "bila boleh hantar? saya nak urgent",
        "english_loanwords": ["urgent"],
        "intent": ["shipping_inquiry"],
        "sentiment": "positive",
        "business_scenario": "in-sales",
        "style": "Colloquial",
        "contains_rojak": False,
        "abbreviations_handled": {"bilehleh": "bila", "saya": "saya"}
    },
    {
        "corpus_id": 3,
        "sentence_id": "MY-CS-2024-1048",
        "platform": "Shopee",
        "timestamp": "2024-11-16 11:00:00",
        "source_text": "谢谢，已收到货，很满意",
        "raw_text": "tq dah sampai, berpuas hati",
        "normalized_text": "terima kasih dah sampai, berpuas hati",
        "english_loanwords": ["tq"],
        "intent": ["feedback", "thank_you"],
        "sentiment": "positive",
        "business_scenario": "after-sales",
        "style": "Colloquial",
        "contains_rojak": False,
        "abbreviations_handled": {"tq": "terima kasih"}
    },
]


def migrate_data():
    """执行数据迁移"""
    print("=" * 50)
    print("语料库数据迁移")
    print("=" * 50)

    database_url = f"mysql+pymysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_NAME}?charset=utf8mb4"

    engine = create_engine(database_url, echo=False)

    try:
        with engine.begin() as conn:
            # 插入语料库数据
            print(f"📚 插入语料库数据 ({len(CORPORA_DATA)} 条)...")

            for corpus in CORPORA_DATA:
                # 插入语料库
                stmt = text("""
                    INSERT INTO corpora (
                        name, description, source_lang, target_lang,
                        source_name, target_name, sentence_count,
                        source_token_count, target_token_count,
                        domain, source_type, is_public
                    ) VALUES (
                        :name, :description, :source_lang, :target_lang,
                        :source_name, :target_name, :sentence_count,
                        :source_token_count, :target_token_count,
                        :domain, :source_type, :is_public
                    )
                """)
                conn.execute(stmt, corpus)

                # 获取插入的 ID
                result = conn.execute(text("SELECT LAST_INSERT_ID()"))
                corpus_id = result.scalar()

                # 插入标签
                for tag_label in corpus.get("tags", []):
                    tag_type = corpus["domain"]
                    tag_stmt = text("""
                        INSERT INTO corpus_tags (corpus_id, tag_label, tag_type)
                        VALUES (:corpus_id, :tag_label, :tag_type)
                    """)
                    conn.execute(tag_stmt, {
                        "corpus_id": corpus_id,
                        "tag_label": tag_label,
                        "tag_type": tag_type
                    })

                print(f"   ✓ {corpus['name']}")

            # 插入样本数据
            print(f"\n📝 插入样本数据 ({len(SAMPLES_DATA)} 条)...")

            for sample in SAMPLES_DATA:
                stmt = text("""
                    INSERT INTO samples (
                        corpus_id, sentence_id, platform, timestamp,
                        source_text, raw_text, normalized_text, english_loanwords,
                        intent, sentiment, business_scenario,
                        style, contains_rojak, abbreviations_handled
                    ) VALUES (
                        :corpus_id, :sentence_id, :platform, :timestamp,
                        :source_text, :raw_text, :normalized_text, :english_loanwords,
                        :intent, :sentiment, :business_scenario,
                        :style, :contains_rojak, :abbreviations_handled
                    )
                """)
                # 转换 JSON 字段
                sample_copy = sample.copy()
                sample_copy["english_loanwords"] = json.dumps(sample_copy["english_loanwords"])
                sample_copy["intent"] = json.dumps(sample_copy["intent"])
                sample_copy["abbreviations_handled"] = json.dumps(sample_copy["abbreviations_handled"])
                conn.execute(stmt, sample_copy)

                print(f"   ✓ {sample['sentence_id']}")

        print("\n✓ 数据迁移完成！")

        # 验证数据
        with engine.begin() as conn:
            corpus_count = conn.execute(text("SELECT COUNT(*) FROM corpora")).scalar()
            sample_count = conn.execute(text("SELECT COUNT(*) FROM samples")).scalar()
            print(f"\n📊 数据统计:")
            print(f"   - 语料库数量: {corpus_count}")
            print(f"   - 样本数量: {sample_count}")

        engine.dispose()

    except Exception as e:
        print(f"\n✗ 数据迁移失败: {e}")
        raise


if __name__ == "__main__":
    migrate_data()
