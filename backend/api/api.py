"""
API 路由汇总
"""
from fastapi import APIRouter

from api.routes import auth, user


# 创建主路由
api_router = APIRouter()

# 注册各模块路由
api_router.include_router(auth.router, prefix="/auth", tags=["认证"])
api_router.include_router(user.router, prefix="/user", tags=["用户"])
