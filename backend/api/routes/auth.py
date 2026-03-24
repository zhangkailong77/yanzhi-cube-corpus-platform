"""
认证路由 - 登录、登出、token 刷新等
"""
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from api.schemas.auth import LoginRequest, LoginResponse, UserInfo, ApiResponse, RegisterRequest
from api.services.auth_service import AuthService, ACCESS_TOKEN_EXPIRE_MINUTES
from api.utils.security import get_current_user, get_current_user_optional, User
from api.models.user import UserRole

router = APIRouter()


@router.post("/login", response_model=LoginResponse, summary="用户登录")
async def login(
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    用户登录接口

    - **username**: 用户名
    - **password**: 密码

    返回 JWT token 和用户信息
    """
    # 验证用户
    user = await AuthService.authenticate_user(db, login_data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 更新最后登录时间
    await AuthService.update_last_login(db, user)

    # 生成 token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = AuthService.create_access_token(
        data={"sub": str(user.id), "username": user.username, "role": user.role},
        expires_delta=access_token_expires
    )

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=AuthService.user_to_info(user)
    )


@router.get("/me", response_model=UserInfo, summary="获取当前用户信息")
async def get_me(
    current_user: User = Depends(get_current_user)
):
    """
    获取当前登录用户的信息

    需要在请求头中携带 Bearer token
    """
    return AuthService.user_to_info(current_user)


@router.post("/logout", response_model=ApiResponse, summary="用户登出")
async def logout(
    current_user: User = Depends(get_current_user_optional)
):
    """
    用户登出接口

    由于使用 JWT，登出主要由客户端处理（删除本地存储的 token）
    服务端可以添加 token 到黑名单（如需要）
    """
    return ApiResponse(
        success=True,
        message="登出成功"
    )


@router.get("/verify", response_model=UserInfo, summary="验证 Token")
async def verify_token(
    current_user: User = Depends(get_current_user_optional)
):
    """
    验证当前 token 是否有效

    如果 token 有效，返回用户信息；否则返回 401
    """
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token 无效或已过期"
        )
    return AuthService.user_to_info(current_user)


@router.post("/register", response_model=LoginResponse, summary="用户注册")
async def register(
    register_data: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    用户注册接口

    - **username**: 用户名（唯一）
    - **display_name**: 姓名（必填）
    - **password**: 密码
    - **email**: 邮箱（可选，唯一）

    新注册的用户角色为 member（普通用户）
    """
    # 检查用户是否已存在
    existing_user = await AuthService.get_user_by_username(db, register_data.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="用户名已存在"
        )

    # 如果提供了邮箱，检查邮箱是否已被使用
    if register_data.email:
        existing_email_user = await AuthService.get_user_by_email(db, register_data.email)
        if existing_email_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="邮箱已被注册"
            )

    # 创建新用户（角色固定为 member）
    new_user = await AuthService.create_user(
        db,
        username=register_data.username,
        password=register_data.password,
        display_name=register_data.display_name,
        email=register_data.email,
        role=UserRole.MEMBER  # 普通用户角色
    )

    # 生成 token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = AuthService.create_access_token(
        data={"sub": str(new_user.id), "username": new_user.username, "role": new_user.role},
        expires_delta=access_token_expires
    )

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=AuthService.user_to_info(new_user)
    )
