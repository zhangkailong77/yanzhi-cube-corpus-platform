"""
音频语料样本数据模型
"""
from datetime import datetime

from sqlalchemy import BigInteger, Column, ForeignKey, Integer, String, Text, TIMESTAMP, UniqueConstraint
from sqlalchemy.orm import relationship

from .base import Base


class AudioSample(Base):
    """音频语料样本表模型"""
    __tablename__ = "audio_samples"
    __table_args__ = (
        UniqueConstraint('corpus_id', 'audio_id', name='uk_audio_corpus_id'),
    )

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="ID")
    corpus_id = Column(Integer, ForeignKey("corpora.id"), nullable=False, comment="所属语料库ID")
    audio_id = Column(String(100), nullable=False, comment="音频唯一标识")
    audio_url = Column(Text, nullable=False, comment="音频访问地址")
    transcript = Column(Text, nullable=True, comment="转写文本")
    duration_seconds = Column(String(30), nullable=True, comment="音频时长（秒）")
    language = Column(String(20), nullable=True, comment="语言代码")
    created_at = Column(TIMESTAMP, default=datetime.now, nullable=False, comment="创建时间")

    corpus = relationship("Corpus", back_populates="audio_samples")

    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "id": self.id,
            "corpus_id": self.corpus_id,
            "audio_id": self.audio_id,
            "audio_url": self.audio_url,
            "transcript": self.transcript,
            "duration_seconds": self.duration_seconds,
            "language": self.language,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "type": "audio"
        }

    def __repr__(self) -> str:
        return f"<AudioSample(id={self.id}, audio_id='{self.audio_id}')>"
