"""
API 路由汇总
"""
from fastapi import APIRouter

from api.routes import auth, user
from api.routes.corpus import router as corpus_router, router_stat, router_dashboard
from api.routes.import_corpus import router as import_router


# 创建主路由
api_router = APIRouter()

# 注册各模块路由
api_router.include_router(auth.router, prefix="/auth", tags=["认证"])
api_router.include_router(user.router, prefix="/user", tags=["用户"])
api_router.include_router(corpus_router)
api_router.include_router(router_stat)
api_router.include_router(router_dashboard)
api_router.include_router(import_router)
