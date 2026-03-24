"""
用户数据模型
"""
from sqlalchemy import Column, Integer, String, Boolean, Enum as SQLEnum, TIMESTAMP
from datetime import datetime
from enum import Enum as PyEnum
from .base import Base


class UserRole(str, PyEnum):
    """用户角色枚举"""
    ADMIN = "admin"
    MEMBER = "member"


class User(Base):
    """用户表模型"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True, comment="用户ID")
    username = Column(String(50), unique=True, nullable=False, comment="用户名")
    display_name = Column(String(100), nullable=True, comment="显示姓名")
    password_hash = Column(String(255), nullable=False, comment="密码哈希")
    email = Column(String(100), unique=True, nullable=True, comment="邮箱")
    role = Column(String(50), default="member", nullable=False, comment="角色")
    is_active = Column(Boolean, default=True, nullable=False, comment="是否激活")
    last_login_at = Column(TIMESTAMP, nullable=True, comment="最后登录时间")
    created_at = Column(TIMESTAMP, default=datetime.now, nullable=False, comment="创建时间")
    updated_at = Column(TIMESTAMP, default=datetime.now, onupdate=datetime.now, nullable=False, comment="更新时间")

    def to_dict(self) -> dict:
        """转换为字典（不包含敏感信息）"""
        return {
            "id": self.id,
            "username": self.username,
            "display_name": self.display_name,
            "email": self.email,
            "role": self.role.value if isinstance(self.role, PyEnum) else self.role,
            "is_active": self.is_active,
            "last_login_at": self.last_login_at.isoformat() if self.last_login_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<User(id={self.id}, username='{self.username}', role='{self.role}')>"
