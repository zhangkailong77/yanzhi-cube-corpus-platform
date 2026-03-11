"""
语料库服务层
"""
import hashlib
import io
import json
import os
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from sqlalchemy.orm import selectinload
from typing import Optional, List, Dict, Any
from api.models.corpus import Corpus, Sample, CorpusTag
from api.models.terminology import TerminologySample
from api.models.qa import QASample
from api.models.alignment import AlignmentSample
from api.models.process import ProcessSample
from api.models.case import CaseSample
from api.models.scenario import ScenarioSample
from api.models.audio import AudioSample
from api.schemas.corpus import (
    CorpusItem, CorpusListResponse, SampleListResponse,
    CorpusSample, DashboardOverviewResponse, DashboardStatsResponse,
    CategoryStat, ScenarioTag, KWICResponse, KWICResultItem
)
from datetime import datetime, timedelta


MINIO_AUDIO_CORPUS_ID = -1
_minio_audio_cache: Dict[str, Any] = {
    "manifest_key": None,
    "manifest": None,
}


def get_minio_audio_config() -> dict:
    return {
        "endpoint": os.getenv("MINIO_AUDIO_ENDPOINT", "112.124.32.196:9000"),
        "access_key": os.getenv("MINIO_AUDIO_ACCESS_KEY", "admin"),
        "secret_key": os.getenv("MINIO_AUDIO_SECRET_KEY", "Yanzhi2026."),
        "secure": os.getenv("MINIO_AUDIO_SECURE", "false").lower() in ("1", "true", "yes"),
        "bucket": os.getenv("MINIO_AUDIO_BUCKET", "indonesian-voice"),
        "object_name": os.getenv("MINIO_AUDIO_OBJECT", "octava/indonesian-voice-transcription-1.0/data/train-00000-of-00023.parquet"),
        "cache_prefix": os.getenv("MINIO_AUDIO_CACHE_PREFIX", "cache/minio-audio-preview"),
        "enabled": os.getenv("MINIO_AUDIO_ENABLED", "true").lower() in ("1", "true", "yes")
    }


def get_minio_audio_virtual_corpus_item() -> CorpusItem:
    cfg = get_minio_audio_config()
    corpus_name = Path(cfg["object_name"]).name or "MinIO Audio Preview"
    return CorpusItem(
        id=MINIO_AUDIO_CORPUS_ID,
        name=corpus_name,
        sentences="--",
        sTok="--",
        tTok="--",
        tags=[],
        domain="audio",
        source_type="official",
        is_public=True
    )


def get_minio_audio_virtual_corpus_detail() -> dict:
    cfg = get_minio_audio_config()
    corpus_name = Path(cfg["object_name"]).name or "MinIO Audio Preview"
    sentence_count = 0
    try:
        manifest = _load_or_build_minio_audio_manifest()
        sentence_count = int(manifest.get("total", 0))
    except Exception:
        logger.exception("Failed to load MinIO audio manifest for detail")
    return {
        "id": MINIO_AUDIO_CORPUS_ID,
        "name": corpus_name,
        "description": f"Live preview from MinIO: {cfg['bucket']}/{cfg['object_name']}",
        "source_lang": "id",
        "target_lang": "id",
        "source_name": "Indonesian",
        "target_name": "Indonesian",
        "sentence_count": sentence_count,
        "source_token_count": 0,
        "target_token_count": 0,
        "domain": "audio",
        "source_type": "official",
        "is_public": True,
    }


def _get_minio_client(cfg: dict):
    from minio import Minio

    return Minio(
        cfg["endpoint"],
        access_key=cfg["access_key"],
        secret_key=cfg["secret_key"],
        secure=cfg["secure"]
    )


def _is_supported_audio_ext(ext: str) -> bool:
    return ext in [".wav", ".mp3", ".flac", ".ogg", ".m4a", ".aac", ".opus"]


def _pick_transcript_for_minio_row(row: dict) -> str:
    for key in ["sentence", "transcript", "text", "raw_text", "target_text", "output"]:
        val = row.get(key)
        if isinstance(val, str) and val.strip():
            return val
    return ""


def _build_minio_cache_prefix(cfg: dict, etag: str) -> str:
    cache_hash = hashlib.md5(f"{cfg['bucket']}/{cfg['object_name']}:{etag}".encode("utf-8")).hexdigest()[:16]
    return f"{cfg['cache_prefix'].rstrip('/')}/{cache_hash}"


def _load_or_build_minio_audio_manifest() -> dict:
    cfg = get_minio_audio_config()
    if not cfg["enabled"]:
        return {"total": 0, "items": []}

    client = _get_minio_client(cfg)
    source_stat = client.stat_object(cfg["bucket"], cfg["object_name"])
    source_etag = str(source_stat.etag or "")
    cache_base = _build_minio_cache_prefix(cfg, source_etag)
    manifest_object_name = f"{cache_base}/manifest.json"

    if (
        _minio_audio_cache["manifest"] is not None and
        _minio_audio_cache["manifest_key"] == manifest_object_name
    ):
        return _minio_audio_cache["manifest"]

    try:
        manifest_resp = client.get_object(cfg["bucket"], manifest_object_name)
        try:
            manifest = json.loads(manifest_resp.read().decode("utf-8"))
            _minio_audio_cache["manifest"] = manifest
            _minio_audio_cache["manifest_key"] = manifest_object_name
            return manifest
        finally:
            manifest_resp.close()
            manifest_resp.release_conn()
    except Exception:
        # 缓存不存在，走首次构建
        pass

    import pandas as pd

    response = client.get_object(cfg["bucket"], cfg["object_name"])
    try:
        raw_data = response.read()
    finally:
        response.close()
        response.release_conn()

    df = pd.read_parquet(io.BytesIO(raw_data))
    rows = df.to_dict(orient="records")
    uploaded_cache_keys: set[str] = set()
    items: List[dict] = []

    for idx, row in enumerate(rows, start=1):
        if not isinstance(row, dict):
            continue

        audio_obj = row.get("audio")
        transcript = _pick_transcript_for_minio_row(row)
        audio_id = f"AUDIO-{idx}"

        item = {
            "audio_id": audio_id,
            "transcript": transcript,
            "language": "id",
        }

        if isinstance(audio_obj, dict):
            audio_bytes = audio_obj.get("bytes")
            audio_path = audio_obj.get("path")

            if isinstance(audio_bytes, (bytes, bytearray)) and audio_bytes:
                ext = ".wav"
                if isinstance(audio_path, str) and "." in audio_path:
                    ext_candidate = Path(audio_path).suffix.lower()
                    if _is_supported_audio_ext(ext_candidate):
                        ext = ext_candidate

                digest = hashlib.md5(bytes(audio_bytes)).hexdigest()
                cache_audio_object = f"{cache_base}/audio/{digest}{ext}"
                item["audio_object"] = cache_audio_object

                if cache_audio_object not in uploaded_cache_keys:
                    body = bytes(audio_bytes)
                    client.put_object(
                        cfg["bucket"],
                        cache_audio_object,
                        io.BytesIO(body),
                        length=len(body),
                        content_type="audio/mpeg" if ext == ".mp3" else "audio/wav"
                    )
                    uploaded_cache_keys.add(cache_audio_object)

            elif isinstance(audio_path, str) and audio_path.startswith(("http://", "https://")):
                item["external_audio_url"] = audio_path

        if "audio_object" in item or "external_audio_url" in item:
            items.append(item)

    manifest = {
        "version": 1,
        "source": {
            "bucket": cfg["bucket"],
            "object_name": cfg["object_name"],
            "etag": source_etag
        },
        "cache_base": cache_base,
        "total": len(items),
        "items": items
    }

    manifest_bytes = json.dumps(manifest, ensure_ascii=False).encode("utf-8")
    client.put_object(
        cfg["bucket"],
        manifest_object_name,
        io.BytesIO(manifest_bytes),
        length=len(manifest_bytes),
        content_type="application/json"
    )

    _minio_audio_cache["manifest"] = manifest
    _minio_audio_cache["manifest_key"] = manifest_object_name
    return manifest


def get_minio_audio_samples(page: int = 1, limit: int = 10) -> SampleListResponse:
    cfg = get_minio_audio_config()
    manifest = _load_or_build_minio_audio_manifest()
    rows = manifest.get("items", [])
    total = int(manifest.get("total", len(rows)))
    start = max(0, (page - 1) * limit)
    end = min(total, start + limit)
    page_rows = rows[start:end]

    client = _get_minio_client(cfg)
    items: List[dict] = []
    for idx, row in enumerate(page_rows, start=start + 1):
        if not isinstance(row, dict):
            continue

        audio_url = row.get("external_audio_url")
        if not audio_url and row.get("audio_object"):
            audio_url = client.get_presigned_url(
                "GET",
                cfg["bucket"],
                row["audio_object"],
                expires=timedelta(hours=12)
            )

        if not audio_url:
            continue

        items.append({
            "type": "audio",
            "id": idx,
            "audio_id": row.get("audio_id", f"AUDIO-{idx}"),
            "audio_url": audio_url,
            "transcript": row.get("transcript", ""),
            "duration_seconds": None,
            "language": row.get("language", "id")
        })

    return SampleListResponse(items=items, total=total, page=page, limit=limit)


def format_number(num: int) -> str:
    """格式化数字，添加千分位逗号"""
    return f"{num:,}"


async def get_corpora_list(
    db: AsyncSession,
    source_lang: Optional[str] = None,
    target_lang: Optional[str] = None,
    domain: Optional[str] = None,
    source_type: Optional[str] = None,
    is_public: Optional[bool] = None,
    page: int = 1,
    limit: int = 20
) -> CorpusListResponse:
    """获取语料库列表"""
    # 构建查询
    query = select(Corpus).options(selectinload(Corpus.tags))

    # 添加过滤条件
    if source_lang:
        query = query.where(Corpus.source_lang == source_lang)
    if target_lang:
        query = query.where(Corpus.target_lang == target_lang)
    if domain:
        query = query.where(Corpus.domain == domain)
    if source_type:
        query = query.where(Corpus.source_type == source_type)
    if is_public is not None:
        query = query.where(Corpus.is_public == is_public)

    # 获取总数
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # 分页
    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    corpora = result.scalars().all()

    # 转换为前端需要的格式
    items = []
    for corpus in corpora:
        tags = [ScenarioTag(label=tag.tag_label, type=tag.tag_type) for tag in corpus.tags] if corpus.tags else []
        items.append(CorpusItem(
            id=corpus.id,
            name=corpus.name,
            sentences=format_number(corpus.sentence_count),
            sTok=format_number(corpus.source_token_count),
            tTok=format_number(corpus.target_token_count),
            tags=tags,
            domain=corpus.domain,
            source_type=corpus.source_type,
            is_public=corpus.is_public
        ))

    return CorpusListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit
    )


async def get_corpus_samples(
    db: AsyncSession,
    corpus_id: int,
    page: int = 1,
    limit: int = 10
) -> SampleListResponse:
    """获取语料样本列表"""
    # 1. 首先获取语料库信息，确定类型
    corpus_result = await db.execute(select(Corpus).where(Corpus.id == corpus_id))
    corpus = corpus_result.scalar_one_or_none()
    
    if not corpus:
        return SampleListResponse(items=[], total=0, page=page, limit=limit)

    # 2. 根据 domain 决定查询哪张表
    # 如果 domain 是 terminology，则查询 terminology_samples 表
    if corpus.domain == "terminology":
        query = select(TerminologySample).where(TerminologySample.corpus_id == corpus_id)
        
        # 获取总数
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # 分页
        query = query.offset((page - 1) * limit).limit(limit)
        result = await db.execute(query)
        samples = result.scalars().all()

        # 转换为术语类格式 (前端通过 SampleListResponse.items 类型区分)
        # 注意：这里我们可能需要稍微调整 SampleListResponse 以允许不同格式的 items
        # 或者在前端通过数据中的特定字段（如 term_id）来判断渲染组件
        items = []
        for sample in samples:
            # 将术语数据平原化或包装成前端容易识别的结构
            items.append({
                "type": "terminology",
                "id": sample.id,
                "term_id": sample.term_id,
                "term": sample.term,
                "abbreviation": sample.abbreviation,
                "category": sample.category,
                "definition": sample.definition,
                "examples": sample.examples or [],
                "related_terms": sample.related_terms or [],
                "translations": sample.translations or {},
                "tags": sample.tags or []
            })
    elif corpus.domain == "qa":
        query = select(QASample).where(QASample.corpus_id == corpus_id)
        
        # 获取总数
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # 分页
        query = query.offset((page - 1) * limit).limit(limit)
        result = await db.execute(query)
        samples = result.scalars().all()

        items = []
        for sample in samples:
            items.append({
                "type": "qa",
                "id": sample.id,
                "qa_id": sample.qa_id,
                "question": sample.question,
                "question_type": sample.question_type,
                "answer": sample.answer,
                "keywords": sample.keywords or [],
                "category": sample.category,
                "tags": sample.tags or []
            })
    elif corpus.domain == "alignment":
        query = select(AlignmentSample).where(AlignmentSample.corpus_id == corpus_id)
        
        # 获取总数
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # 分页
        query = query.offset((page - 1) * limit).limit(limit)
        result = await db.execute(query)
        samples = result.scalars().all()

        items = []
        for sample in samples:
            items.append({
                "type": "alignment",
                "id": sample.id,
                "alignment_id": sample.alignment_id,
                "source_text": sample.source_text,
                "target_text": sample.target_text,
                "context": sample.context,
                "domain": sample.domain
            })
    elif corpus.domain == "process":
        query = select(ProcessSample).where(ProcessSample.corpus_id == corpus_id)
        
        # 获取总数
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # 分页
        query = query.offset((page - 1) * limit).limit(limit)
        result = await db.execute(query)
        samples = result.scalars().all()

        items = []
        for sample in samples:
            items.append({
                "type": "process",
                "id": sample.id,
                "rule_id": sample.rule_id,
                "scenario": sample.scenario,
                "condition": sample.condition,
                "result": sample.result,
                "category": sample.category
            })
    elif corpus.domain == "case":
        query = select(CaseSample).where(CaseSample.corpus_id == corpus_id)
        
        # 获取总数
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # 分页
        query = query.offset((page - 1) * limit).limit(limit)
        result = await db.execute(query)
        samples = result.scalars().all()

        items = []
        for sample in samples:
            items.append({
                "type": "case",
                "id": sample.id,
                "case_id": sample.case_id,
                "case_title": sample.case_title,
                "case_type": sample.case_type,
                "background": sample.background,
                "situation": sample.situation,
                "outcome": sample.outcome,
                "conclusion": sample.conclusion,
                "tags": sample.tags
            })
    elif corpus.domain in ["struction", "scenario"]:
        query = select(ScenarioSample).where(ScenarioSample.corpus_id == corpus_id)
        
        # 获取总数
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # 分页
        query = query.offset((page - 1) * limit).limit(limit)
        result = await db.execute(query)
        samples = result.scalars().all()

        items = []
        for sample in samples:
            items.append({
                "type": "scenario",
                "id": sample.id,
                "instruction_id": sample.instruction_id,
                "instruction_type": sample.instruction_type,
                "task": sample.task,
                "output": sample.output,
                "tags": sample.tags or []
            })
    elif corpus.domain == "audio":
        query = select(AudioSample).where(AudioSample.corpus_id == corpus_id)

        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        query = query.offset((page - 1) * limit).limit(limit)
        result = await db.execute(query)
        samples = result.scalars().all()

        items = []
        for sample in samples:
            items.append({
                "type": "audio",
                "id": sample.id,
                "audio_id": sample.audio_id,
                "audio_url": sample.audio_url,
                "transcript": sample.transcript,
                "duration_seconds": sample.duration_seconds,
                "language": sample.language
            })
    else:
        # 查询普通样本表
        query = select(Sample).where(Sample.corpus_id == corpus_id)

        # 获取总数
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # 分页
        query = query.offset((page - 1) * limit).limit(limit)
        result = await db.execute(query)
        samples = result.scalars().all()

        # 转换为四层标注格式
        items = []
        for sample in samples:
            items.append(CorpusSample(
                basic_layer={
                    "sentence_id": sample.sentence_id,
                    "timestamp": sample.timestamp.isoformat() if sample.timestamp else None,
                    "platform": sample.platform
                },
                language_layer={
                    "source_text_zh": sample.source_text if corpus_id else "",
                    "raw_text_ms": sample.raw_text or "",
                    "normalized_text_ms": sample.normalized_text or "",
                    "english_loanwords": sample.english_loanwords or []
                },
                pragmatic_layer={
                    "intent": sample.intent or [],
                    "sentiment": sample.sentiment,
                    "business_scenario": sample.business_scenario
                },
                style_layer={
                    "style": sample.style,
                    "contains_rojak": sample.contains_rojak,
                    "abbreviations_handled": sample.abbreviations_handled or {}
                }
            ))

    return SampleListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit
    )


async def get_overview_stats(db: AsyncSession) -> DashboardOverviewResponse:
    """获取首页统计概览"""
    # 获取语料库数量
    corpus_count_result = await db.execute(select(func.count(Corpus.id)))
    corpus_count = corpus_count_result.scalar() or 0

    # 获取总句子对数
    total_pairs_result = await db.execute(select(func.sum(Corpus.sentence_count)))
    total_pairs = total_pairs_result.scalar() or 0

    # 获取语言数量（不重复的语言种类，不考虑方向）
    from sqlalchemy import func as sql_func, union, literal_column
    lang_source = select(literal_column('source_lang')).select_from(Corpus).distinct()
    lang_target = select(literal_column('target_lang')).select_from(Corpus).distinct()
    # 使用 UNION 来合并两种语言，然后去重计数
    lang_combined = union(
        select(Corpus.source_lang.label('lang')),
        select(Corpus.target_lang.label('lang'))
    ).subquery()
    lang_count_result = await db.execute(
        select(sql_func.count(sql_func.distinct(lang_combined.c.lang)))
    )
    language_count = lang_count_result.scalar() or 0

    # 获取各域统计
    domain_stats_result = await db.execute(
        select(Corpus.domain, func.sum(Corpus.sentence_count))
        .group_by(Corpus.domain)
    )
    domain_stats = domain_stats_result.all()

    total_for_percent = total_pairs if total_pairs > 0 else 1
    categories = []
    domain_names = {
        "ecommerce": "Product Availability",
        "tourism": "Travel & Tourism",
        "business": "Business Communication",
        "economy": "Economy & Finance",
        "general": "General",
        "audio": "Audio Corpus"
    }
    for domain, count in domain_stats:
        categories.append(CategoryStat(
            name=domain_names.get(domain, domain),
            sentences=format_number(count),
            percent=f"{round(count / total_for_percent * 100, 1)}"
        ))

    return DashboardOverviewResponse(
        corpus_count=f"{format_number(corpus_count)}+",
        total_pairs=f"{format_number(total_pairs)}+",
        language_count=f"{language_count}+",
        categories=categories
    )


async def get_dashboard_stats(db: AsyncSession) -> DashboardStatsResponse:
    """获取仪表盘详细统计"""

    # KPI 数据
    total_sentences_result = await db.execute(select(func.sum(Corpus.sentence_count)))
    total_sentences = total_sentences_result.scalar() or 0

    # 时间线数据（模拟）
    timeline_data = []
    for i in range(12):
        timeline_data.append({
            "month": f"2024-{i+1:02d}",
            "count": max(1000, total_sentences // 12 - 10000 + (i * 5000))
        })

    # 意图分布
    intents = [
        {"label": "Availability Inquiry", "val": 450, "w": "90%"},
        {"label": "Credibility Check", "val": 320, "w": "70%"},
        {"label": "Negotiation", "val": 250, "w": "55%"},
        {"label": "Payment Inquiry", "val": 180, "w": "40%"},
        {"label": "Shipping Status", "val": 150, "w": "35%"},
    ]

    # 情感分布
    sentiment_distribution = {
        "positive": 20,
        "neutral": 65,
        "negative": 10,
        "angry": 5
    }

    # 渠道情感
    channel_sentiment = [
        {"channel": "Chat", "positive": 60, "negative": 10, "score": 4.2},
        {"channel": "Email", "positive": 55, "negative": 15, "score": 3.8},
        {"channel": "Social", "positive": 40, "negative": 35, "score": 2.5},
    ]

    # 获取样本数据
    samples_query = select(Sample).limit(3)
    samples_result = await db.execute(samples_query)
    samples_data = samples_result.scalars().all()

    samples = []
    for sample in samples_data:
        samples.append(CorpusSample(
            basic_layer={
                "sentence_id": sample.sentence_id,
                "timestamp": sample.timestamp.isoformat() if sample.timestamp else None,
                "platform": sample.platform
            },
            language_layer={
                "source_text_zh": sample.source_text[:100] + "..." if sample.source_text and len(sample.source_text) > 100 else sample.source_text or "",
                "raw_text_ms": sample.raw_text[:100] + "..." if sample.raw_text and len(sample.raw_text) > 100 else sample.raw_text or "",
                "normalized_text_ms": sample.normalized_text or "",
                "english_loanwords": sample.english_loanwords or []
            },
            pragmatic_layer={
                "intent": sample.intent or [],
                "sentiment": sample.sentiment,
                "business_scenario": sample.business_scenario
            },
            style_layer={
                "style": sample.style,
                "contains_rojak": sample.contains_rojak,
                "abbreviations_handled": sample.abbreviations_handled or {}
            }
        ))

    # 借词统计
    loanwords = [
        {"word": "brg", "count": 5420},
        {"word": "x", "count": 4890},
        {"word": "yg", "count": 3210},
        {"word": "sdh", "count": 2800},
        {"word": "tgl", "count": 2150},
    ]

    # 标准化映射
    normalization_map = [
        {"source": "brg", "target": "barang", "count": 5420},
        {"source": "x", "target": "tak", "count": 4890},
        {"source": "yg", "target": "yang", "count": 3210},
    ]

    # 风格分布
    style_distribution = [
        {"scenario": "Consultation", "colloquial": 85, "formal": 15},
        {"scenario": "Official Announcements", "colloquial": 10, "formal": 90},
        {"scenario": "Customer Service", "colloquial": 60, "formal": 40},
        {"scenario": "Product Reviews", "colloquial": 75, "formal": 25},
    ]

    return DashboardStatsResponse(
        total_sentences=format_number(total_sentences),
        sentences_growth="+12.5%",
        avg_quality_score="4.2",
        quality_target="4.0",
        localization_value="68.4%",
        timeline_data=timeline_data,
        intents=intents,
        sentiment_distribution=sentiment_distribution,
        channel_sentiment=channel_sentiment,
        samples=samples,
        loanwords=loanwords,
        normalization_map=normalization_map,
        style_distribution=style_distribution
    )


# ===================== KWIC 分析服务 =====================
async def get_kwic_analysis(
    db: AsyncSession,
    corpus_id: int,
    keyword: str,
    context_window: int = 5,
    domain: Optional[str] = None,
    page: int = 1,
    limit: int = 50
) -> KWICResponse:
    """获取关键词语境分析结果"""
    from sqlalchemy import select, func
    from api.models.corpus import Sample, Corpus
    
    # 1. 获取语料库信息确定类型
    corpus_result = await db.execute(select(Corpus).where(Corpus.id == corpus_id))
    corpus = corpus_result.scalar_one_or_none()
    
    if not corpus:
        return KWICResponse(items=[], total=0, keyword=keyword, page=page, limit=limit)

    # 2. 根据 domain 确定查询的表和字段
    model = Sample
    text_fields = ['normalized_text', 'raw_text']
    
    if corpus.domain == "terminology":
        model = TerminologySample
        text_fields = ['term', 'definition', 'examples']
    elif corpus.domain == "qa":
        model = QASample
        text_fields = ['question', 'answer']
    elif corpus.domain == "alignment":
        model = AlignmentSample
        text_fields = ['source_text', 'target_text']
    elif corpus.domain == "process":
        model = ProcessSample
        text_fields = ['scenario', 'condition', 'result']
    elif corpus.domain == "case":
        model = CaseSample
        text_fields = ['case_title', 'background', 'situation', 'outcome', 'conclusion']
    elif corpus.domain in ["struction", "scenario"]:
        model = ScenarioSample
        text_fields = ['task', 'output']
    elif corpus.domain == "audio":
        model = AudioSample
        text_fields = ['transcript']

    # 构建基础查询
    query = select(model).where(model.corpus_id == corpus_id)

    # 获取总数
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # 分页
    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    samples = result.scalars().all()

    # 构建 KWIC 结果
    kwic_results = []
    keyword_lower = keyword.lower()

    for row in samples:
        # 合并所有相关文本字段进行搜索
        texts_to_search = []
        for field in text_fields:
            val = getattr(row, field, "")
            if val:
                if isinstance(val, list):
                    texts_to_search.extend([str(item) for item in val if item])
                else:
                    texts_to_search.append(str(val))
        
        full_text = " | ".join(texts_to_search)
        full_text_lower = full_text.lower()
        
        # 查找关键词位置
        keyword_pos = full_text_lower.find(keyword_lower)
        if keyword_pos == -1:
            continue

        # 简单的分词和上下文提取
        words = full_text.split()
        keyword_word_index = -1
        for i, word in enumerate(words):
            if keyword_lower in word.lower():
                keyword_word_index = i
                break
        
        if keyword_word_index == -1:
            continue

        # 提取上下文
        left_words = words[max(0, keyword_word_index - context_window):keyword_word_index]
        right_words = words[keyword_word_index + 1:keyword_word_index + 1 + context_window]
        
        left_context = " ".join(left_words)
        right_context = " ".join(right_words)

        # 构造详细数据 (如果是通用 Sample 使用 detail 结构，否则直接用 row.to_dict)
        sample_detail = {}
        if hasattr(row, 'sentence_id'):
            sample_detail["sentence_id"] = row.sentence_id
        else:
            # 针对扩展表，构造一个虚拟的 ID 或使用主键
            uid_field = next((f for f in ['term_id', 'qa_id', 'alignment_id', 'rule_id', 'case_id', 'instruction_id', 'audio_id'] if hasattr(row, f)), 'id')
            sample_detail["sentence_id"] = str(getattr(row, uid_field))

        kwic_results.append(KWICResultItem(
            sentence_id=sample_detail["sentence_id"],
            left_context=left_context,
            keyword=keyword,
            right_context=right_context,
            full_data=row.to_dict() if hasattr(row, 'to_dict') else {"text": full_text}
        ))

    return KWICResponse(
        items=kwic_results,
        total=total,
        keyword=keyword,
        page=page,
        limit=limit,
        domain=domain
    )

async def get_sample_page_number(
    db: AsyncSession,
    corpus_id: int,
    sentence_id: str,
    limit: int = 10
) -> dict:
    """根据 sentence_id 查找该样本在列表中的页码"""
    from sqlalchemy import select
    from api.models.corpus import Sample, Corpus

    # 1. 获取语料库信息确定类型
    corpus_result = await db.execute(select(Corpus).where(Corpus.id == corpus_id))
    corpus = corpus_result.scalar_one_or_none()
    
    if not corpus:
        return {"page": 1, "found": False}

    # 2. 根据 domain 确定查询的表和字段
    model = Sample
    id_field_name = 'sentence_id'
    
    if corpus.domain == "terminology":
        model = TerminologySample
        id_field_name = 'term_id'
    elif corpus.domain == "qa":
        model = QASample
        id_field_name = 'qa_id'
    elif corpus.domain == "alignment":
        model = AlignmentSample
        id_field_name = 'alignment_id'
    elif corpus.domain == "process":
        model = ProcessSample
        id_field_name = 'rule_id'
    elif corpus.domain == "case":
        model = CaseSample
        id_field_name = 'case_id'
    elif corpus.domain in ["struction", "scenario"]:
        model = ScenarioSample
        id_field_name = 'instruction_id'
    elif corpus.domain == "audio":
        model = AudioSample
        id_field_name = 'audio_id'

    # 获取该语料库所有样本的 id 列表（按默认排序，通常是 ID 升序）
    id_attr = getattr(model, id_field_name)
    query = select(id_attr).where(model.corpus_id == corpus_id).order_by(model.id.asc())
    result = await db.execute(query)
    rows = result.scalars().all()

    # 查找目标 ID 的位置（0-indexed）
    position = -1
    for idx, val in enumerate(rows):
        if str(val) == str(sentence_id):
            position = idx
            break

    if position == -1:
        return {"page": 1, "found": False}

    # 计算页码（1-indexed）
    page = (position // limit) + 1
    return {"page": page, "found": True}


# ===================== 词频统计服务 =====================
async def get_corpus_frequency_stats(db, corpus_id: int):
    from sqlalchemy import select
    from api.models.corpus import Sample, StatisticsCache, Corpus
    import json

    # 1. 获取语料库信息确定类型
    corpus_result = await db.execute(select(Corpus).where(Corpus.id == corpus_id))
    corpus = corpus_result.scalar_one_or_none()
    
    if not corpus:
        return {'total_words': 0, 'unique_words': 0, 'pos_distribution': {}, 'frequency_data': []}

    # 2. 查询缓存
    cache_query = select(StatisticsCache).where(
        StatisticsCache.stat_type == 'corpus_freq',
        StatisticsCache.stat_key == str(corpus_id)
    )
    cache_result = await db.execute(cache_query)
    cache_record = cache_result.scalar_one_or_none()

    if cache_record: # Restore cache logic
        try:
            return json.loads(cache_record.stat_value)
        except json.JSONDecodeError:
            pass

    # 3. 确定查询的表和字段
    model = Sample
    text_fields = ['normalized_text', 'raw_text']
    
    if corpus.domain == "terminology":
        model = TerminologySample
        text_fields = ['term', 'definition', 'examples']
    elif corpus.domain == "qa":
        model = QASample
        text_fields = ['keywords']  # 按照用户要求，QA类别使用 keywords 字段进行统计
    elif corpus.domain == "alignment":
        model = AlignmentSample
        text_fields = ['target_text']  # 按照用户要求，对齐类别只统计 target_text
    elif corpus.domain == "process":
        model = ProcessSample
        text_fields = ['scenario', 'condition', 'result']
    elif corpus.domain == "case":
        model = CaseSample
        text_fields = ['case_title', 'background', 'situation', 'outcome', 'conclusion']
    elif corpus.domain in ["struction", "scenario"]:
        model = ScenarioSample
        text_fields = ['task', 'output']
    elif corpus.domain == "audio":
        model = AudioSample
        text_fields = ['transcript']

    # 4. 从数据库加载所有样本计算频次 (耗时操作)
    from sqlalchemy.inspection import inspect
    # 获取模型中存在的列
    columns = [getattr(model, field) for field in text_fields if hasattr(model, field)]
    sample_query = select(*columns).where(model.corpus_id == corpus_id)
    samples_result = await db.execute(sample_query)
    
    word_map = {}
    total_words = 0
    pos_counts = {'noun': 0, 'verb': 0, 'adj': 0, 'other': 0}

    # 简易分词逻辑
    import re
    stop_words = {'dan', 'yang', 'di', 'ke', 'dari', 'ini', 'itu', 'pada', 'untuk', 'dengan'}

    for row_data in samples_result.all():
        # 合并当前行的所有文本
        row_texts = []
        for val in row_data:
            if val:
                if isinstance(val, list):
                    # 如果是 JSON 数组字段 (如 QA 的 keywords)
                    row_texts.extend([str(item) for item in val if item])
                else:
                    row_texts.append(str(val))
        
        # 如果是 QA 类别，keywords 已经是词了，不需要再进行复杂正则分词
        if corpus.domain == "qa":
            for word in row_texts:
                word_clean = word.strip().lower()
                if word_clean and len(word_clean) > 1:
                    total_words += 1
                    if word_clean not in word_map:
                        word_map[word_clean] = {'count': 0, 'pos': 'other'}
                    word_map[word_clean]['count'] += 1
            continue

        full_text = " ".join(row_texts)
        if not full_text:
            continue
        
        # 兼容 Unicode 的分词逻辑 (支持越南语、马来语等拉丁系以及泰语等)
        # 匹配包含字母的单词，考虑到越南语等有大量变体字符，以及泰语范围 \u0E00-\u0E7F
        words = re.findall(r'\b[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF-]+\b|[\u0E00-\u0E7F]+', full_text.lower())
        for word in words:
            if len(word) > 1:
                total_words += 1
                if word not in word_map:
                    word_map[word] = {'count': 0, 'pos': 'other'}
                word_map[word]['count'] += 1

    # 简易词性标注 - 针对马来语特征全面优化
    for word, data in word_map.items():
        # 1. 形容词判定 (最高级前缀 ter- 或 现代马来语借词后缀)
        if (word.startswith('ter') or 
            word.endswith(('if', 'ik', 'is', 'al'))):
            data['pos'] = 'adj'
            pos_counts['adj'] += data['count']
        # 2. 动词判定 (丰富的前缀 + 后缀)
        elif (word.startswith(('me', 'di', 'ber', 'pe', 'ke')) or 
              word.endswith(('kan', 'i'))):
            # 注意：pe/ke 有时也是名词前缀，但在简易逻辑下优先归类为动作/状态
            data['pos'] = 'verb'
            pos_counts['verb'] += data['count']
        # 3. 名词判定 (典型的名词后缀)
        elif word.endswith(('an', 'nya')):
            data['pos'] = 'noun'
            pos_counts['noun'] += data['count']
        else:
            pos_counts['other'] += data['count']

    # 词表已经建立，记录去重后的全量词数（包含停用词）
    unique_words_total = len(word_map)

    # 排序并返回几乎全量的去重词汇 (由前端根据 activeTab 过滤)
    # 取前 400 个，足以覆盖绝大多数单库预览需求，且避免数据库 TEXT 字段长度超标
    # 同时过滤掉长度异常的“词”（主要是解决泰语未分词导致的超长句子问题）
    frequency_data = []
    sorted_words = sorted(word_map.items(), key=lambda x: x[1]['count'], reverse=True)
    
    count_limit = 0
    for word, data in sorted_words:
        if count_limit >= 400:
            break
        # 如果词长超过 50 个字符，大概率是泰语等未分词的句子，过滤掉以防数据库崩溃
        if len(word) > 50:
            continue
            
        percent = round((data['count'] / max(total_words, 1)) * 1000) / 10
        frequency_data.append({
            'word': word,
            'count': data['count'],
            'percent': percent,
            'pos': data['pos']
        })
        count_limit += 1

    result_dict = {
        'total_words': total_words,
        'unique_words': unique_words_total,
        'pos_distribution': pos_counts,
        'frequency_data': frequency_data
    }

    # 3. 写入缓存
    json_val = json.dumps(result_dict, ensure_ascii=False)
    if cache_record:
        cache_record.stat_value = json_val
    else:
        new_cache = StatisticsCache(
            stat_type='corpus_freq',
            stat_key=str(corpus_id),
            stat_value=json_val
        )
        db.add(new_cache)
    await db.commit()

    return result_dict
