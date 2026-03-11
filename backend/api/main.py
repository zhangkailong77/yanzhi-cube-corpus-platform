"""
语料库管理平台 - FastAPI 主应用入口
"""
import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from api.api import api_router
from database.connection import init_database

# 加载环境变量
from dotenv import load_dotenv
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# 从环境变量读取配置
APP_NAME = os.getenv('APP_NAME', '语料库管理平台')
DEBUG = os.getenv('DEBUG', 'True').lower() in ('true', '1', 'yes')
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3001').split(',')
AUTO_INIT_DATABASE = os.getenv(
    'AUTO_INIT_DATABASE',
    'False' if DEBUG else 'True'
).lower() in ('true', '1', 'yes')


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 开发模式默认跳过自动初始化，避免误写生产数据库
    if AUTO_INIT_DATABASE:
        await init_database()
    yield
    # 关闭时清理资源（如需要）


# 创建 FastAPI 应用
app = FastAPI(
    title=f"{APP_NAME} API",
    description="Yanzhi Cube Corpus Platform Backend API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS 中间件配置 - 从环境变量读取
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if not DEBUG else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# 注册路由
app.include_router(api_router, prefix="/api")

# 挂载本地媒体目录（音频预览）
media_path = Path(__file__).parent.parent / "media"
media_path.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=str(media_path)), name="media")

# 健康检查
@app.get("/health")
async def health_check():
    """健康检查接口"""
    return {
        "status": "healthy",
        "service": "yanzhi-cube-corpus-api",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
