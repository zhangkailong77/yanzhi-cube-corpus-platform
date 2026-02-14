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
from api.schemas import ApiResponse

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
        # 支持 .json 或 .txt (JSONL) 文件
        if file.filename.endswith('.json'):
            try:
                data = json.loads(content)
            except json.JSONDecodeError:
                # 尝试作为 jsonl 处理，防止用户扩展名写错
                lines = content.decode('utf-8').strip().split('\n')
                data = [json.loads(line) for line in lines if line.strip()]
        elif file.filename.endswith('.txt') or file.filename.endswith('.jsonl'):
            # 尝试解析为 JSONL（每行一个 JSON）
            lines = content.decode('utf-8').strip().split('\n')
            data = [json.loads(line) for line in lines if line.strip()]
        else:
            raise HTTPException(status_code=400, detail="只支持 .json, .jsonl 或 .txt 文件")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"文件读取或解析失败: {str(e)}")

    # 确保是列表
    if not isinstance(data, list):
        data = [data]

    # 导入样本
    imported_count = 0
    errors = []

    for idx, item in enumerate(data):
        try:
            # 解析四层标注结构
            basic = item.get('basic_layer', {})
            language = item.get('language_layer', {})
            pragmatic = item.get('pragmatic_layer', {})
            style = item.get('style_layer', {})

            # 使用 parse_timestamp 处理时间
            ts_obj = parse_timestamp(basic.get('timestamp'))
            # 如果解析得到 None，且你想给个默认值（比如当前时间），可以在这里处理：
            # if ts_obj is None: ts_obj = datetime.now()

            # 2. 处理 JSON 字段 (新增修复)
            # 确保 english_loanwords 是列表，而不是字符串
            el_val = language.get('english_loanwords')
            if isinstance(el_val, str):
                try:
                    el_val = json.loads(el_val)
                except:
                    el_val = []
            
            # 确保 intent 是列表/对象
            intent_val = pragmatic.get('intent')
            if isinstance(intent_val, str):
                try:
                    intent_val = json.loads(intent_val)
                except:
                    intent_val = []

            # 确保 abbreviations_handled 是字典
            abbr_val = style.get('abbreviations_handled')
            if isinstance(abbr_val, str):
                try:
                    abbr_val = json.loads(abbr_val)
                except:
                    abbr_val = {}

            # 创建样本记录
            sample = Sample(
                corpus_id=corpus_id,
                sentence_id=basic.get('sentence_id', f"IMPORT-{idx+1}"),
                platform=basic.get('platform'),
                timestamp=ts_obj,
                source_text=language.get('source_text_zh', ''),
                raw_text=language.get('raw_text_ms'),
                normalized_text=language.get('normalized_text_ms'),
                
                # 修改这里：传入处理后的 Python 对象
                english_loanwords=el_val, 
                intent=intent_val,
                sentiment=pragmatic.get('sentiment', 'neutral'),
                business_scenario=pragmatic.get('business_scenario'),
                style=style.get('style'),
                contains_rojak=style.get('contains_rojak', False),
                
                # 修改这里：传入处理后的 Python 对象
                abbreviations_handled=abbr_val
            )
            db.add(sample)
            imported_count += 1

        except Exception as e:
            # 打印具体错误到控制台，方便调试
            print(f"Error importing row {idx}: {str(e)}")
            errors.append(f"第 {idx + 1} 条数据导入失败: {str(e)}")

    # 提交事务
    # 注意：如果数据量非常大（例如超过1000条），建议分批 commit，否则内存占用过高
    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"数据库写入失败: {str(e)}")

    # 更新语料库的句子数
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
    name: str,
    description: str,
    source_lang: str,
    target_lang: str,
    source_name: str,
    target_name: str,
    domain: str = "general",
    source_type: str = "official",
    is_public: bool = True,
    samples: List[dict] = [],
    db: AsyncSession = Depends(get_db)
):
    """创建语料库并导入样本"""
    # 创建语料库
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
        sentence_count=len(samples)
    )
    db.add(corpus)
    await db.commit()
    await db.refresh(corpus)

    # 导入样本
    imported_count = 0
    for idx, item in enumerate(samples):
        try:
            basic = item.get('basic_layer', {})
            language = item.get('language_layer', {})
            pragmatic = item.get('pragmatic_layer', {})
            style = item.get('style_layer', {})
            
            # 同样应用时间解析修复
            ts_obj = parse_timestamp(basic.get('timestamp'))

            sample = Sample(
                corpus_id=corpus.id,
                sentence_id=basic.get('sentence_id', f"NEW-{idx+1}"),
                platform=basic.get('platform'),
                timestamp=ts_obj,
                source_text=language.get('source_text_zh', ''),
                raw_text=language.get('raw_text_ms'),
                normalized_text=language.get('normalized_text_ms'),
                english_loanwords=language.get('english_loanwords'),
                intent=pragmatic.get('intent'),
                sentiment=pragmatic.get('sentiment', 'neutral'),
                business_scenario=pragmatic.get('business_scenario'),
                style=style.get('style'),
                contains_rojak=style.get('contains_rojak', False),
                abbreviations_handled=style.get('abbreviations_handled')
            )
            db.add(sample)
            imported_count += 1
        except Exception as e:
            # 这里的 pass 建议改为记录日志，否则出错了不知道原因
            print(f"Sample import failed: {e}") 
            pass

    await db.commit()

    return ApiResponse(
        success=True,
        message=f"成功创建语料库并导入 {imported_count} 条样本",
        data={
            "corpus_id": corpus.id,
            "corpus_name": corpus.name,
            "imported": imported_count
        }
    )