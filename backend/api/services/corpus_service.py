"""
语料库服务层
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from sqlalchemy.orm import selectinload
from typing import Optional, List, Dict, Any
from api.models.corpus import Corpus, Sample, CorpusTag
from api.schemas.corpus import (
    CorpusItem, CorpusListResponse, SampleListResponse,
    CorpusSample, DashboardOverviewResponse, DashboardStatsResponse,
    CategoryStat, ScenarioTag, KWICResponse, KWICResultItem
)
from datetime import datetime


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
    # 查询样本
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
        "general": "General"
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
    """
    获取 KWIC（关键词语境）分析结果

    参数：
        corpus_id: 语料库 ID
        keyword: 目标关键词
        context_window: 前后词数
        domain: 业务域过滤
        page: 页码
        limit: 每页数量
    """
    from sqlalchemy import select, func
    from api.models.corpus import Sample, Corpus

    # 构建基础查询 - 查询指定语料库的样本
    query = select(Sample).where(Sample.corpus_id == corpus_id)

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
    for sample in samples:
        # 提取语境 - 使用标准化文本或原始文本
        text = sample.normalized_text or sample.raw_text or ""

        # 关键词查找（找到关键词位置）
        keyword_lower = keyword.lower()
        text_lower = text.lower()

        # 查找关键词位置
        keyword_pos = text_lower.find(keyword_lower)

        if keyword_pos == -1:
            # 未找到关键词，跳过
            continue

        # 分词（按空格分词）
        words = text.split()

        # 找到关键词在哪个词
        keyword_word_index = -1
        for i, word in enumerate(words):
            if keyword_lower in word.lower():
                keyword_word_index = i
                break

        # 提取左侧语境（context_window 个词）
        left_words = []
        for i in range(keyword_word_index - context_window, keyword_word_index):
            if i >= 0:
                left_words.append(words[i])

        # 提取右侧语境（context_window 个词）
        right_words = []
        for i in range(keyword_word_index + 1, min(keyword_word_index + 1 + context_window, len(words))):
            right_words.append(words[i])

        left_context = " ".join(left_words)
        right_context = " ".join(right_words)

        kwic_results.append(KWICResultItem(
            sentence_id=sample.sentence_id,
            left_context=left_context,
            keyword=keyword,
            right_context=right_context,
            full_data={
                "sentence_id": sample.sentence_id,
                "timestamp": sample.timestamp.isoformat() if sample.timestamp else None,
                "platform": sample.platform,
                "intent": sample.intent or [],
                "sentiment": sample.sentiment,
                "business_scenario": sample.business_scenario,
                "source_text_zh": sample.source_text or "",
                "raw_text_ms": sample.raw_text or "",
                "normalized_text_ms": sample.normalized_text or "",
                "english_loanwords": sample.english_loanwords or []
            }
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
    # 获取该语料库所有样本的 id 列表（按默认排序）
    query = select(Sample.id, Sample.sentence_id).where(Sample.corpus_id == corpus_id)
    result = await db.execute(query)
    rows = result.all()

    # 查找目标 sentence_id 的位置（0-indexed）
    position = -1
    for idx, row in enumerate(rows):
        if row.sentence_id == sentence_id:
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
    from api.models.corpus import Sample, StatisticsCache
    import json

    # 1. 查询缓存
    cache_query = select(StatisticsCache).where(
        StatisticsCache.stat_type == 'corpus_freq',
        StatisticsCache.stat_key == str(corpus_id)
    )
    cache_result = await db.execute(cache_query)
    cache_record = cache_result.scalar_one_or_none()

    if cache_record:
        try:
            return json.loads(cache_record.stat_value)
        except json.JSONDecodeError:
            pass

    # 2. 从数据库加载所有样本计算频次 (耗时操作)
    sample_query = select(Sample.normalized_text, Sample.raw_text).where(Sample.corpus_id == corpus_id)
    samples_result = await db.execute(sample_query)
    
    word_map = {}
    total_words = 0
    pos_counts = {'noun': 0, 'verb': 0, 'adj': 0, 'other': 0}

    stop_words = {'dan', 'yang', 'di', 'ke', 'dari', 'ini', 'itu', 'pada', 'untuk', 'dengan'}

    for row in samples_result.all():
        text = row.normalized_text or row.raw_text or ''
        if not text:
            continue
        
        import re
        # 简单的分词，去标点
        words = re.findall(r'\b[a-zA-Z-]+\b', text.lower())
        for word in words:
            if len(word) > 1:
                total_words += 1
                if word in stop_words:
                    continue
                if word not in word_map:
                    word_map[word] = {'count': 0, 'pos': 'other'}
                word_map[word]['count'] += 1

    # 简易词性标注
    for word, data in word_map.items():
        if word.endswith('nya') or word.endswith('an'):
            data['pos'] = 'adj'
            pos_counts['adj'] += data['count']
        elif word.endswith('kan') or word.endswith('i'):
            data['pos'] = 'verb'
            pos_counts['verb'] += data['count']
        elif word.endswith('nya'):
            data['pos'] = 'noun'
            pos_counts['noun'] += data['count']
        else:
            pos_counts['other'] += data['count']

    # 排序和取前100
    sorted_words = sorted(word_map.items(), key=lambda x: x[1]['count'], reverse=True)[:100]
    
    frequency_data = []
    for word, data in sorted_words:
        percent = round((data['count'] / max(total_words, 1)) * 1000) / 10
        frequency_data.append({
            'word': word,
            'count': data['count'],
            'percent': percent,
            'pos': data['pos']
        })

    result_dict = {
        'total_words': total_words,
        'unique_words': len(word_map),
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
