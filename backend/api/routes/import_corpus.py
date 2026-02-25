"""
语料库批量导入 API
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import json
from datetime import datetime
from database.connection import get_db
from api.models.corpus import Corpus, Sample
from api.models.terminology import TerminologySample
from api.models.qa import QASample
from api.models.alignment import AlignmentSample
from api.models.process import ProcessSample
from api.models.case import CaseSample
from api.models.scenario import ScenarioSample
from api.schemas import ApiResponse
from api.schemas.corpus import CreateCorpusWithSamplesRequest

router = APIRouter(prefix="/corpus", tags=["语料库导入"])

def parse_timestamp(value: Optional[str]) -> Optional[datetime]:
    """
    解析时间戳字符串为 datetime 对象。
    解决 MySQL 报错 1292: Incorrect datetime value for '...Z'
    """
    if not value:
        return None
    
    # 1. 如果已经是 datetime 对象 (防御性编程)
    if isinstance(value, datetime):
        return value

    # 2. 清洗数据：移除末尾的 'Z' (表示 UTC)
    # MySQL DATETIME 通常是 naive 的（不带时区），直接去掉 Z 即可
    if isinstance(value, str):
        if value.endswith('Z'):
            value = value[:-1]  # 变成 '2024-11-16T10:20:05'
        
        # 3. 尝试 ISO 格式解析 (包含 T 的情况)
        try:
            return datetime.fromisoformat(value)
        except ValueError:
            pass

        # 4. 尝试标准日期时间格式 (空格分隔)
        try:
            return datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            pass
            
        # 5. 尝试仅日期格式
        try:
            return datetime.strptime(value, '%Y-%m-%d')
        except ValueError:
            pass

    # 如果都解析失败，返回 None (数据库存为 NULL) 或抛出异常
    # 这里选择返回 None，避免单条数据错误导致整个导入失败
    return None

def process_single_sample(corpus_id: int, item: dict, idx: int, domain: str):
    """处理单条样本数据，返回 Sample 或 TerminologySample 对象"""
    # 术语类处理逻辑
    # 优先级：1. 语料库领域是 terminology 2. 数据项包含 term_id
    if domain == "terminology" or "term_id" in item:
        return TerminologySample(
            corpus_id=corpus_id,
            term_id=item.get('term_id', f"TERM-{idx+1}"),
            term=item.get('term', ''),
            abbreviation=item.get('abbreviation'),
            category=item.get('category', 'general'),
            definition=item.get('definition', ''),
            examples=item.get('examples', []),
            related_terms=item.get('related_terms', []),
            translations=item.get('translations', {}),
            tags=item.get('tags', [])
        )
    elif domain == "qa" or "qa_id" in item:
        return QASample(
            corpus_id=corpus_id,
            qa_id=item.get('qa_id', f"QA-{idx+1}"),
            question=item.get('question', ''),
            question_type=item.get('question_type'),
            answer=item.get('answer', ''),
            keywords=item.get('keywords', []),
            category=item.get('category', 'general'),
            tags=item.get('tags', [])
        )
    elif domain == "alignment" or "alignment_id" in item:
        return AlignmentSample(
            corpus_id=corpus_id,
            alignment_id=item.get('alignment_id', f"ALIGN-{idx+1}"),
            source_text=item.get('source_text', ''),
            target_text=item.get('target_text', ''),
            context=item.get('context'),
            domain=item.get('domain')
        )
    elif domain == "process" or "rule_id" in item:
        return ProcessSample(
            corpus_id=corpus_id,
            rule_id=item.get('rule_id', f"RULE-{idx+1}"),
            scenario=item.get('scenario', ''),
            condition=item.get('condition', ''),
            result=item.get('result', ''),
            category=item.get('category')
        )
    elif domain == "case" or "case_id" in item:
        return CaseSample(
            corpus_id=corpus_id,
            case_id=item.get('case_id', f"CASE-{idx+1}"),
            case_title=item.get('case_title', ''),
            case_type=item.get('case_type'),
            background=item.get('background'),
            situation=item.get('situation'),
            outcome=item.get('outcome'),
            conclusion=item.get('conclusion'),
            tags=item.get('tags', [])
        )
    elif domain in ["struction", "scenario"] or "instruction_id" in item:
        return ScenarioSample(
            corpus_id=corpus_id,
            instruction_id=item.get('instruction_id', f"INST-{idx+1}"),
            instruction_type=item.get('instruction_type', 'scenario'),
            task=item.get('task', ''),
            output=item.get('output', ''),
            tags=item.get('tags', [])
        )
    else:
        # 普通文本类处理 (四层标注)
        basic = item.get('basic_layer', {})
        language = item.get('language_layer', {})
        pragmatic = item.get('pragmatic_layer', {})
        style = item.get('style_layer', {})
        
        ts_obj = parse_timestamp(basic.get('timestamp'))
        
        # 确保 JSON 字段处理
        el_val = language.get('english_loanwords', [])
        intent_val = pragmatic.get('intent', [])
        abbr_val = style.get('abbreviations_handled', {})

        return Sample(
            corpus_id=corpus_id,
            sentence_id=basic.get('sentence_id', f"IMPORT-{idx+1}"),
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

@router.post("/import/{corpus_id}")
async def import_samples(
    corpus_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """批量导入语料样本（JSON 格式）"""
    # 验证语料库是否存在
    result = await db.execute(select(Corpus).where(Corpus.id == corpus_id))
    corpus = result.scalar_one_or_none()

    if not corpus:
        raise HTTPException(status_code=404, detail="语料库不存在")

    # 读取文件内容
    try:
        content = await file.read()
        if file.filename.endswith('.json'):
            try:
                data = json.loads(content)
            except json.JSONDecodeError:
                # 尝试作为 jsonl 处理
                lines = content.decode('utf-8').strip().split('\n')
                data = [json.loads(line) for line in lines if line.strip()]
        elif file.filename.endswith('.jsonl') or file.filename.endswith('.txt'):
            lines = content.decode('utf-8').strip().split('\n')
            data = [json.loads(line) for line in lines if line.strip()]
        else:
            raise HTTPException(status_code=400, detail="只支持 .json, .jsonl 或 .txt 文件")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"文件读取或解析失败: {str(e)}")

    if isinstance(data, dict) and 'data' in data and isinstance(data['data'], list):
        data = data['data']
    elif not isinstance(data, list):
        data = [data]

    imported_count = 0
    errors = []

    for idx, item in enumerate(data):
        try:
            sample = process_single_sample(corpus_id, item, idx, corpus.domain)
            db.add(sample)
            imported_count += 1
        except Exception as e:
            print(f"Error importing row {idx}: {str(e)}")
            errors.append(f"第 {idx + 1} 条数据导入失败: {str(e)}")

    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"数据库写入失败: {str(e)}")

    corpus.sentence_count += imported_count
    await db.commit()

    return ApiResponse(
        success=True,
        message=f"成功导入 {imported_count} 条样本",
        data={
            "imported": imported_count,
            "errors": errors
        }
    )

@router.post("/create-with-samples")
async def create_corpus_with_samples(
    request: CreateCorpusWithSamplesRequest,
    db: AsyncSession = Depends(get_db)
):
    """创建语料库并导入样本"""
    # 创建语料库
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
        sentence_count=0  # 初始为0，后面累加
    )
    db.add(corpus)
    await db.flush() # 获取 corpus.id

    imported_count = 0
    errors = []
    
    # 处理可能的包装格式 {"meta": ..., "data": [...]}
    samples_to_process = request.samples
    if len(samples_to_process) == 1 and isinstance(samples_to_process[0], dict) and 'data' in samples_to_process[0]:
        if isinstance(samples_to_process[0]['data'], list):
            samples_to_process = samples_to_process[0]['data']

    for idx, item in enumerate(samples_to_process):
        try:
            sample = process_single_sample(corpus.id, item, idx, request.domain)
            db.add(sample)
            imported_count += 1
        except Exception as e:
            print(f"Sample import failed at index {idx}: {e}")
            errors.append(f"第 {idx + 1} 条数据导入失败: {str(e)}")

    corpus.sentence_count = imported_count
    
    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"保存失败: {str(e)}")

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
