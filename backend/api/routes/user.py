"""
用户路由 - 用户管理相关接口
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from api.schemas.auth import UserInfo
from api.utils.security import get_current_user, User, UserRole

router = APIRouter()


@router.get("/profile", response_model=UserInfo, summary="获取用户资料")
async def get_profile(
    current_user: User = Depends(get_current_user)
):
    """
    获取当前用户的完整资料
    """
    from api.services.auth_service import AuthService
    return AuthService.user_to_info(current_user)


@router.get("/list", response_model=list[UserInfo], summary="获取用户列表")
async def list_users(
    current_user: User = Depends(get_current_user)
):
    """
    获取用户列表

    仅管理员可用
    """
    # 权限检查：仅管理员可访问
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="仅管理员可访问此接口"
        )

    # TODO: 实现用户列表查询逻辑
    # 可以添加分页、筛选等参数

    return [current_user.to_dict()]
