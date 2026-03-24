"""
认证服务 - 用户认证相关业务逻辑
"""
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from api.models.user import User, UserRole
from api.schemas.auth import LoginRequest, RegisterRequest, UserInfo


# 加载环境变量
from dotenv import load_dotenv
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)

# JWT 配置（从环境变量读取）
SECRET_KEY = os.getenv('SECRET_KEY', 'your-super-secret-key-change-this-in-production-min-32-chars')
ALGORITHM = os.getenv('ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', '30'))

# 密码哈希配置
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """认证服务类"""

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """验证密码"""
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password: str) -> str:
        """生成密码哈希"""
        return pwd_context.hash(password)

    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """创建 JWT token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    @staticmethod
    def decode_token(token: str) -> Optional[dict]:
        """解码 JWT token"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            return None

    @staticmethod
    async def get_user_by_username(session: AsyncSession, username: str) -> Optional[User]:
        """根据用户名获取用户"""
        stmt = select(User).where(User.username == username)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_id(session: AsyncSession, user_id: int) -> Optional[User]:
        """根据 ID 获取用户"""
        stmt = select(User).where(User.id == user_id)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_email(session: AsyncSession, email: str) -> Optional[User]:
        """根据邮箱获取用户"""
        stmt = select(User).where(User.email == email)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def authenticate_user(session: AsyncSession, login_data: LoginRequest) -> Optional[User]:
        """验证用户登录"""
        user = await AuthService.get_user_by_username(session, login_data.username)
        if not user:
            return None
        if not user.is_active:
            return None
        if not AuthService.verify_password(login_data.password, user.password_hash):
            return None
        return user

    @staticmethod
    async def update_last_login(session: AsyncSession, user: User):
        """更新最后登录时间"""
        stmt = update(User).where(User.id == user.id).values(last_login_at=datetime.now())
        await session.execute(stmt)
        await session.commit()

    @staticmethod
    async def create_user(
        session: AsyncSession,
        username: str,
        password: str,
        display_name: str,
        email: Optional[str] = None,
        role: UserRole = UserRole.MEMBER
    ) -> User:
        """创建新用户"""
        # 检查用户名是否已存在
        existing = await AuthService.get_user_by_username(session, username)
        if existing:
            raise ValueError("用户名已存在")

        # 创建用户
        hashed_password = AuthService.get_password_hash(password)
        user = User(
            username=username,
            display_name=display_name,
            password_hash=hashed_password,
            email=email,
            role=role,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user

    @staticmethod
    def user_to_info(user: User) -> UserInfo:
        """将 User 模型转换为 UserInfo"""
        return UserInfo(
            id=user.id,
            username=user.username,
            display_name=(user.display_name or user.username),
            email=user.email,
            role=user.role,
            is_active=user.is_active,
            last_login_at=user.last_login_at,
            created_at=user.created_at,
        )
