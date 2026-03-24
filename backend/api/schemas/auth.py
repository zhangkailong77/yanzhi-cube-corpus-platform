"""
认证相关的 Pydantic 模型
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from api.models.user import UserRole


# ===================== 请求模型 =====================

class LoginRequest(BaseModel):
    """登录请求"""
    username: str = Field(..., min_length=3, max_length=50, description="用户名")
    password: str = Field(..., min_length=6, max_length=100, description="密码")

    class Config:
        json_schema_extra = {
            "example": {
                "username": "admin",
                "password": "Yanzhi2026"
            }
        }


class RegisterRequest(BaseModel):
    """注册请求（管理员功能）"""
    display_name: str = Field(..., min_length=1, max_length=100, description="姓名")
    username: str = Field(..., min_length=3, max_length=50, description="用户名")
    password: str = Field(..., min_length=6, max_length=100, description="密码")
    email: Optional[EmailStr] = Field(None, description="邮箱")
    role: UserRole = Field(default=UserRole.MEMBER, description="角色")

    class Config:
        json_schema_extra = {
            "example": {
                "display_name": "张三",
                "username": "newuser",
                "password": "password123",
                "email": "user@example.com",
                "role": "member"
            }
        }


class UpdatePasswordRequest(BaseModel):
    """修改密码请求"""
    old_password: str = Field(..., description="旧密码")
    new_password: str = Field(..., min_length=6, max_length=100, description="新密码")

    class Config:
        json_schema_extra = {
            "example": {
                "old_password": "oldpass123",
                "new_password": "newpass456"
            }
        }


# ===================== 响应模型 =====================

class TokenResponse(BaseModel):
    """Token 响应"""
    access_token: str = Field(..., description="访问令牌")
    token_type: str = Field(default="bearer", description="令牌类型")
    expires_in: int = Field(..., description="过期时间（秒）")

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 1800
            }
        }


class UserInfo(BaseModel):
    """用户信息"""
    id: int
    username: str
    display_name: Optional[str] = None
    email: Optional[str] = None
    role: UserRole
    is_active: bool
    last_login_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "username": "admin",
                "display_name": "系统管理员",
                "email": "admin@yanzhi.com",
                "role": "admin",
                "is_active": True,
                "last_login_at": "2026-02-13T12:00:00",
                "created_at": "2026-02-13T10:00:00"
            }
        }


class LoginResponse(BaseModel):
    """登录响应"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserInfo

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 1800,
                "user": {
                    "id": 1,
                    "username": "admin",
                    "role": "admin"
                }
            }
        }


from typing import Generic, TypeVar

T = TypeVar('T')


class ApiResponse(BaseModel, Generic[T]):
    """通用 API 响应"""
    success: bool
    message: str
    data: Optional[T] = None

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "操作成功",
                "data": {}
            }
        }
