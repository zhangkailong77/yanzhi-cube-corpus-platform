"""
语料库 API 路由
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from database.connection import get_db
from api.services import corpus_service
from api.schemas.corpus import (
    CorpusListResponse,
    SampleListResponse,
    DashboardOverviewResponse,
    DashboardStatsResponse,
    KWICResponse
)
from api.schemas import ApiResponse

router = APIRouter(prefix="/corpus", tags=["语料库"])


@router.get("", response_model=ApiResponse[CorpusListResponse])
async def get_corpora(
    source_lang: Optional[str] = Query(None, description="源语言代码"),
    target_lang: Optional[str] = Query(None, description="目标语言代码"),
    domain: Optional[str] = Query(None, description="业务域"),
    source_type: Optional[str] = Query(None, description="数据来源类型"),
    is_public: Optional[bool] = Query(None, description="是否公开"),
    page: int = Query(1, ge=1, description="页码"),
    limit: int = Query(20, ge=1, le=100, description="每页数量"),
    db: AsyncSession = Depends(get_db)
):
    """获取语料库列表"""
    result = await corpus_service.get_corpora_list(
        db=db,
        source_lang=source_lang,
        target_lang=target_lang,
        domain=domain,
        source_type=source_type,
        is_public=is_public,
        page=page,
        limit=limit
    )
    return ApiResponse(success=True, message="获取成功", data=result)


@router.get("/{corpus_id}", response_model=ApiResponse[dict])
async def get_corpus_detail(
    corpus_id: int,
    db: AsyncSession = Depends(get_db)
):
    """获取语料库详情"""
    from sqlalchemy import select
    from api.models.corpus import Corpus

    result = await db.execute(select(Corpus).where(Corpus.id == corpus_id))
    corpus = result.scalar_one_or_none()

    if not corpus:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="语料库不存在")

    return ApiResponse(
        success=True,
        message="获取成功",
        data={
            "id": corpus.id,
            "name": corpus.name,
            "description": corpus.description,
            "source_lang": corpus.source_lang,
            "target_lang": corpus.target_lang,
            "source_name": corpus.source_name,
            "target_name": corpus.target_name,
            "sentence_count": corpus.sentence_count,
            "source_token_count": corpus.source_token_count,
            "target_token_count": corpus.target_token_count,
            "domain": corpus.domain,
            "source_type": corpus.source_type,
            "is_public": corpus.is_public,
        }
    )


@router.get("/{corpus_id}/samples", response_model=ApiResponse[SampleListResponse])
async def get_corpus_samples(
    corpus_id: int,
    page: int = Query(1, ge=1, description="页码"),
    limit: int = Query(10, ge=1, le=100, description="每页数量"),
    db: AsyncSession = Depends(get_db)
):
    """获取语料样本列表"""
    result = await corpus_service.get_corpus_samples(
        db=db,
        corpus_id=corpus_id,
        page=page,
        limit=limit
    )
    return ApiResponse(success=True, message="获取成功", data=result)


# ===================== 仪表盘和统计路由 =====================

router_stat = APIRouter(prefix="/statistics", tags=["统计"])


@router_stat.get("/overview", response_model=ApiResponse[DashboardOverviewResponse])
async def get_overview_stats(db: AsyncSession = Depends(get_db)):
    """获取首页统计概览"""
    result = await corpus_service.get_overview_stats(db)
    return ApiResponse(success=True, message="获取成功", data=result)


# ===================== 仪表盘路由 =====================

router_dashboard = APIRouter(prefix="/dashboard", tags=["仪表盘"])


@router_dashboard.get("/stats", response_model=ApiResponse[DashboardStatsResponse])
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    """获取仪表盘详细统计"""
    result = await corpus_service.get_dashboard_stats(db)
    return ApiResponse(success=True, message="获取成功", data=result)


# ===================== KWIC 分析路由 =====================
@router.get("/{corpus_id}/kwic/analysis", response_model=ApiResponse[KWICResponse])
async def get_kwic_analysis(
    corpus_id: int,
    keyword: str = Query(..., description="目标词汇"),
    context_window: int = Query(5, ge=1, le=10, description="前后词数"),
    domain: Optional[str] = Query(None, description="业务域过滤"),
    page: int = Query(1, ge=1, description="页码"),
    limit: int = Query(50, ge=1, le=200, description="每页数量"),
    db: AsyncSession = Depends(get_db)
):
    """获取关键词语境分析结果"""
    from api.schemas.corpus import KWICResponse

    result = await corpus_service.get_kwic_analysis(
        db=db,
        corpus_id=corpus_id,
        keyword=keyword,
        context_window=context_window,
        domain=domain,
        page=page,
        limit=limit
    )
    return ApiResponse(success=True, message="获取成功", data=result)
