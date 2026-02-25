# 第三类别：多语对齐类

## 类别说明

**定义**：同一专业语义内容，在不同语言下的对应表达

**目标**：建立核心业务内容的多语言对照，支持跨语言查询和应用

---

## JSON格式定义

### 文件命名规范
```
align_{源语言}_{目标语言}.json

示例：
- align_zh_en.json（中文→英文）
- align_zh_th.json（中文→泰语）
- align_zh_ms.json（中文→马来语）
- align_zh_vi.json（中文→越南语）
```

### JSON结构模板

```json
{
  "meta": {
    "version": "1.0",
    "corpus_type": "alignment",
    "source_lang": "zh",
    "target_lang": "en",
    "domain": "trade",
    "created_by": "专家团队",
    "created_at": "2024-01-15T10:00:00Z",
    "description": "中文-英文多语对齐语料"
  },
  "data": [
    {
      "alignment_id": "ALIGN-001",
      "source_text": "海关清关流程包括申报、查验、征税和放行四个主要环节。",
      "target_text": "The customs clearance process includes four main stages: declaration, inspection, taxation, and release.",
      "context": "清关流程说明",
      "domain": "customs"
    }
  ]
}
```

---

## 字段说明

### 顶层 meta 字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `version` | string | 是 | 版本号（如：1.0） |
| `corpus_type` | string | 是 | 语料类型（固定值：alignment） |
| `source_lang` | string | 是 | 源语言代码（固定值：zh） |
| `target_lang` | string | 是 | 目标语言代码（en/th/ms/vi） |
| `domain` | string | 是 | 业务域（trade/customs/payment/logistics等） |
| `created_by` | string | 是 | 创建者/团队 |
| `created_at` | string | 是 | 创建时间（ISO 8601格式） |
| `description` | string | 是 | 语料描述 |

### 对齐记录字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `alignment_id` | string | 是 | 对齐唯一标识符（如：ALIGN-001） |
| `source_text` | string | 是 | 源语言文本（中文） |
| `target_text` | string | 是 | 目标语言文本（英文/泰语/马来语/越南语） |
| `context` | string | 否 | 上下文说明 |
| `domain` | string | 否 | 领域分类（如：customs、trade、logistics等） |

---

## 语言对规划

### 4组语言对

| 语言对 | 文件名 | 数量目标 | 生成方式 | 人工校对比例 |
|--------|--------|---------|---------|------------|
| CN-EN | align_zh_en.json | 300对 | 专家编写 + AI辅助 | 20% |
| CN-TH | align_zh_th.json | 200对 | AI直接翻译 | 30% |
| CN-MS | align_zh_ms.json | 200对 | AI直接翻译 | 30% |
| CN-VI | align_zh_vi.json | 200对 | AI直接翻译 | 30% |

**总计**：900对

### 目录结构
```
/align_import/
  ├── align_zh_en.json    # 中文-英文（300对）
  ├── align_zh_th.json    # 中文-泰语（200对）
  ├── align_zh_ms.json    # 中文-马来语（200对）
  └── align_zh_vi.json    # 中文-越南语（200对）
```

---

## 示例数据

### 示例1：流程描述 - CN-EN

```json
{
  "alignment_id": "ALIGN-001",
  "source_text": "海关清关流程包括申报、查验、征税和放行四个主要环节。",
  "target_text": "The customs clearance process includes four main stages: declaration, inspection, taxation, and release.",
  "context": "清关流程说明",
  "domain": "customs"
}
```

### 示例2：商务沟通 - CN-TH

```json
{
  "alignment_id": "ALIGN-101",
  "source_text": "尊敬的客户，您好！您的订单已发货，预计7-10个工作日送达。",
  "target_text": "เรียนลูกค้าที่เคารพ สวัสดี! คำสั่งซื้อของคุณได้จัดส่งแล้ว คาดว่าจะถึงภายใน 7-10 วันทำการ",
  "context": "订单发货通知",
  "domain": "logistics"
}
```

### 示例3：产品描述 - CN-MS

```json
{
  "alignment_id": "ALIGN-201",
  "source_text": "该产品采用优质不锈钢材料制作，具有耐腐蚀、耐高温的特性，适用于食品加工行业。",
  "target_text": "Produk ini diperbuat daripada bahan keluli tahan karat berkualiti tinggi, mempunyai ciri tahan kakisan dan tahan haba, sesuai untuk industri pemprosesan makanan.",
  "context": "产品特性说明",
  "domain": "product"
}
```

### 示例4：合同条款 - CN-VI

```json
{
  "alignment_id": "ALIGN-301",
  "source_text": "买方应在收到货物后7个工作日内进行验收，如有质量问题应在15个工作日内提出异议。",
  "target_text": "Người mua nên tiến hành kiểm tra trong vòng 7 ngày làm việc sau khi nhận hàng, nếu có vấn đề về chất lượng nên đưa ra ý kiến phản đối trong vòng 15 ngày làm việc.",
  "context": "验收条款",
  "domain": "contract"
}
```

### 示例5：原产地证书说明 - CN-EN

```json
{
  "alignment_id": "ALIGN-002",
  "source_text": "出口货物需要提供原产地证书才能享受关税优惠。",
  "target_text": "Export goods need to provide Certificate of Origin to enjoy tariff preferences.",
  "context": "原产地证书说明",
  "domain": "trade"
}
```

### 示例6：支付方式说明 - CN-EN

```json
{
  "alignment_id": "ALIGN-003",
  "source_text": "使用信用证支付可以降低出口商的收汇风险。",
  "target_text": "Using Letter of Credit payment can reduce exchange collection risk for exporters.",
  "context": "支付方式说明",
  "domain": "payment"
}
```

### 示例7：HS编码查询 - CN-TH

```json
{
  "alignment_id": "ALIGN-102",
  "source_text": "查询该商品的HS编码可以确定适用的关税税率。",
  "target_text": "การค้นหารหัส HS ของสินค้านั้นสามารถกำหนดอัตราภาษีศุลกากรที่เกี่ยวข้องได้",
  "context": "HS编码查询",
  "domain": "customs"
}
```

### 示例8：质量保证声明 - CN-VI

```json
{
  "alignment_id": "ALIGN-302",
  "source_text": "本产品符合国际质量标准，通过ISO9001质量管理体系认证。",
  "target_text": "Sản phẩm này đáp ứng các tiêu chuẩn chất lượng quốc tế, được chứng nhận theo hệ thống quản lý chất lượng ISO9001.",
  "context": "质量保证声明",
  "domain": "quality"
}
```

---

## 多语对齐策略

### 源语言策略
- **源语言**：统一为中文（zh）
- **语料来源**：复用第一、二类别的中文语料，以及专家编写的其他内容
- **质量保证**：中文语料由专家审核，确保准确性

### 生成方式

#### 1. CN-EN（300对）
- **生成方式**：专家编写 + AI辅助
- **人工校对比例**：20%
- **质量标准**：高质量，术语准确，表达地道

#### 2. CN-TH/MS/VI（各200对）
- **生成方式**：AI直接翻译
- **人工校对比例**：30%
- **质量标准**：中等质量，基本准确，表达可接受

### 翻译Prompt模板

```
作为跨境贸易专家，请将以下中文文本翻译为[目标语言]。

要求：
1. 准确翻译专业术语（参考术语库）
2. 保持语义一致，不遗漏关键信息
3. 表达地道、自然、专业
4. 注意目标语言的语法和表达习惯

中文文本：
{source_text}

上下文：{context}

请返回目标语言的翻译。
```

### 语料来源与复用

#### 复用第一类别（术语类）
```
术语库 TERM-001: 原产地证书
  ├── definition: 证明货物原产地的官方文件...
  └── examples: ["出口货物需要提供原产地证书才能享受关税优惠"]

对齐库 ALIGN-002 (CN-EN):
  ├── source_text: "出口货物需要提供原产地证书才能享受关税优惠"
  └── target_text: "Export goods need to provide Certificate of Origin to enjoy tariff preferences."

对齐库 ALIGN-102 (CN-TH):
  ├── source_text: "出口货物需要提供原产地证书才能享受关税优惠"
  └── target_text: "สินค้าส่งออกต้องจัดหาใบรับรองถิ่นกำเนิดเพื่อรับสิทธิประโยชน์ภาษี"
```

#### 复用第二类别（问答类）
```
问答库 QA-001（中文）:
  ├── question: "跨境贸易中的DDP和DDI条款有什么区别？"
  └── answer: "DDP（完税后交货）指..."

对齐库 ALIGN-003 (CN-EN):
  ├── source_text: "跨境贸易中的DDP和DDI条款有什么区别？"
  └── target_text: "What is the difference between DDP and DDI terms in cross-border trade?"

对齐库 ALIGN-103 (CN-MS):
  ├── source_text: "跨境贸易中的DDP和DDI条款有什么区别？"
  └── target_text: "Apakah perbezaan antara klausa DDP dan DDI dalam perdagangan rentas sempadan?"
```

---

## 与其他类别的关联

### 与第一类别（术语类）的关联
- **术语一致性**：对齐文本中的术语与术语库保持一致
- **翻译参考**：使用术语库的translations作为翻译参考
- **例句复用**：术语库中的examples可以直接用于对齐

### 与第二类别（问答类）的关联
- **问题对齐**：将问答中的问题文本翻译成其他语言，形成对齐
- **答案对齐**：将问答中的答案文本翻译成其他语言，形成对齐
- **场景扩展**：问答库中的场景可扩展为对齐语料

### 跨类别复用流程

```
步骤1：从术语库/问答库提取中文文本
  ↓
步骤2：使用AI翻译为目标语言（EN/TH/MS/VI）
  ↓
步骤3：人工校对（CN-EN 20%，其他 30%）
  ↓
步骤4：生成对齐JSON文件
  ↓
步骤5：导入对齐库，建立跨语言关联索引
```

---

## 数据验证规则

### 通用验证规则
1. **JSON格式验证**：文件必须是有效的JSON格式
2. **字段类型验证**：所有字段类型必须符合定义
3. **必填字段验证**：必填字段不能为空或null
4. **唯一性验证**：alignment_id必须在文件内唯一
5. **枚举值验证**：source_lang、target_lang、domain等字段必须在定义的范围内
6. **格式验证**：日期、时间等格式必须正确（如created_at使用ISO 8601格式）

### 对齐特定验证规则
1. **alignment_id格式**：必须符合 ALIGN-XXX 的格式（XXX为数字）
2. **source_text长度**：不能少于5个字符
3. **target_text长度**：不能少于5个字符
4. **source_lang固定值**：必须为"zh"（中文）
5. **target_lang枚举**：必须是有效的目标语言代码（en/th/ms/vi）
6. **domain枚举**：建议使用预定义的领域值

---

## 批量导入示例

### 目录结构
```
/align_import/
  ├── align_zh_en.json    # 中文-英文
  ├── align_zh_th.json    # 中文-泰语
  ├── align_zh_ms.json    # 中文-马来语
  └── align_zh_vi.json    # 中文-越南语
```

### 批量导入的align_zh_en.json（包含多条）

```json
{
  "meta": {
    "version": "1.0",
    "corpus_type": "alignment",
    "source_lang": "zh",
    "target_lang": "en",
    "domain": "trade",
    "created_by": "专家团队",
    "created_at": "2024-01-15T10:00:00Z",
    "description": "中文-英文多语对齐语料"
  },
  "data": [
    {
      "alignment_id": "ALIGN-001",
      "source_text": "海关清关流程包括申报、查验、征税和放行四个主要环节。",
      "target_text": "The customs clearance process includes four main stages: declaration, inspection, taxation, and release.",
      "context": "清关流程说明",
      "domain": "customs"
    },
    {
      "alignment_id": "ALIGN-002",
      "source_text": "出口货物需要提供原产地证书才能享受关税优惠。",
      "target_text": "Export goods need to provide Certificate of Origin to enjoy tariff preferences.",
      "context": "原产地证书说明",
      "domain": "trade"
    },
    {
      "alignment_id": "ALIGN-003",
      "source_text": "使用信用证支付可以降低出口商的收汇风险。",
      "target_text": "Using Letter of Credit payment can reduce exchange collection risk for exporters.",
      "context": "支付方式说明",
      "domain": "payment"
    },
    {
      "alignment_id": "ALIGN-004",
      "source_text": "买方应在收到货物后7个工作日内进行验收，如有质量问题应在15个工作日内提出异议。",
      "target_text": "Buyer should conduct acceptance within 7 working days after receiving goods, and raise objections within 15 working days if there are quality issues.",
      "context": "验收条款",
      "domain": "contract"
    },
    {
      "alignment_id": "ALIGN-005",
      "source_text": "该产品符合国际质量标准，通过ISO9001质量管理体系认证。",
      "target_text": "This product meets international quality standards and is certified under ISO9001 quality management system.",
      "context": "质量保证声明",
      "domain": "quality"
    }
  ]
}
```

---

## 数量目标

### 语言对数量分布

| 语言对 | 数量目标 | 生成方式 | 人工校对比例 | 阶段 |
|--------|---------|---------|------------|------|
| CN-EN | 300对 | 专家编写 + AI辅助 | 20% | 阶段3 |
| CN-TH | 200对 | AI直接翻译 | 30% | 阶段3 |
| CN-MS | 200对 | AI直接翻译 | 30% | 阶段3 |
| CN-VI | 200对 | AI直接翻译 | 30% | 阶段3 |
| **合计** | **900对** | - | - | - |

### 语料类型分布建议

| 类型 | CN-EN | CN-TH | CN-MS | CN-VI | 合计 |
|------|-------|-------|-------|-------|------|
| 流程描述 | 60 | 40 | 40 | 40 | 180 |
| 合同条款 | 60 | 40 | 40 | 40 | 180 |
| 商务沟通 | 50 | 30 | 30 | 30 | 140 |
| 产品描述 | 40 | 30 | 30 | 30 | 130 |
| 法规文本 | 30 | 20 | 20 | 20 | 90 |
| 其他 | 60 | 40 | 40 | 40 | 180 |
| **合计** | **300** | **200** | **200** | **200** | **900** |

---

## 注意事项

1. **alignment_id命名**：建议使用 ALIGN-{数字} 的格式，数字从001开始递增
2. **source_lang固定**：统一为"zh"（中文），所有对齐以中文为源语言
3. **target_lang区分**：不同文件使用不同的目标语言（en/th/ms/vi）
4. **术语一致性**：翻译时参考术语库，确保专业术语翻译一致
5. **context可选**：context字段为可选，建议提供以便理解上下文
6. **domain可选**：domain字段为可选，建议提供以便分类和检索
7. **语料复用**：可复用第一、二类别的中文语料，提高效率
8. **人工校对**：CN-EN校对比例20%，其他语言30%，确保翻译质量
9. **文件命名**：严格按照 align_zh_{目标语言}.json 格式命名
10. **跨语言关联**：保持alignment_id在所有语言对中的唯一性，便于跨语言查询

---

## 质量控制建议

### 1. 术语翻译一致性
- 建立术语对照表，确保关键术语翻译一致
- 优先使用第一类别术语库中的translations
- 缩写术语保留英文（如DDP、L/C、HS Code等）

### 2. 表达地道性
- 避免直译，注重目标语言的表达习惯
- 商务用语要正式、专业
- 注意目标语言的语法和用词

### 3. 语义完整性
- 确保翻译不遗漏关键信息
- 保持原文的语气和风格
- 对于文化差异较大的内容，适当调整表达方式

### 4. 人工校对标准
- **CN-EN**：重点检查术语准确性、表达地道性
- **CN-TH/MS/VI**：重点检查语法、词汇准确性、表达流畅性
- 建立校对记录，记录常见问题和改进建议

---

## 优势总结

### 1. 结构简洁
- 仅5个字段（3个必填 + 2个可选）
- 降低维护成本
- 提高导入效率

### 2. 灵活性强
- context和domain字段为可选
- 可根据实际需求决定是否使用
- 便于扩展和管理

### 3. 复用性高
- 可复用第一、二类别的语料
- 建立跨类别关联索引
- 提高语料利用效率

### 4. 统一管理
- 所有对齐以中文为源语言
- 便于统一维护和更新
- 降低管理复杂度
