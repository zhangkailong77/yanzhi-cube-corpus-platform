from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import relationship
from .base import Base

class ScenarioSample(Base):
    __tablename__ = "scenario_samples"

    id = Column(Integer, primary_key=True, autoincrement=True)
    corpus_id = Column(Integer, ForeignKey("corpora.id", ondelete="CASCADE"), nullable=False)
    instruction_id = Column(String(50), nullable=False)
    instruction_type = Column(String(50))
    task = Column(Text)
    output = Column(Text)
    tags = Column(JSON)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationship
    corpus = relationship("Corpus", back_populates="scenario_samples")

    def to_dict(self):
        return {
            "id": self.id,
            "instruction_id": self.instruction_id,
            "instruction_type": self.instruction_type,
            "task": self.task,
            "output": self.output,
            "tags": self.tags or []
        }
