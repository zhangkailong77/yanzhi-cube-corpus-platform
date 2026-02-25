"""
规程语料样本数据模型
"""
from sqlalchemy import Column, Integer, String, TIMESTAMP, BigInteger, Text, JSON, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class ProcessSample(Base):
    """规程语料样本表模型"""
    __tablename__ = "process_samples"
    __table_args__ = (
        UniqueConstraint('corpus_id', 'rule_id', name='uk_rule_corpus_id'),
    )

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="ID")
    corpus_id = Column(Integer, ForeignKey("corpora.id"), nullable=False, comment="所属语料库ID")
    rule_id = Column(String(50), nullable=False, comment="规则唯一标识")
    scenario = Column(Text, nullable=False, comment="场景说明")
    condition = Column(Text, nullable=False, comment="触发条件")
    result = Column(Text, nullable=False, comment="处理结果/规则内容")
    category = Column(String(100), nullable=True, comment="分类")
    created_at = Column(TIMESTAMP, default=datetime.now, nullable=False, comment="创建时间")

    # 关联
    corpus = relationship("Corpus", back_populates="process_samples")

    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "id": self.id,
            "corpus_id": self.corpus_id,
            "rule_id": self.rule_id,
            "scenario": self.scenario,
            "condition": self.condition,
            "result": self.result,
            "category": self.category,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "type": "process"
        }

    def __repr__(self) -> str:
        return f"<ProcessSample(id={self.id}, rule_id='{self.rule_id}')>"
