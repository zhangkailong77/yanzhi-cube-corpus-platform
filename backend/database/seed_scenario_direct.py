
import os
import json
import asyncio
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

# Add backend to path
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from api.models.corpus import Corpus
from api.models.scenario import ScenarioSample

# Load env
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '3306')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'corpus_management')

DATABASE_URL = f"mysql+aiomysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def seed_scenario():
    print(f"🚀 Seeding Scenario data into {DB_NAME}...")
    
    # Path to scenario_zh.json
    res_path = Path(__file__).parent.parent.parent / "docs" / "resource" / "class6" / "scenario_zh.json"
    if not res_path.exists():
        print(f"❌ File not found: {res_path}")
        return

    with open(res_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        samples = data.get('data', [])

    async with AsyncSessionLocal() as session:
        # 1. Create or get Corpus
        stmt = select(Corpus).where(Corpus.name == "场景指令示例库")
        result = await session.execute(stmt)
        corpus = result.scalar_one_or_none()

        if not corpus:
            corpus = Corpus(
                name="场景指令示例库",
                description="Class 6 Scenario Data for testing",
                domain="scenario",
                source_lang="zh",
                target_lang="zh",
                source_name="Input",
                target_name="Output",
                sentence_count=0,
                is_public=True
            )
            session.add(corpus)
            await session.commit()
            await session.refresh(corpus)
            print(f"✅ Created Corpus: {corpus.id}")
        else:
            print(f"ℹ️ Using existing Corpus: {corpus.id}")

        # 2. Add Samples
        count = 0
        for idx, item in enumerate(samples[:20]): # Only 20 for preview
            # Check if exists
            inst_id = item.get('instruction_id', f"INST-SEED-{idx}")
            stmt = select(ScenarioSample).where(ScenarioSample.corpus_id == corpus.id, ScenarioSample.instruction_id == inst_id)
            exist_res = await session.execute(stmt)
            if exist_res.scalar_one_or_none():
                continue

            sample = ScenarioSample(
                corpus_id=corpus.id,
                instruction_id=inst_id,
                instruction_type=item.get('instruction_type', 'scenario'),
                task=item.get('task', ''),
                output=item.get('output', ''),
                tags=item.get('tags', [])
            )
            session.add(sample)
            count += 1
        
        corpus.sentence_count += count
        await session.commit()
        print(f"✅ Imported {count} scenario samples.")

if __name__ == "__main__":
    asyncio.run(seed_scenario())
