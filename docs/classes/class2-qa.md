# 第二类别：专业问答类

## 类别说明

**定义**：围绕数字经济/跨境贸易的专业问题+标准答案

**目标**：构建跨境贸易核心问答库，提供准确、全面的专业知识解答

---

## JSON格式定义

### 文件命名规范
```
qa_{语言代码}.json

语言代码：
- zh: 中文
- en: 英语
- th: 泰语
- ms: 马来语
- vi: 越南语
```

### JSON结构模板

```json
{
  "meta": {
    "version": "1.0",
    "corpus_type": "qa",
    "language": "zh",
    "domain": "trade",
    "created_by": "专家团队",
    "created_at": "2024-01-15T10:00:00Z",
    "description": "跨境贸易专业问答库 - 中文"
  },
  "data": [
    {
      "qa_id": "QA-001",
      "question": "跨境贸易中的DDP和DDI条款有什么区别？",
      "question_type": "概念解释",
      "answer": "DDP（完税后交货）指卖方负责办理进口清关手续并支付进口税费，货物送达指定地点交付买方；DDI（未完税交货）指卖方将货物运至目的地，但买方负责进口清关和税费支付。DDP对卖方责任更大。",
      "keywords": ["DDP", "DDI", "贸易条款", "责任划分"],
      "category": "贸易术语",
      "tags": ["贸易术语", "责任划分"]
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
| `corpus_type` | string | 是 | 语料类型（固定值：qa） |
| `language` | string | 是 | 语言代码（zh/en/th/ms/vi） |
| `domain` | string | 是 | 业务域（trade/customs/payment/logistics等） |
| `created_by` | string | 是 | 创建者/团队 |
| `created_at` | string | 是 | 创建时间（ISO 8601格式） |
| `description` | string | 是 | 语料描述 |

### 问答记录字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `qa_id` | string | 是 | 问答唯一标识符（如：QA-001） |
| `question` | string | 是 | 问题内容 |
| `question_type` | string | 是 | 问题类型（见下方分类标准） |
| `answer` | string | 是 | 答案内容 |
| `keywords` | array | 是 | 关键词列表（至少1个） |
| `category` | string | 是 | 知识分类（见下方分类标准） |
| `tags` | array | 否 | 标签列表，便于分类和检索 |

---

## 分类标准

### question_type 字段的可选值

```
1. 概念解释：什么是XX、XX的定义
2. 流程操作：如何办理XX、XX的操作步骤
3. 规则政策：XX规定是什么、XX政策要求
4. 风险防范：如何避免XX、XX的风险控制
5. 对比分析：XX和YY的区别
6. 案例应用：XX在什么情况下使用
```

### category 字段的可选值

```
1. 贸易术语：FOB/CIF/DDP等术语解释、对比
2. 海关流程：报关、查验、清关等操作
3. 支付方式：L/C/TT/DP等支付方式
4. 物流运输：海运、空运、多式联运等
5. 单证要求：各类贸易单证的办理和使用
6. 税务关税：关税计算、税率查询等
7. 合同条款：贸易合同中的关键条款
8. 风险管理：贸易风险识别与防范
9. 合规要求：贸易合规、法规遵守
10. 其他：其他专业问题
```

---

## 示例数据

### 示例1：概念解释类 - 贸易术语对比

```json
{
  "qa_id": "QA-001",
  "question": "跨境贸易中的DDP和DDI条款有什么区别？",
  "question_type": "对比分析",
  "answer": "DDP（Delivered Duty Paid，完税后交货）指卖方负责办理进口清关手续并支付进口税费，货物送达指定地点交付买方；DDI（Delivered Duty Unpaid，未完税交货）指卖方将货物运至目的地，但买方负责进口清关和税费支付。主要区别在于：1）责任主体不同：DDP卖方承担全部责任，DDI买方承担清关责任；2）费用承担不同：DDP卖方支付进口税费，DDI买方支付；3）风险划分不同：DDP卖方风险最大，DDI买方风险较大。建议买方优先选择DDI以降低风险。",
  "keywords": ["DDP", "DDI", "贸易条款", "责任划分", "Incoterms"],
  "category": "贸易术语",
  "tags": ["贸易术语", "责任划分", "风险控制"]
}
```

### 示例2：流程操作类 - 报关流程

```json
{
  "qa_id": "QA-002",
  "question": "进口货物报关需要准备哪些单证？",
  "question_type": "流程操作",
  "answer": "进口货物报关通常需要准备以下单证：1）商业发票（Commercial Invoice）：详细列明货物名称、数量、价格、金额等；2）装箱单（Packing List）：详细列出货物包装情况、毛重、净重、体积等；3）提单或运单（Bill of Lading/Air Waybill）：证明货物运输的单据；4）合同（Contract）：买卖双方签订的贸易合同；5）原产地证书（Certificate of Origin）：如需享受关税优惠；6）进口许可证（Import License）：如货物属于许可证管理范围；7）保险单（Insurance Policy）：如由卖方投保；8）其他特殊单据：如检验证书、熏蒸证明等。建议在报关前确认所需单证清单，避免遗漏。",
  "keywords": ["报关", "单证", "进口", "清关", "文件准备"],
  "category": "海关流程",
  "tags": ["报关", "单证", "进口流程"]
}
```

### 示例3：概念解释类 - 信用证

```json
{
  "qa_id": "QA-003",
  "question": "什么是信用证支付方式？有什么特点？",
  "question_type": "概念解释",
  "answer": "信用证（Letter of Credit，简称L/C）是银行应进口商请求开立的一种书面付款承诺，承诺在出口商提交符合信用证条款的单据后，银行保证付款。特点包括：1）安全性高：银行信用替代商业信用，降低收汇风险；2）条款明确：所有要求都在信用证中明确列出；3）单据交易：银行只审核单据是否相符，不涉及货物本身；4）费用较高：开证费、通知费、改证费等；5）流程复杂：需要开证、通知、议付等多个环节。适用于首次合作、金额较大或买方信誉不确定的贸易。",
  "keywords": ["信用证", "L/C", "支付方式", "银行", "单据"],
  "category": "支付方式",
  "tags": ["支付", "信用证", "金融", "银行"]
}
```

### 示例4：风险防范类 - HS编码申报

```json
{
  "qa_id": "QA-004",
  "question": "如何避免HS编码申报错误？",
  "question_type": "风险防范",
  "answer": "避免HS编码申报错误的措施包括：1）准确了解货物属性：包括材质、用途、功能、成分等；2）查阅权威资料：参考《进出口税则》、海关归类决定、归类预裁定等；3）建立复核机制：重要货物需双人或多人复核确认；4）定期培训：组织归类人员参加海关培训，更新专业知识；5）咨询海关：遇到疑难问题可向海关申请归类预裁定；6）借助专业工具：使用海关归类辅助系统或第三方服务。申报错误可能导致补税、罚款、信用降级等后果，建议建立严格的质量控制流程。",
  "keywords": ["HS编码", "归类", "申报", "风险防范", "合规"],
  "category": "风险管理",
  "tags": ["HS编码", "归类", "风险管理", "合规"]
}
```

### 示例5：规则政策类 - 原产地证书

```json
{
  "qa_id": "QA-005",
  "question": "RCEP协定项下的原产地证书有什么特殊要求？",
  "question_type": "规则政策",
  "answer": "RCEP协定项下原产地证书的特殊要求包括：1）原产地规则：采用区域价值成分（RVC）40%或税则归类改变（CTC）标准；2）原产地累积：允许在RCEP区域内累积计算原产成分；3）证书格式：使用统一的RCEP原产地证书格式；4）有效期：证书有效期为3年（较之前的1年延长）；5）申请条件：出口商需在经核准出口商名单内，或自行声明；6）背对背原产地证明：允许在RCEP区域内进行背对背操作。建议出口商详细了解RCEP原产地规则，充分利用关税优惠。",
  "keywords": ["RCEP", "原产地证书", "关税优惠", "FTA", "贸易协定"],
  "category": "合规要求",
  "tags": ["RCEP", "原产地证书", "贸易协定", "关税优惠"]
}
```

### 示例6：案例应用类 - 支付方式选择

```json
{
  "qa_id": "QA-006",
  "question": "在不同情况下如何选择合适的支付方式？",
  "question_type": "案例应用",
  "answer": "支付方式选择应根据具体情况：1）首次合作/买方信誉不确定：优先选择信用证（L/C）或前T/T部分定金，保障卖方权益；2）长期合作/买方信誉良好：可接受赊销（O/A）、承兑交单（D/A）或后T/T，给予买方便利；3）小额订单：可选择PayPal、Western Union等快速支付；4）样品订单：通常要求全款预付或通过快递到付；5）大额订单：建议采用信用证分期付款，降低双方风险；6）进口业务：可采用付款交单（D/P）或前T/T，保护买方利益。建议在签订合同时明确支付条款，必要时加入第三方担保。",
  "keywords": ["支付方式", "选择", "风险控制", "L/C", "T/T"],
  "category": "支付方式",
  "tags": ["支付方式", "风险控制", "案例应用"]
}
```

---

## 批量导入示例

### 目录结构
```
/qa_import/
  ├── qa_zh.json    # 中文问答
  ├── qa_en.json    # 英文问答
  ├── qa_th.json    # 泰语问答
  ├── qa_ms.json    # 马来语问答
  └── qa_vi.json    # 越南语问答
```

### 批量导入的qa_zh.json（包含多条）

```json
{
  "meta": {
    "version": "1.0",
    "corpus_type": "qa",
    "language": "zh",
    "domain": "trade",
    "created_by": "专家团队",
    "created_at": "2024-01-15T10:00:00Z",
    "description": "跨境贸易专业问答库 - 中文"
  },
  "data": [
    {
      "qa_id": "QA-001",
      "question": "跨境贸易中的DDP和DDI条款有什么区别？",
      "question_type": "对比分析",
      "answer": "DDP（Delivered Duty Paid，完税后交货）指卖方负责办理进口清关手续并支付进口税费，货物送达指定地点交付买方；DDI（Delivered Duty Unpaid，未完税交货）指卖方将货物运至目的地，但买方负责进口清关和税费支付。主要区别在于：1）责任主体不同：DDP卖方承担全部责任，DDI买方承担清关责任；2）费用承担不同：DDP卖方支付进口税费，DDI买方支付；3）风险划分不同：DDP卖方风险最大，DDI买方风险较大。建议买方优先选择DDI以降低风险。",
      "keywords": ["DDP", "DDI", "贸易条款", "责任划分", "Incoterms"],
      "category": "贸易术语",
      "tags": ["贸易术语", "责任划分", "风险控制"]
    },
    {
      "qa_id": "QA-002",
      "question": "进口货物报关需要准备哪些单证？",
      "question_type": "流程操作",
      "answer": "进口货物报关通常需要准备以下单证：1）商业发票：详细列明货物名称、数量、价格、金额等；2）装箱单：详细列出货物包装情况、毛重、净重、体积等；3）提单或运单：证明货物运输的单据；4）合同：买卖双方签订的贸易合同；5）原产地证书：如需享受关税优惠；6）进口许可证：如货物属于许可证管理范围；7）保险单：如由卖方投保；8）其他特殊单据：如检验证书、熏蒸证明等。建议在报关前确认所需单证清单，避免遗漏。",
      "keywords": ["报关", "单证", "进口", "清关", "文件准备"],
      "category": "海关流程",
      "tags": ["报关", "单证", "进口流程"]
    },
    {
      "qa_id": "QA-003",
      "question": "什么是信用证支付方式？有什么特点？",
      "question_type": "概念解释",
      "answer": "信用证（Letter of Credit，简称L/C）是银行应进口商请求开立的一种书面付款承诺，承诺在出口商提交符合信用证条款的单据后，银行保证付款。特点包括：1）安全性高：银行信用替代商业信用，降低收汇风险；2）条款明确：所有要求都在信用证中明确列出；3）单据交易：银行只审核单据是否相符，不涉及货物本身；4）费用较高：开证费、通知费、改证费等；5）流程复杂：需要开证、通知、议付等多个环节。适用于首次合作、金额较大或买方信誉不确定的贸易。",
      "keywords": ["信用证", "L/C", "支付方式", "银行", "单据"],
      "category": "支付方式",
      "tags": ["支付", "信用证", "金融", "银行"]
    }
  ]
}
```

---

## 数据验证规则

### 通用验证规则
1. **JSON格式验证**：文件必须是有效的JSON格式
2. **字段类型验证**：所有字段类型必须符合定义
3. **必填字段验证**：必填字段不能为空或null
4. **唯一性验证**：qa_id必须在文件内唯一
5. **枚举值验证**：question_type、category、language等字段必须在定义的范围内
6. **格式验证**：日期、时间等格式必须正确（如created_at使用ISO 8601格式）

### 问答特定验证规则
1. **qa_id格式**：必须符合 QA-XXX 的格式（XXX为数字）
2. **question长度**：问题文本不能少于5个字符
3. **answer长度**：答案文本不能少于20个字符
4. **keywords数量**：必须至少包含1个关键词
5. **question_type枚举**：必须是预定义的问题类型
6. **category枚举**：必须是预定义的知识分类

---

## 与第一类别的关联

### 问答与术语的关联
- **关键词关联**：问答的`keywords`字段可以使用术语库中的`term`
- **定义引用**：答案中可以使用术语库中的`definition`
- **例句复用**：术语库中的`examples`可以作为问答的补充说明

### 示例关联
```
术语库 TERM-004: 信用证 (L/C)
  ├── definition: 银行应进口商请求开立的承诺付款文件...
  └── examples: ["使用信用证支付可以降低出口商的收汇风险..."]

问答库 QA-003: 什么是信用证支付方式？有什么特点？
  ├── question: 什么是信用证支付方式？有什么特点？
  ├── keywords: ["信用证", "L/C", "支付方式", ...]
  └── answer: 信用证是银行应进口商请求开立的...（引用术语定义）
```
术语库 TERM-004: 信用证 (L/C)
  ├── definition: 银行应进口商请求开立的承诺付款文件...
  └── examples: ["使用信用证支付可以降低出口商的收汇风险..."]

问答库 QA-003: 什么是信用证支付方式？
  ├── question: 什么是信用证支付方式？有什么特点？
  ├── keywords: ["信用证", "L/C", "支付方式", ...]
  └── answer: 信用证是银行应进口商请求开立的...（引用术语定义）
```

---

## 数量目标（参考规划）

### 中文语料（已生成）
| 类型 | 数量 | 说明 |
|------|------|------|
| 概念解释 | 60对 | 什么是XX、XX的定义、XX和YY的区别 |
| 流程操作 | 80对 | 如何办理XX、XX的操作步骤 |
| 规则政策 | 40对 | XX规定是什么、XX政策要求 |
| 风险防范 | 20对 | 如何避免XX、XX的风险控制 |
| **合计** | **200对** | - |

### 其他语言语料（基于中文翻译）
| 语言 | 数量 | 生成方式 |
|------|------|---------|
| 英语 | 200对 | AI翻译+校对 |
| 泰语 | 200对 | AI翻译+校对 |
| 马来语 | 200对 | AI翻译+校对 |
| 越南语 | 200对 | AI翻译+校对 |

**总计**：1,000对问答

---

## 多语生成策略

### 源语言策略
- **源语言**：中文
- **语料来源**：已生成的200对中文问答（概念解释60 + 流程操作80 + 规则政策40 + 风险防范20）
- **数据质量**：专家编写，高质量

### 翻译策略
#### 1. 翻译方式
- **英语**：AI翻译 + 人工校对（建议抽检20%）
- **泰语**：AI翻译 + 人工校对（建议抽检30%）
- **马来语**：AI翻译 + 人工校对（建议抽检30%）
- **越南语**：AI翻译 + 人工校对（建议抽检30%）

#### 2. QA-ID保持一致
- 所有语言的问答保持相同的`qa_id`（如QA-001、QA-002等）
- 便于跨语言对齐和关联查询
- 便于用户在不同语言间切换查看同一问题

#### 3. 翻译Prompt模板
```
作为跨境贸易专家，请将以下中文专业问答翻译为[目标语言]。

要求：
1. 准确翻译专业术语（参考术语库）
2. 保持问题类型和知识分类一致
3. 注意各国法规和政策差异，必要时调整答案内容
4. 表达地道、专业、自然

中文问答：
{
  "qa_id": "QA-XXX",
  "question": "[问题内容]",
  "question_type": "[问题类型]",
  "answer": "[答案内容]",
  "keywords": ["关键词1", "关键词2", ...],
  "category": "[知识分类]",
  "tags": ["标签1", "标签2", ...]
}

请返回目标语言的JSON格式。
```

### 翻译质量控制

#### 1. 专业术语翻译一致性
- 使用第一类别"术语与标准表达类"的术语库
- 关键术语（如DDP、DDI、L/C、HS编码等）保持一致性
- 缩写术语保留英文缩写（如DDP、L/C等）

#### 2. 问题类型和知识分类
- `question_type`保持与中文一致
- `category`保持与中文一致
- 便于跨语言查询和分类

#### 3. 注意各国法规和政策差异
- 答案中涉及具体法规时，需根据目标国家调整
- 例如：中国海关规定 → 泰国海关规定
- 如无对应法规，可改为国际通用规则

#### 4. 人工抽检标准
- **英语**：抽检20%，重点关注术语准确性和表达地道性
- **泰语/马来语/越南语**：抽检30%，重点关注语法、词汇准确性
- 抽检记录：记录抽检结果，用于后续AI模型优化

### 翻译后处理

#### 1. 在translations字段中保留原始中文
```json
{
  "qa_id": "QA-001",
  "question": "What is the difference between DDP and DDI terms?",
  "question_type": "对比分析",
  "answer": "DDP (Delivered Duty Paid) means...",
  "keywords": ["DDP", "DDI", ...],
  "category": "贸易术语",
  "translations": {
    "zh": {
      "question": "跨境贸易中的DDP和DDI条款有什么区别？",
      "answer": "DDP（完税后交货）指..."
    }
  },
  "translation_source": "AI翻译",
  "translation_quality": "high",
  "verified": false
}
```

#### 2. 标注翻译方式和来源
- `translation_source`: 标注翻译来源（AI翻译、人工翻译等）
- `translation_quality`: 标注翻译质量（high/medium/low）
- `verified`: 是否已人工验证

#### 3. 建立跨语言关联索引
```
跨语言关联索引表：
{
  "QA-001": {
    "zh": {"qa_id": "QA-001", "language": "zh", "file": "qa_zh.json"},
    "en": {"qa_id": "QA-001", "language": "en", "file": "qa_en.json"},
    "th": {"qa_id": "QA-001", "language": "th", "file": "qa_th.json"},
    "ms": {"qa_id": "QA-001", "language": "ms", "file": "qa_ms.json"},
    "vi": {"qa_id": "QA-001", "language": "vi", "file": "qa_vi.json"}
  },
  ...
}
```

### 翻译示例

#### 示例：QA-001 中文 → 英文翻译

**中文原文**：
```json
{
  "qa_id": "QA-001",
  "question": "跨境贸易中的DDP和DDI条款有什么区别？",
  "question_type": "对比分析",
  "answer": "DDP（Delivered Duty Paid，完税后交货）指卖方负责办理进口清关手续并支付进口税费，货物送达指定地点交付买方；DDI（Delivered Duty Unpaid，未完税交货）指卖方将货物运至目的地，但买方负责进口清关和税费支付。主要区别在于：1）责任主体不同：DDP卖方承担全部责任，DDI买方承担清关责任；2）费用承担不同：DDP卖方支付进口税费，DDI买方支付；3）风险划分不同：DDP卖方风险最大，DDI买方风险较大。建议买方优先选择DDI以降低风险。",
  "keywords": ["DDP", "DDI", "贸易条款", "责任划分", "Incoterms"],
  "category": "贸易术语",
  "tags": ["贸易术语", "责任划分", "风险控制"]
}
```

**英文翻译（AI生成）**：
```json
{
  "qa_id": "QA-001",
  "question": "What is the difference between DDP and DDI terms in cross-border trade?",
  "question_type": "对比分析",
  "answer": "DDP (Delivered Duty Paid) means seller is responsible for import clearance and pays import duties, delivering goods to specified location for the buyer. DDI (Delivered Duty Unpaid) means the seller transports goods to the destination, but the buyer handles import clearance and pays duties. The main differences are: 1) Responsibility: DDP seller assumes full responsibility, DDI buyer assumes clearance responsibility; 2) Cost: DDP seller pays import duties, DDI buyer pays; 3) Risk: DDP seller has highest risk, DDI buyer has higher risk. It is recommended that buyers prioritize DDI to reduce risk.",
  "keywords": ["DDP", "DDI", "trade terms", "responsibility allocation", "Incoterms"],
  "category": "贸易术语",
  "tags": ["trade terms", "responsibility allocation", "risk control"]
}
```

**英文翻译（AI生成）**：
```json
{
  "qa_id": "QA-001",
  "question": "What is the difference between DDP and DDI terms in cross-border trade?",
  "question_type": "对比分析",
  "answer": "DDP (Delivered Duty Paid) means seller is responsible for import clearance and pays import duties, delivering goods to specified location for the buyer. DDI (Delivered Duty Unpaid) means the seller transports goods to the destination, but the buyer handles import clearance and pays duties. The main differences are: 1) Responsibility: DDP seller assumes full responsibility, DDI buyer assumes clearance responsibility; 2) Cost: DDP seller pays import duties, DDI buyer pays; 3) Risk: DDP seller has highest risk, DDI buyer has higher risk. It is recommended that buyers prioritize DDI to reduce risk.",
  "keywords": ["DDP", "DDI", "trade terms", "responsibility allocation", "Incoterms"],
  "category": "贸易术语",
  "tags": ["trade terms", "responsibility allocation", "risk control"],
  "translations": {
    "zh": {
      "question": "跨境贸易中的DDP和DDI条款有什么区别？",
      "answer": "DDP（完税后交货）指卖方负责办理进口清关手续并支付进口税费..."
    }
  },
  "translation_source": "AI翻译",
  "translation_quality": "high",
  "verified": false
}
```

---

## 注意事项

1. **qa_id命名**：必须保持跨语言一致，便于对齐
2. **keywords翻译**：专业术语应参考术语库，保持一致性
3. **question_type和category**：保持与中文一致
4. **tags分类**：建议使用预定义的标签分类，便于检索
5. **抽检比例**：英语20%，其他语言30%，确保翻译质量
6. **法规差异**：注意各国法规差异，必要时调整答案内容
7. **术语一致性**：与第一类别术语库保持一致
