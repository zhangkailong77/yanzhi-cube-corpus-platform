"""
语料库批量导入 API
"""
from datetime import datetime
import io
import json
import logging
import struct
import shutil
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlparse
import uuid
import wave

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.models.alignment import AlignmentSample
from api.models.audio import AudioSample
from api.models.case import CaseSample
from api.models.corpus import Corpus, Sample
from api.models.process import ProcessSample
from api.models.qa import QASample
from api.models.scenario import ScenarioSample
from api.models.terminology import TerminologySample
from api.schemas import ApiResponse
from api.schemas.corpus import CreateCorpusWithSamplesRequest
from database.connection import get_db

router = APIRouter(prefix="/corpus", tags=["语料库导入"])
logger = logging.getLogger(__name__)

MEDIA_AUDIO_DIR = Path(__file__).parent.parent.parent / "media" / "audio"


class MinioImportRequest(BaseModel):
    """从 MinIO 导入对象参数"""
    endpoint: str = Field(..., description="MinIO 地址，例如 112.124.32.196:9000")
    access_key: str
    secret_key: str
    bucket: str
    object_name: str
    secure: bool = False


def parse_timestamp(value: Optional[str]) -> Optional[datetime]:
    """
    解析时间戳字符串为 datetime 对象。
    解决 MySQL 报错 1292: Incorrect datetime value for '...Z'
    """
    if not value:
        return None

    if isinstance(value, datetime):
        return value

    if isinstance(value, str):
        if value.endswith('Z'):
            value = value[:-1]

        try:
            return datetime.fromisoformat(value)
        except ValueError:
            pass

        try:
            return datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            pass

        try:
            return datetime.strptime(value, '%Y-%m-%d')
        except ValueError:
            pass

    return None


def _is_url(value: str) -> bool:
    parsed = urlparse(value)
    return parsed.scheme in ("http", "https") and bool(parsed.netloc)


def _safe_audio_extension(path_value: Optional[str]) -> str:
    if not path_value:
        return ".wav"

    suffix = Path(path_value).suffix.lower()
    if suffix in [".wav", ".mp3", ".flac", ".ogg", ".m4a", ".aac", ".opus"]:
        return suffix
    return ".wav"


def _persist_audio_bytes(audio_bytes: bytes, ext: str) -> str:
    MEDIA_AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    file_name = f"{uuid.uuid4().hex}{ext}"
    target = MEDIA_AUDIO_DIR / file_name
    with open(target, "wb") as fp:
        fp.write(audio_bytes)
    return f"/media/audio/{file_name}"


def _persist_audio_array_to_wav(audio_array: List[Any], sampling_rate: int) -> str:
    """将数组采样值落盘为 wav 文件"""
    if not audio_array:
        raise ValueError("audio.array 为空")

    pcm_bytes = bytearray()
    for sample in audio_array:
        val = float(sample)
        if val > 1:
            val = 1
        if val < -1:
            val = -1
        pcm_bytes.extend(struct.pack('<h', int(val * 32767)))

    MEDIA_AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    file_name = f"{uuid.uuid4().hex}.wav"
    target = MEDIA_AUDIO_DIR / file_name

    with wave.open(str(target), 'wb') as wav_fp:
        wav_fp.setnchannels(1)
        wav_fp.setsampwidth(2)
        wav_fp.setframerate(max(1, int(sampling_rate)))
        wav_fp.writeframes(bytes(pcm_bytes))

    return f"/media/audio/{file_name}"


def _persist_audio_from_path(source_path: str) -> str:
    if _is_url(source_path):
        return source_path

    source = Path(source_path)
    if not source.exists() or not source.is_file():
        return source_path

    MEDIA_AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    ext = _safe_audio_extension(source_path)
    file_name = f"{uuid.uuid4().hex}{ext}"
    target = MEDIA_AUDIO_DIR / file_name
    shutil.copy2(source, target)
    return f"/media/audio/{file_name}"


def _pick_transcript(item: Dict[str, Any]) -> Optional[str]:
    for key in ["transcript", "text", "sentence", "raw_text", "target_text", "output"]:
        val = item.get(key)
        if isinstance(val, str) and val.strip():
            return val
    return None


def _normalize_audio_item(item: Dict[str, Any], idx: int) -> Dict[str, Any]:
    audio_id = str(item.get("audio_id") or item.get("id") or f"AUDIO-{idx + 1}")
    audio_url = item.get("audio_url")
    transcript = _pick_transcript(item)

    duration = item.get("duration_seconds")
    language = item.get("language") or item.get("lang")

    audio_payload = item.get("audio")
    if isinstance(audio_payload, dict):
        payload_bytes = audio_payload.get("bytes")
        payload_path = audio_payload.get("path")
        payload_array = audio_payload.get("array")
        sampling_rate = audio_payload.get("sampling_rate") or 16000
        ext = _safe_audio_extension(payload_path if isinstance(payload_path, str) else None)

        if isinstance(payload_bytes, bytes) and payload_bytes:
            audio_url = _persist_audio_bytes(payload_bytes, ext)
        elif isinstance(payload_array, list) and payload_array:
            audio_url = _persist_audio_array_to_wav(payload_array, int(sampling_rate))
        elif isinstance(payload_path, str) and payload_path.strip():
            audio_url = _persist_audio_from_path(payload_path)

        if duration is None and audio_payload.get("duration") is not None:
            duration = audio_payload.get("duration")
        if language is None and audio_payload.get("language") is not None:
            language = audio_payload.get("language")

    elif isinstance(audio_payload, str) and audio_payload.strip():
        audio_url = _persist_audio_from_path(audio_payload)

    if not audio_url:
        raise ValueError("音频样本缺少 audio_url 或 audio 字段")

    return {
        "audio_id": audio_id,
        "audio_url": str(audio_url),
        "transcript": transcript,
        "duration_seconds": str(duration) if duration is not None else None,
        "language": str(language) if language is not None else None,
    }


def _parse_rows_from_file(content: bytes, filename: str, domain: str) -> List[dict]:
    if not filename:
        raise HTTPException(status_code=400, detail="文件名为空")

    lower_name = filename.lower()

    if lower_name.endswith('.json'):
        try:
            data = json.loads(content)
        except json.JSONDecodeError:
            lines = content.decode('utf-8').strip().split('\n')
            data = [json.loads(line) for line in lines if line.strip()]
    elif lower_name.endswith('.jsonl') or lower_name.endswith('.txt'):
        lines = content.decode('utf-8').strip().split('\n')
        data = [json.loads(line) for line in lines if line.strip()]
    elif lower_name.endswith('.parquet'):
        try:
            import pandas as pd
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"服务端缺少 parquet 解析依赖，请安装 pandas/pyarrow: {exc}"
            )

        df = pd.read_parquet(io.BytesIO(content))
        data = df.to_dict(orient="records")
    else:
        raise HTTPException(status_code=400, detail="只支持 .json, .jsonl, .txt 或 .parquet 文件")

    if isinstance(data, dict) and 'data' in data and isinstance(data['data'], list):
        data = data['data']
    elif not isinstance(data, list):
        data = [data]

    if domain == "audio":
        normalized = []
        for idx, row in enumerate(data):
            if not isinstance(row, dict):
                continue
            normalized.append(_normalize_audio_item(row, idx))
        return normalized

    return data


def _fetch_minio_object_bytes(request: MinioImportRequest) -> bytes:
    """从 MinIO 读取对象字节"""
    try:
        from minio import Minio
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"服务端缺少 MinIO 依赖，请安装 minio: {exc}")

    client = Minio(
        request.endpoint,
        access_key=request.access_key,
        secret_key=request.secret_key,
        secure=request.secure,
    )

    response = client.get_object(request.bucket, request.object_name)
    try:
        return response.read()
    finally:
        response.close()
        response.release_conn()


def _resolve_model_and_id_field(domain: str):
    model_cls = Sample
    id_field = "sentence_id"

    if domain == "terminology":
        model_cls = TerminologySample
        id_field = "term_id"
    elif domain == "qa":
        model_cls = QASample
        id_field = "qa_id"
    elif domain == "alignment":
        model_cls = AlignmentSample
        id_field = "alignment_id"
    elif domain == "process":
        model_cls = ProcessSample
        id_field = "rule_id"
    elif domain == "case":
        model_cls = CaseSample
        id_field = "case_id"
    elif domain in ["struction", "scenario"]:
        model_cls = ScenarioSample
        id_field = "instruction_id"
    elif domain == "audio":
        model_cls = AudioSample
        id_field = "audio_id"

    return model_cls, id_field


def _current_item_id(item: dict, id_field: str, idx: int) -> str:
    if id_field == "term_id":
        return str(item.get('term_id', f"TERM-{idx + 1}"))
    if id_field == "qa_id":
        return str(item.get('qa_id', f"QA-{idx + 1}"))
    if id_field == "alignment_id":
        return str(item.get('alignment_id', f"ALIGN-{idx + 1}"))
    if id_field == "rule_id":
        return str(item.get('rule_id', f"RULE-{idx + 1}"))
    if id_field == "case_id":
        return str(item.get('case_id', f"CASE-{idx + 1}"))
    if id_field == "instruction_id":
        return str(item.get('instruction_id', f"INST-{idx + 1}"))
    if id_field == "audio_id":
        return str(item.get('audio_id', f"AUDIO-{idx + 1}"))

    basic = item.get('basic_layer', {})
    return str(basic.get('sentence_id', f"IMPORT-{idx + 1}"))


def process_single_sample(corpus_id: int, item: dict, idx: int, domain: str):
    """处理单条样本数据，返回对应模型对象"""
    if domain == "terminology" or "term_id" in item:
        return TerminologySample(
            corpus_id=corpus_id,
            term_id=item.get('term_id', f"TERM-{idx + 1}"),
            term=item.get('term', ''),
            abbreviation=item.get('abbreviation'),
            category=item.get('category', 'general'),
            definition=item.get('definition', ''),
            examples=item.get('examples', []),
            related_terms=item.get('related_terms', []),
            translations=item.get('translations', {}),
            tags=item.get('tags', [])
        )
    if domain == "qa" or "qa_id" in item:
        return QASample(
            corpus_id=corpus_id,
            qa_id=item.get('qa_id', f"QA-{idx + 1}"),
            question=item.get('question', ''),
            question_type=item.get('question_type'),
            answer=item.get('answer', ''),
            keywords=item.get('keywords', []),
            category=item.get('category', 'general'),
            tags=item.get('tags', [])
        )
    if domain == "alignment" or "alignment_id" in item:
        return AlignmentSample(
            corpus_id=corpus_id,
            alignment_id=item.get('alignment_id', f"ALIGN-{idx + 1}"),
            source_text=item.get('source_text', ''),
            target_text=item.get('target_text', ''),
            context=item.get('context'),
            domain=item.get('domain')
        )
    if domain == "process" or "rule_id" in item:
        return ProcessSample(
            corpus_id=corpus_id,
            rule_id=item.get('rule_id', f"RULE-{idx + 1}"),
            scenario=item.get('scenario', ''),
            condition=item.get('condition', ''),
            result=item.get('result', ''),
            category=item.get('category')
        )
    if domain == "case" or "case_id" in item:
        return CaseSample(
            corpus_id=corpus_id,
            case_id=item.get('case_id', f"CASE-{idx + 1}"),
            case_title=item.get('case_title', ''),
            case_type=item.get('case_type'),
            background=item.get('background'),
            situation=item.get('situation'),
            outcome=item.get('outcome'),
            conclusion=item.get('conclusion'),
            tags=item.get('tags', [])
        )
    if domain in ["struction", "scenario"] or "instruction_id" in item:
        return ScenarioSample(
            corpus_id=corpus_id,
            instruction_id=item.get('instruction_id', f"INST-{idx + 1}"),
            instruction_type=item.get('instruction_type', 'scenario'),
            task=item.get('task', ''),
            output=item.get('output', ''),
            tags=item.get('tags', [])
        )
    if domain == "audio" or "audio_id" in item:
        normalized_audio = _normalize_audio_item(item, idx)
        return AudioSample(
            corpus_id=corpus_id,
            audio_id=normalized_audio["audio_id"],
            audio_url=normalized_audio["audio_url"],
            transcript=normalized_audio.get("transcript"),
            duration_seconds=normalized_audio.get("duration_seconds"),
            language=normalized_audio.get("language")
        )

    basic = item.get('basic_layer', {})
    language = item.get('language_layer', {})
    pragmatic = item.get('pragmatic_layer', {})
    style = item.get('style_layer', {})

    ts_obj = parse_timestamp(basic.get('timestamp'))
    el_val = language.get('english_loanwords', [])
    intent_val = pragmatic.get('intent', [])
    abbr_val = style.get('abbreviations_handled', {})

    return Sample(
        corpus_id=corpus_id,
        sentence_id=basic.get('sentence_id', f"IMPORT-{idx + 1}"),
        platform=basic.get('platform'),
        timestamp=ts_obj,
        source_text=language.get('source_text_zh', ''),
        raw_text=language.get('raw_text_ms'),
        normalized_text=language.get('normalized_text_ms'),
        english_loanwords=el_val if isinstance(el_val, list) else [],
        intent=intent_val if isinstance(intent_val, (list, dict)) else [],
        sentiment=pragmatic.get('sentiment', 'neutral'),
        business_scenario=pragmatic.get('business_scenario'),
        style=style.get('style'),
        contains_rojak=style.get('contains_rojak', False),
        abbreviations_handled=abbr_val if isinstance(abbr_val, dict) else {}
    )


async def _import_items_to_corpus(db: AsyncSession, corpus: Corpus, data: List[dict]) -> Tuple[int, List[str]]:
    model_cls, id_field = _resolve_model_and_id_field(corpus.domain)
    id_attr = getattr(model_cls, id_field)

    existing_query = select(id_attr).where(model_cls.corpus_id == corpus.id)
    existing_result = await db.execute(existing_query)
    existing_ids = {str(val) for val in existing_result.scalars().all()}

    imported_count = 0
    errors: List[str] = []

    for idx, item in enumerate(data):
        try:
            curr_id = _current_item_id(item, id_field, idx)
            if curr_id in existing_ids:
                errors.append(f"第 {idx + 1} 条数据 ID 重复 ({curr_id})，已跳过")
                continue

            sample = process_single_sample(corpus.id, item, idx, corpus.domain)
            db.add(sample)
            imported_count += 1
            existing_ids.add(curr_id)
        except Exception as exc:
            logger.exception("Error importing row %s", idx)
            errors.append(f"第 {idx + 1} 条数据导入失败: {str(exc)}")

    return imported_count, errors


@router.post("/import/{corpus_id}")
async def import_samples(
    corpus_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """批量导入语料样本（支持 JSON/JSONL/TXT/PARQUET）"""
    result = await db.execute(select(Corpus).where(Corpus.id == corpus_id))
    corpus = result.scalar_one_or_none()

    if not corpus:
        raise HTTPException(status_code=404, detail="语料库不存在")

    try:
        content = await file.read()
        data = _parse_rows_from_file(content, file.filename or "", corpus.domain)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"文件读取或解析失败: {str(exc)}")

    imported_count, errors = await _import_items_to_corpus(db, corpus, data)

    if imported_count > 0:
        try:
            await db.commit()
            corpus.sentence_count += imported_count
            await db.commit()
        except Exception as exc:
            await db.rollback()
            raise HTTPException(status_code=500, detail=f"数据库写入失败: {str(exc)}")

    return ApiResponse(
        success=True,
        message=f"导入完成。成功: {imported_count}, 跳过/失败: {len(errors)}",
        data={
            "imported": imported_count,
            "errors": errors
        }
    )


@router.post("/import-from-minio/{corpus_id}")
async def import_samples_from_minio(
    corpus_id: int,
    request: MinioImportRequest,
    db: AsyncSession = Depends(get_db)
):
    """从 MinIO 对象导入语料样本（推荐用于 parquet 音频语料）"""
    result = await db.execute(select(Corpus).where(Corpus.id == corpus_id))
    corpus = result.scalar_one_or_none()
    if not corpus:
        raise HTTPException(status_code=404, detail="语料库不存在")

    try:
        content = _fetch_minio_object_bytes(request)
        filename = Path(request.object_name).name
        data = _parse_rows_from_file(content, filename, corpus.domain)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"MinIO 文件读取或解析失败: {str(exc)}")

    imported_count, errors = await _import_items_to_corpus(db, corpus, data)

    if imported_count > 0:
        try:
            await db.commit()
            corpus.sentence_count += imported_count
            await db.commit()
        except Exception as exc:
            await db.rollback()
            raise HTTPException(status_code=500, detail=f"数据库写入失败: {str(exc)}")

    return ApiResponse(
        success=True,
        message=f"导入完成。成功: {imported_count}, 跳过/失败: {len(errors)}",
        data={"imported": imported_count, "errors": errors}
    )


@router.post("/create-with-samples")
async def create_corpus_with_samples(
    request: CreateCorpusWithSamplesRequest,
    db: AsyncSession = Depends(get_db)
):
    """创建语料库并导入样本（JSON 对象数组）"""
    corpus = Corpus(
        name=request.name,
        description=request.description,
        source_lang=request.source_lang,
        target_lang=request.target_lang,
        source_name=request.source_name,
        target_name=request.target_name,
        domain=request.domain,
        source_type=request.source_type,
        is_public=request.is_public,
        sentence_count=0
    )
    db.add(corpus)
    await db.flush()

    samples_to_process = request.samples
    if len(samples_to_process) == 1 and isinstance(samples_to_process[0], dict) and 'data' in samples_to_process[0]:
        if isinstance(samples_to_process[0]['data'], list):
            samples_to_process = samples_to_process[0]['data']

    imported_count, errors = await _import_items_to_corpus(db, corpus, samples_to_process)
    corpus.sentence_count = imported_count

    try:
        await db.commit()
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"保存失败: {str(exc)}")

    return ApiResponse(
        success=True,
        message=f"成功创建语料库并导入 {imported_count} 条样本",
        data={
            "corpus_id": corpus.id,
            "corpus_name": corpus.name,
            "imported": imported_count,
            "errors": errors
        }
    )


@router.post("/create-with-file")
async def create_corpus_with_file(
    name: str = Form(...),
    description: str = Form(""),
    source_lang: str = Form(...),
    target_lang: str = Form(...),
    source_name: str = Form(...),
    target_name: str = Form(...),
    domain: str = Form("general"),
    source_type: str = Form("official"),
    is_public: bool = Form(True),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """创建语料库并通过文件导入样本（支持 JSON/JSONL/TXT/PARQUET）"""
    corpus = Corpus(
        name=name,
        description=description,
        source_lang=source_lang,
        target_lang=target_lang,
        source_name=source_name,
        target_name=target_name,
        domain=domain,
        source_type=source_type,
        is_public=is_public,
        sentence_count=0
    )
    db.add(corpus)
    await db.flush()

    try:
        content = await file.read()
        data = _parse_rows_from_file(content, file.filename or "", domain)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"文件读取或解析失败: {str(exc)}")

    imported_count, errors = await _import_items_to_corpus(db, corpus, data)
    corpus.sentence_count = imported_count

    try:
        await db.commit()
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"保存失败: {str(exc)}")

    return ApiResponse(
        success=True,
        message=f"成功创建语料库并导入 {imported_count} 条样本",
        data={
            "corpus_id": corpus.id,
            "corpus_name": corpus.name,
            "imported": imported_count,
            "errors": errors
        }
    )


@router.post("/create-with-minio")
async def create_corpus_with_minio(
    name: str = Form(...),
    description: str = Form(""),
    source_lang: str = Form(...),
    target_lang: str = Form(...),
    source_name: str = Form(...),
    target_name: str = Form(...),
    domain: str = Form("general"),
    source_type: str = Form("official"),
    is_public: bool = Form(True),
    endpoint: str = Form(...),
    access_key: str = Form(...),
    secret_key: str = Form(...),
    bucket: str = Form(...),
    object_name: str = Form(...),
    secure: bool = Form(False),
    db: AsyncSession = Depends(get_db)
):
    """创建语料库并从 MinIO 对象导入"""
    corpus = Corpus(
        name=name,
        description=description,
        source_lang=source_lang,
        target_lang=target_lang,
        source_name=source_name,
        target_name=target_name,
        domain=domain,
        source_type=source_type,
        is_public=is_public,
        sentence_count=0
    )
    db.add(corpus)
    await db.flush()

    request = MinioImportRequest(
        endpoint=endpoint,
        access_key=access_key,
        secret_key=secret_key,
        bucket=bucket,
        object_name=object_name,
        secure=secure
    )

    try:
        content = _fetch_minio_object_bytes(request)
        filename = Path(object_name).name
        data = _parse_rows_from_file(content, filename, domain)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"MinIO 文件读取或解析失败: {str(exc)}")

    imported_count, errors = await _import_items_to_corpus(db, corpus, data)
    corpus.sentence_count = imported_count

    try:
        await db.commit()
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"保存失败: {str(exc)}")

    return ApiResponse(
        success=True,
        message=f"成功创建语料库并导入 {imported_count} 条样本",
        data={
            "corpus_id": corpus.id,
            "corpus_name": corpus.name,
            "imported": imported_count,
            "errors": errors
        }
    )
