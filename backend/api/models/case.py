"""
案例语料样本数据模型
"""
from sqlalchemy import Column, Integer, String, TIMESTAMP, BigInteger, Text, JSON, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class CaseSample(Base):
    """案例语料样本表模型"""
    __tablename__ = "case_samples"
    __table_args__ = (
        UniqueConstraint('corpus_id', 'case_id', name='uk_case_corpus_id'),
    )

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="ID")
    corpus_id = Column(Integer, ForeignKey("corpora.id"), nullable=False, comment="所属语料库ID")
    case_id = Column(String(50), nullable=False, comment="案例唯一标识")
    case_title = Column(String(255), nullable=False, comment="案例标题")
    case_type = Column(String(100), nullable=True, comment="案例类型")
    background = Column(Text, nullable=True, comment="案例背景")
    situation = Column(Text, nullable=True, comment="案例过程/情况")
    outcome = Column(Text, nullable=True, comment="案例结果/产出")
    conclusion = Column(Text, nullable=True, comment="案例结论/启示")
    tags = Column(JSON, nullable=True, comment="标签列表 (JSON Array)")
    created_at = Column(TIMESTAMP, default=datetime.now, nullable=False, comment="创建时间")

    # 关联
    corpus = relationship("Corpus", back_populates="case_samples")

    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "id": self.id,
            "corpus_id": self.corpus_id,
            "case_id": self.case_id,
            "case_title": self.case_title,
            "case_type": self.case_type,
            "background": self.background,
            "situation": self.situation,
            "outcome": self.outcome,
            "conclusion": self.conclusion,
            "tags": self.tags or [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "type": "case"
        }

    def __repr__(self) -> str:
        return f"<CaseSample(id={self.id}, case_id='{self.case_id}', title='{self.case_title[:20]}...')>"
