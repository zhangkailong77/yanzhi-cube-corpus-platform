"""
术语语料样本数据模型
"""
from sqlalchemy import Column, Integer, String, TIMESTAMP, BigInteger, Text, JSON, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class TerminologySample(Base):
    """术语语料样本表模型"""
    __tablename__ = "terminology_samples"
    __table_args__ = (
        UniqueConstraint('corpus_id', 'term_id', name='uk_term_corpus_id'),
    )

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="ID")
    corpus_id = Column(Integer, ForeignKey("corpora.id"), nullable=False, comment="所属语料库ID")
    term_id = Column(String(50), nullable=False, comment="术语唯一标识")
    term = Column(String(200), nullable=False, comment="术语名称")
    abbreviation = Column(String(50), nullable=True, comment="术语缩写")
    category = Column(String(100), nullable=False, comment="术语分类")
    definition = Column(Text, nullable=False, comment="术语定义")
    examples = Column(JSON, nullable=True, comment="例句列表 (JSON Array)")
    related_terms = Column(JSON, nullable=True, comment="相关术语列表 (JSON Array)")
    translations = Column(JSON, nullable=True, comment="多语言翻译映射 (JSON Object)")
    tags = Column(JSON, nullable=True, comment="标签列表 (JSON Array)")
    created_at = Column(TIMESTAMP, default=datetime.now, nullable=False, comment="创建时间")

    # 关联
    corpus = relationship("Corpus", back_populates="terminology_samples")

    def to_dict(self) -> dict:
        """转换为字典（第一类：术语类结构）"""
        return {
            "id": self.id,
            "corpus_id": self.corpus_id,
            "term_id": self.term_id,
            "term": self.term,
            "abbreviation": self.abbreviation,
            "category": self.category,
            "definition": self.definition,
            "examples": self.examples or [],
            "related_terms": self.related_terms or [],
            "translations": self.translations or {},
            "tags": self.tags or [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<TerminologySample(id={self.id}, term='{self.term}')>"
