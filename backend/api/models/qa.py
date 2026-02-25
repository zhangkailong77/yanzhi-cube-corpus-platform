"""
问答语料样本数据模型
"""
from sqlalchemy import Column, Integer, String, TIMESTAMP, BigInteger, Text, JSON, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class QASample(Base):
    """问答语料样本表模型"""
    __tablename__ = "qa_samples"
    __table_args__ = (
        UniqueConstraint('corpus_id', 'qa_id', name='uk_qa_corpus_id'),
    )

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="ID")
    corpus_id = Column(Integer, ForeignKey("corpora.id"), nullable=False, comment="所属语料库ID")
    qa_id = Column(String(50), nullable=False, comment="问答唯一标识")
    question = Column(Text, nullable=False, comment="问题内容")
    question_type = Column(String(100), nullable=True, comment="问题类型")
    answer = Column(Text, nullable=False, comment="回答内容")
    keywords = Column(JSON, nullable=True, comment="关键词列表 (JSON Array)")
    category = Column(String(100), nullable=True, comment="类别")
    tags = Column(JSON, nullable=True, comment="标签列表 (JSON Array)")
    created_at = Column(TIMESTAMP, default=datetime.now, nullable=False, comment="创建时间")

    # 关联
    corpus = relationship("Corpus", back_populates="qa_samples")

    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "id": self.id,
            "corpus_id": self.corpus_id,
            "qa_id": self.qa_id,
            "question": self.question,
            "question_type": self.question_type,
            "answer": self.answer,
            "keywords": self.keywords or [],
            "category": self.category,
            "tags": self.tags or [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "type": "qa"
        }

    def __repr__(self) -> str:
        return f"<QASample(id={self.id}, qa_id='{self.qa_id}')>"
