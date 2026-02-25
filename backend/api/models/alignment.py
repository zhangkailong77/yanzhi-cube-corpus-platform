"""
对齐语料样本数据模型
"""
from sqlalchemy import Column, Integer, String, TIMESTAMP, BigInteger, Text, JSON, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class AlignmentSample(Base):
    """对齐语料样本表模型"""
    __tablename__ = "alignment_samples"
    __table_args__ = (
        UniqueConstraint('corpus_id', 'alignment_id', name='uk_alignment_corpus_id'),
    )

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="ID")
    corpus_id = Column(Integer, ForeignKey("corpora.id"), nullable=False, comment="所属语料库ID")
    alignment_id = Column(String(50), nullable=False, comment="对齐唯一标识")
    source_text = Column(Text, nullable=False, comment="源文本")
    target_text = Column(Text, nullable=False, comment="目标文本")
    context = Column(String(200), nullable=True, comment="上下文信息")
    domain = Column(String(100), nullable=True, comment="领域")
    created_at = Column(TIMESTAMP, default=datetime.now, nullable=False, comment="创建时间")

    # 关联
    corpus = relationship("Corpus", back_populates="alignment_samples")

    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "id": self.id,
            "corpus_id": self.corpus_id,
            "alignment_id": self.alignment_id,
            "source_text": self.source_text,
            "target_text": self.target_text,
            "context": self.context,
            "domain": self.domain,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "type": "alignment"
        }

    def __repr__(self) -> str:
        return f"<AlignmentSample(id={self.id}, alignment_id='{self.alignment_id}')>"
