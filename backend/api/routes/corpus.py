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
    KWICResponse,
    CorpusFrequencyStatsResponse
)
from api.schemas import ApiResponse
from api.utils import security

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
    db: AsyncSession = Depends(get_db),
    current_user = Depends(security.get_current_user_optional)
):
    """获取语料库列表"""
    if domain == "audio" and corpus_service.get_minio_audio_config().get("enabled"):
        # 规则：只要没有显式选择非 id 语言，就显示（任意也显示）
        source_match = (source_lang is None) or (source_lang == "id")
        target_match = (target_lang is None) or (target_lang == "id")
        if not (source_match and target_match):
            result = CorpusListResponse(
                items=[],
                total=0,
                page=page,
                limit=limit
            )
            return ApiResponse(success=True, message="获取成功", data=result)

        virtual_item = corpus_service.get_minio_audio_virtual_corpus_item()
        result = CorpusListResponse(
            items=[virtual_item],
            total=1,
            page=page,
            limit=limit
        )
        return ApiResponse(success=True, message="获取成功", data=result)

    # 所有人都能看到语料库列表（私有语料库会显示但无法访问）
    is_public_filter = is_public

    result = await corpus_service.get_corpora_list(
        db=db,
        source_lang=source_lang,
        target_lang=target_lang,
        domain=domain,
        source_type=source_type,
        is_public=is_public_filter,
        page=page,
        limit=limit
    )
    return ApiResponse(success=True, message="获取成功", data=result)


@router.get("/{corpus_id}", response_model=ApiResponse[dict])
async def get_corpus_detail(
    corpus_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(security.get_current_user_optional)
):
    """获取语料库详情"""
    if corpus_id == corpus_service.MINIO_AUDIO_CORPUS_ID:
        return ApiResponse(
            success=True,
            message="获取成功",
            data=corpus_service.get_minio_audio_virtual_corpus_detail()
        )

    from sqlalchemy import select
    from api.models.corpus import Corpus

    result = await db.execute(select(Corpus).where(Corpus.id == corpus_id))
    corpus = result.scalar_one_or_none()

    if not corpus:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="语料库不存在")

    # 普通成员只能访问公开语料库
    # 获取用户角色，处理可能的枚举或字符串类型
    user_role = None
    if current_user and current_user.role:
        if hasattr(current_user.role, 'value'):
            user_role = current_user.role.value
        else:
            user_role = str(current_user.role)

    if current_user is None or user_role == "member":
        if not corpus.is_public:
            from fastapi import HTTPException
            raise HTTPException(status_code=403, detail="无权访问此语料库")

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
    db: AsyncSession = Depends(get_db),
    current_user = Depends(security.get_current_user_optional)
):
    """获取语料样本列表"""
    if corpus_id == corpus_service.MINIO_AUDIO_CORPUS_ID:
        result = corpus_service.get_minio_audio_samples(page=page, limit=limit)
        return ApiResponse(success=True, message="获取成功", data=result)

    # 检查语料库访问权限
    from sqlalchemy import select
    from api.models.corpus import Corpus

    result = await db.execute(select(Corpus).where(Corpus.id == corpus_id))
    corpus = result.scalar_one_or_none()

    if not corpus:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="语料库不存在")

    # 普通成员只能访问公开语料库
    # 获取用户角色，处理可能的枚举或字符串类型
    user_role = None
    if current_user and current_user.role:
        if hasattr(current_user.role, 'value'):
            user_role = current_user.role.value
        else:
            user_role = str(current_user.role)

    if current_user is None or user_role == "member":
        if not corpus.is_public:
            from fastapi import HTTPException
            raise HTTPException(status_code=403, detail="无权访问此语料库")

    result = await corpus_service.get_corpus_samples(
        db=db,
        corpus_id=corpus_id,
        page=page,
        limit=limit
    )
    return ApiResponse(success=True, message="获取成功", data=result)


# ===================== 样本定位路由 =====================
@router.get("/{corpus_id}/samples/locate", response_model=ApiResponse[dict])
async def locate_sample(
    corpus_id: int,
    sentence_id: str = Query(..., description="句子ID"),
    limit: int = Query(10, ge=1, le=100, description="每页数量"),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(security.get_current_user_optional)
):
    """根据 sentence_id 查找样本所在的页码"""
    # 检查语料库访问权限
    from sqlalchemy import select
    from api.models.corpus import Corpus

    result = await db.execute(select(Corpus).where(Corpus.id == corpus_id))
    corpus = result.scalar_one_or_none()

    if not corpus:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="语料库不存在")

    # 普通成员只能访问公开语料库
    user_role = None
    if current_user and current_user.role:
        user_role = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)

    if current_user is None or user_role == "member":
        if not corpus.is_public:
            from fastapi import HTTPException
            raise HTTPException(status_code=403, detail="无权访问此语料库")

    result = await corpus_service.get_sample_page_number(
        db=db,
        corpus_id=corpus_id,
        sentence_id=sentence_id,
        limit=limit
    )
    return ApiResponse(success=True, message="定位成功", data=result)


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


# ===================== 词频统计路由 =====================
@router.get("/{corpus_id}/statistics/frequency", response_model=ApiResponse[CorpusFrequencyStatsResponse])
async def get_corpus_frequency(
    corpus_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(security.get_current_user_optional)
):
    """获取语料库全库词频统计"""
    # 检查语料库访问权限
    from sqlalchemy import select
    from api.models.corpus import Corpus

    result = await db.execute(select(Corpus).where(Corpus.id == corpus_id))
    corpus = result.scalar_one_or_none()

    if not corpus:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="语料库不存在")

    # 普通成员只能访问公开语料库
    user_role = None
    if current_user and current_user.role:
        user_role = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)

    if current_user is None or user_role == "member":
        if not corpus.is_public:
            from fastapi import HTTPException
            raise HTTPException(status_code=403, detail="无权访问此语料库")

    result = await corpus_service.get_corpus_frequency_stats(db=db, corpus_id=corpus_id)
    return ApiResponse(success=True, message="获取成功", data=result)
