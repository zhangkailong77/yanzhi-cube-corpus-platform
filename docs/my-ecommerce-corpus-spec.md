# 马来西亚跨境电商语料库 - 格式规范与场景设计

## 格式结构分析

每个语料条目包含 4 层：

### 1. basic_layer（基础层）
- `sentence_id`: 句子唯一标识符（格式：MY-CS-YYYY-XXXX）
- `timestamp`: 时间戳（ISO 8601格式）
- `platform`: 平台名称

### 2. language_layer（语言层）
- `source_text_zh`: 中文源文（标准普通话）
- `raw_text_ms`: 马来语原文（含口语、缩写、混用）
- `normalized_text_ms`: 马来语规范化文本（标准马来语）
- `english_loanwords`: 英语借词列表

### 3. pragmatic_layer（语用层）
- `intent`: 用户意图列表（可包含多个意图）
- `sentiment`: 情感标签
- `business_scenario`: 业务场景

### 4. style_layer（风格层）
- `style`: 风格类型
- `contains_rojak`: 是否含马来-英语混用
- `abbreviations_handled`: 缩写处理映射表

## 语料内容计划

### 平台选择
- Shopee
- TikTok
- Lazada
- Lelong

### 业务场景
- 售前
- 售中
- 售后

### 意图覆盖

#### 售前场景
- 询问真伪
- 询问库存
- 询问发货时间
- 砍价
- 产品细节咨询

#### 售中场景
- 催发货
- 修改地址
- 确认订单

#### 售后场景
- 退换货
- 物流投诉
- 评价反馈
- 询问保修

## 建议的语料场景（8-10条）

1. 售前-询问尺寸
2. 售前-砍价
3. 售前-确认正品
4. 售前-产品咨询
5. 售中-催发货
6. 售中-修改地址
7. 售后-退换货
8. 售后-物流投诉
9. 售后-评价
10. 售后-询问保修

## 情感标签说明
- `neutral`: 中性
- `positive`: 积极
- `negative`: 消极
- `negative`: 沮丧
- `angry`: 愤怒

## 风格类型说明
- `Colloquial`: 口语化
- `Formal`: 正式
- `Slang`: 俚语

## 缩写处理示例
```json
{
  "abbreviations_handled": {
    "brg": "barang",
    "ni": "ini",
    "kalo": "kalau",
    "sy": "saya",
    "blh": "boleh",
    "skrg": "sekarang"
  }
}
```