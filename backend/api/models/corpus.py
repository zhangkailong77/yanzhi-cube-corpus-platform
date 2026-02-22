"""
语料库数据模型
"""
from sqlalchemy import Column, Integer, String, Boolean, Enum as SQLEnum, TIMESTAMP, BigInteger, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from enum import Enum as PyEnum

# 使用独立的 Base，避免循环导入
Base = declarative_base()


class DomainEnum(str, PyEnum):
    """业务域枚举"""
    ECOMMERCE = "ecommerce"
    TOURISM = "tourism"
    BUSINESS = "business"
    ECONOMY = "economy"
    GENERAL = "general"


class SourceTypeEnum(str, PyEnum):
    """数据来源类型枚举"""
    OFFICIAL = "official"
    COMMUNITY = "community"
    SYNTHETIC = "synthetic"


class SentimentEnum(str, PyEnum):
    """情感极性枚举"""
    NEUTRAL = "neutral"
    POSITIVE = "positive"
    NEGATIVE = "negative"
    ANGRY = "angry"


class BusinessScenarioEnum(str, PyEnum):
    """业务场景枚举"""
    PRE_SALES = "pre-sales"
    IN_SALES = "in-sales"
    AFTER_SALES = "after-sales"


class Corpus(Base):
    """语料库表模型"""
    __tablename__ = "corpora"

    id = Column(Integer, primary_key=True, autoincrement=True, comment="语料库ID")
    name = Column(String(200), nullable=False, comment="语料库名称")
    description = Column(Text, nullable=True, comment="语料库描述")
    source_lang = Column(String(10), nullable=False, comment="源语言代码")
    target_lang = Column(String(10), nullable=False, comment="目标语言代码")
    source_name = Column(String(50), nullable=False, comment="源语言名称")
    target_name = Column(String(50), nullable=False, comment="目标语言名称")
    sentence_count = Column(BigInteger, default=0, nullable=False, comment="句子数")
    source_token_count = Column(BigInteger, default=0, nullable=False, comment="源语言 token 数")
    target_token_count = Column(BigInteger, default=0, nullable=False, comment="目标语言 token 数")
    domain = Column(String(50), default="general", nullable=False, comment="业务域")
    source_type = Column(String(50), default="official", nullable=False, comment="数据来源类型")
    is_public = Column(Boolean, default=True, nullable=False, comment="是否公开")
    created_at = Column(TIMESTAMP, default=datetime.now, nullable=False, comment="创建时间")
    updated_at = Column(TIMESTAMP, default=datetime.now, onupdate=datetime.now, nullable=False, comment="更新时间")

    # 关联
    samples = relationship("Sample", back_populates="corpus", cascade="all, delete-orphan")
    tags = relationship("CorpusTag", back_populates="corpus", cascade="all, delete-orphan")

    def to_dict(self, include_samples: bool = False) -> dict:
        """转换为字典"""
        result = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "source_lang": self.source_lang,
            "target_lang": self.target_lang,
            "source_name": self.source_name,
            "target_name": self.target_name,
            "sentence_count": self.sentence_count,
            "source_token_count": self.source_token_count,
            "target_token_count": self.target_token_count,
            "domain": self.domain.value if isinstance(self.domain, DomainEnum) else self.domain,
            "source_type": self.source_type.value if isinstance(self.source_type, SourceTypeEnum) else self.source_type,
            "is_public": self.is_public,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_samples and self.samples:
            result["samples"] = [sample.to_dict() for sample in self.samples]
        return result

    def __repr__(self) -> str:
        return f"<Corpus(id={self.id}, name='{self.name}')>"


class Sample(Base):
    """语料样本表模型"""
    __tablename__ = "samples"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="样本ID")
    corpus_id = Column(Integer, ForeignKey("corpora.id"), nullable=False, comment="所属语料库ID")
    sentence_id = Column(String(50), unique=True, nullable=False, comment="句子唯一标识")
    platform = Column(String(50), nullable=True, comment="来源平台")
    timestamp = Column(TIMESTAMP, nullable=True, comment="时间戳")

    # 语言层
    source_text = Column(Text, nullable=False, comment="源语言文本")
    raw_text = Column(Text, nullable=True, comment="原始目标语言文本")
    normalized_text = Column(Text, nullable=True, comment="标准化目标语言文本")
    english_loanwords = Column(JSON, nullable=True, comment="英语借词列表")

    # 语用层
    intent = Column(JSON, nullable=True, comment="意图列表")
    sentiment = Column(String(20), default="neutral", nullable=False, comment="情感极性")
    business_scenario = Column(String(20), nullable=True, comment="业务场景")

    # 风格层
    style = Column(String(50), nullable=True, comment="文本风格")
    contains_rojak = Column(Boolean, default=False, nullable=False, comment="是否包含混合语言")
    abbreviations_handled = Column(JSON, nullable=True, comment="缩写映射表")

    created_at = Column(TIMESTAMP, default=datetime.now, nullable=False, comment="创建时间")

    # 关联
    corpus = relationship("Corpus", back_populates="samples")

    def to_dict(self) -> dict:
        """转换为字典（四层标注结构）"""
        return {
            "basic_layer": {
                "sentence_id": self.sentence_id,
                "timestamp": self.timestamp.isoformat() if self.timestamp else None,
                "platform": self.platform,
            },
            "language_layer": {
                "source_text_zh": self.source_text if self.source_lang == "zh" else "",
                "raw_text_ms": self.raw_text if self.target_lang == "ms" else "",
                "normalized_text_ms": self.normalized_text if self.target_lang == "ms" else "",
                "english_loanwords": self.english_loanwords or [],
            },
            "pragmatic_layer": {
                "intent": self.intent or [],
                "sentiment": self.sentiment,
                "business_scenario": self.business_scenario,
            },
            "style_layer": {
                "style": self.style,
                "contains_rojak": self.contains_rojak,
                "abbreviations_handled": self.abbreviations_handled or {},
            },
        }

    def __repr__(self) -> str:
        return f"<Sample(id={self.id}, sentence_id='{self.sentence_id}')>"


class CorpusTag(Base):
    """语料库域标签关联表模型"""
    __tablename__ = "corpus_tags"

    id = Column(Integer, primary_key=True, autoincrement=True)
    corpus_id = Column(Integer, ForeignKey("corpora.id"), nullable=False, comment="语料库ID")
    tag_label = Column(String(50), nullable=False, comment="标签名称")
    tag_type = Column(String(50), nullable=False, comment="标签类型")

    # 关联
    corpus = relationship("Corpus", back_populates="tags")

    def __repr__(self) -> str:
        return f"<CorpusTag(corpus_id={self.corpus_id}, label='{self.tag_label}')>"


class StatisticsCache(Base):
    """统计概览缓存表模型"""
    __tablename__ = "statistics_cache"

    id = Column(Integer, primary_key=True, autoincrement=True)
    stat_type = Column(String(50), nullable=False, comment="统计类型")
    stat_key = Column(String(100), nullable=False, comment="统计键")
    stat_value = Column(Text, nullable=False, comment="统计值")
    extra_metadata = Column("metadata", JSON, nullable=True, comment="附加元数据")
    updated_at = Column(TIMESTAMP, default=datetime.now, onupdate=datetime.now, nullable=False, comment="更新时间")

    def __repr__(self) -> str:
        return f"<StatisticsCache(type='{self.stat_type}', key='{self.stat_key}')>"
