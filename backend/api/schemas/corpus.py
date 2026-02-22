"""
语料库相关的 Pydantic 模型
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


# ===================== 嵌套结构 =====================

class BasicLayer(BaseModel):
    """基础层"""
    sentence_id: str
    timestamp: Optional[str] = None
    platform: Optional[str] = None


class LanguageLayer(BaseModel):
    """语言层"""
    source_text_zh: str = ""
    raw_text_ms: str = ""
    normalized_text_ms: str = ""
    english_loanwords: List[str] = []


class PragmaticLayer(BaseModel):
    """语用层"""
    intent: List[str] = []
    sentiment: str = "neutral"
    business_scenario: Optional[str] = None


class StyleLayer(BaseModel):
    """风格层"""
    style: Optional[str] = None
    contains_rojak: bool = False
    abbreviations_handled: dict = {}


class ScenarioTag(BaseModel):
    """场景标签"""
    label: str
    type: str


# ===================== 响应模型 =====================

class CorpusItem(BaseModel):
    """语料库列表项（兼容前端格式）"""
    id: int
    name: str
    sentences: str  # 格式化数字
    sTok: str       # 格式化 token 数
    tTok: str
    tags: List[ScenarioTag] = []
    domain: str = "general"
    source_type: str = "official"
    is_public: bool = True


class CorpusDetail(BaseModel):
    """语料库详情"""
    id: int
    name: str
    description: Optional[str] = None
    source_lang: str
    target_lang: str
    source_name: str
    target_name: str
    sentence_count: int
    source_token_count: int
    target_token_count: int
    domain: str
    source_type: str
    is_public: bool
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class CorpusSample(BaseModel):
    """语料样本（四层标注）"""
    basic_layer: BasicLayer
    language_layer: LanguageLayer
    pragmatic_layer: PragmaticLayer
    style_layer: StyleLayer


class SampleListResponse(BaseModel):
    """样本列表响应"""
    items: List[CorpusSample]
    total: int
    page: int = 1
    limit: int = 10


class CorpusListResponse(BaseModel):
    """语料库列表响应"""
    items: List[CorpusItem]
    total: int
    page: int = 1
    limit: int = 10


class CategoryStat(BaseModel):
    """分类统计"""
    name: str
    sentences: str
    percent: str


class DashboardOverviewResponse(BaseModel):
    """仪表盘概览响应"""
    corpus_count: str
    total_pairs: str
    language_count: str
    categories: List[CategoryStat]


class DashboardStatsResponse(BaseModel):
    """仪表盘详细统计响应"""
    # KPI 数据
    total_sentences: str
    sentences_growth: str
    avg_quality_score: str
    quality_target: str
    localization_value: str

    # 时间线数据
    timeline_data: List[dict]

    # 意图分布
    intents: List[dict]

    # 情感分布
    sentiment_distribution: dict

    # 渠道情感
    channel_sentiment: List[dict]

    # 样本数据
    samples: List[CorpusSample]

    # 借词统计
    loanwords: List[dict]

    # 标准化映射
    normalization_map: List[dict]

    # 风格分布
    style_distribution: List[dict]


# ===================== 请求模型 =====================

class CorpusSearchParams(BaseModel):
    """语料库搜索参数"""
    source_lang: Optional[str] = None
    target_lang: Optional[str] = None
    domain: Optional[str] = None
    source_type: Optional[str] = None
    is_public: Optional[bool] = None
    page: int = 1
    limit: int = 20

# ===================== KWIC 查询参数和响应 =====================
class KWICSearchParams(BaseModel):
    """KWIC 查询参数"""
    keyword: str = Field(..., description="目标词汇")
    context_window: int = Field(5, ge=1, le=10, description="前后词数")
    domain: Optional[str] = Field(None, description="业务域过滤")
    page: int = Field(1, ge=1, description="页码")
    limit: int = Field(50, ge=1, le=200, description="每页数量")

class KWICResultItem(BaseModel):
    """KWIC 结果项"""
    sentence_id: str = Field(..., description="句子ID")
    left_context: str = Field(..., description="左语境")
    keyword: str = Field(..., description="关键词")
    right_context: str = Field(..., description="右语境")
    full_data: Optional[dict] = Field(None, description="完整数据（可选）")

class KWICResponse(BaseModel):
    """KWIC 响应"""
    items: List[KWICResultItem] = Field(..., description="结果列表")
    total: int = Field(..., description="总结果数")
    keyword: str = Field(..., description="搜索关键词")
    page: int = Field(..., description="当前页码")
    limit: int = Field(..., description="每页数量")
    domain: Optional[str] = Field(None, description="过滤域")

class FrequencyWordItem(BaseModel):
    word: str = Field(..., description="词汇")
    count: int = Field(..., description="频次")
    percent: float = Field(..., description="占比")
    pos: str = Field(..., description="词性")

class CorpusFrequencyStatsResponse(BaseModel):
    total_words: int = Field(..., description="总词数")
    unique_words: int = Field(..., description="去重词数")
    pos_distribution: dict = Field(..., description="词性分布比例")
    frequency_data: List[FrequencyWordItem] = Field(..., description="高频词列表")
