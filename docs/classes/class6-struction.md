# 第六类别：指令/场景生成类

## 类别说明

**定义**：让AI在跨境贸易场景下怎么干活的语料

**目标**：训练AI在跨境贸易场景下的指令执行能力，支持多语客服回复生成、商务文书生成、市场内容本地化等应用

**典型用途**：
- 多语客服回复生成
- 商务文书生成
- 市场内容本地化

---

## JSON格式定义

### 文件命名规范
```
struction_{语言代码}.json

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
    "corpus_type": "struction",
    "language": "zh",
    "domain": "trade",
    "created_by": "专家团队",
    "created_at": "2024-01-15T10:00:00Z",
    "description": "指令/场景生成库 - 中文"
  },
  "data": [
    {
      "instruction_id": "INST-001",
      "instruction_type": "instruction",
      "task": "用越南语向客户解释跨境物流时效",
      "output": "Thời gian vận chuyển đơn hàng xuyên biên giới thường mất 7-12 ngày làm việc, tùy thuộc vào phương thức vận chuyển và địa điểm đích. Chúng tôi sẽ thông báo cho bạn ngay khi hàng xuất phát.",
      "tags": ["客服", "物流", "越南语"]
    },
    {
      "instruction_id": "INST-101",
      "instruction_type": "scenario",
      "task": "客户投诉物流延误15天，要求退货或赔偿。需要生成处理方案和客服回复。",
      "output": "处理方案：\n1）核实物流情况，确认延误原因\n2）检查货物状态，确认是否已发货\n3）与物流公司沟通，确认到达时间\n4）根据情况提供补偿或退款\n\n客服回复：\n尊敬的客户，我们非常抱歉给您带来的不便。经核实，您的订单因不可抗力原因延误15天。我们已与物流公司确认，货物预计2天内到达。作为补偿，我们为您提供20%的优惠券。如需退货，我们可以为您办理。请告知您的决定。",
      "tags": ["投诉处理", "物流延误", "客服"]
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
| `corpus_type` | string | 是 | 语料类型（固定值：struction） |
| `language` | string | 是 | 语言代码（zh/en/th/ms/vi） |
| `domain` | string | 是 | 业务域（trade/customs/payment/logistics等） |
| `created_by` | string | 是 | 创建者/团队 |
| `created_at` | string | 是 | 创建时间（ISO 8601格式） |
| `description` | string | 是 | 语料描述 |

### 指令记录字段（极简版，5个字段）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `instruction_id` | string | 是 | 指令唯一标识符（如：INST-001） |
| `instruction_type` | string | 是 | 指令类型（instruction 或 scenario） |
| `task` | string | 是 | 任务描述（让AI做什么） |
| `output` | string | 是 | 预期输出（AI应该生成什么） |
| `tags` | array | 否 | 标签列表，便于分类和检索 |

---

## instruction_type 说明

### instruction_type 的两种值

#### 1. instruction（指令类）
- **定义**：直接让AI生成某种内容
- **特点**：task描述"用XX语言生成XX"，output是生成的内容
- **典型用途**：
  - 客服回复生成
  - 商务文书生成
  - 市场内容本地化
  - 文档分析类
  - 风险评估类

#### 2. scenario（场景类）
- **定义**：描述一个业务场景，让AI处理并生成响应
- **特点**：task描述"XX场景，需要生成XX"，output包含多个部分
- **典型用途**：
  - 投诉处理
  - 协商沟通
  - 风险应对
  - 合规处理
  - 问题解决

---

## output 字段格式规范

### instruction_type = "instruction" 时的 output 格式

**特点**：纯文本，直接生成的内容

**示例**：
```json
"output": "Thời gian vận chuyển đơn hàng xuyên biên giới thường mất 7-12 ngày làm việc, tùy thuộc vào phương thức vận chuyển và địa điểm đích. Chúng tôi sẽ thông báo cho bạn ngay khi hàng xuất phát."
```

### instruction_type = "scenario" 时的 output 格式

**特点**：可能包含多个部分，使用换行符分隔

**格式规范**：
```
部分1标题：
部分1内容
部分2内容

部分3标题：
部分3内容
```

**示例**：
```json
"output": "处理方案：\n1）核实物流情况，确认延误原因\n2）检查货物状态，确认是否已发货\n3）与物流公司沟通，确认到达时间\n4）根据情况提供补偿或退款\n\n客服回复：\n尊敬的客户，我们非常抱歉给您带来的不便。经核实，您的订单因不可抗力原因延误15天。我们已与物流公司确认，货物预计2天内到达。作为补偿，我们为您提供20%的优惠券。如需退货，我们可以为您办理。请告知您的决定。"
```

**说明**：
- 使用"部分标题："开始每个部分
- 使用"\n\n"分隔不同部分
- 部分内容用换行符" \n"分行

---

## 示例数据

### 示例1：instruction - 客服回复生成

```json
{
  "instruction_id": "INST-001",
  "instruction_type": "instruction",
  "task": "用越南语向客户解释跨境物流时效",
  "output": "Thời gian vận chuyển đơn hàng xuyên biên giới thường mất 7-12 ngày làm việc, tùy thuộc vào phương thức vận chuyển và địa điểm đích. Chúng tôi sẽ thông báo cho bạn ngay khi hàng xuất phát.",
  "tags": ["客服", "物流", "越南语"]
}
```

### 示例2：instruction - 商务文书生成

```json
{
  "instruction_id": "INST-002",
  "instruction_type": "instruction",
  "task": "用泰语生成商业发票",
  "output": "ใบแจ้งราคาสินค้าเชิงพาณิชย์\n\nผู้ขาย:\nบริษัท: ABC Trading Co., Ltd.\nที่อยู่: 123 Main Street, Bangkok, Thailand\nโทรศัพท์: +66-2-123-4567\n\nผู้ซื้อ:\nบริษัท: XYZ Import Co., Ltd.\nที่อยู่: 456 North Avenue, Ho Chi Minh City, Vietnam\nโทรศัพท์: +84-8-765-4321\n\nรายละเอียดสินค้า...",
  "tags": ["商务文书", "发票", "泰语"]
}
```

### 示例3：instruction - 市场内容本地化

```json
{
  "instruction_id": "INST-003",
  "instruction_type": "instruction",
  "task": "用马来语翻译产品描述",
  "output": "Produk ini dibuat menggunakan bahan berkualiti tinggi dan telah lulus ujian ketahanan yang ketat. Sesuai untuk penggunaan jangka panjang dan memenuhi piawaian kualiti antarabangsa. Produk ini telah disahkan oleh SIRIM dan mempunyai sijil kelulusan.",
  "tags": ["市场内容", "产品描述", "马来语"]
}
```

### 示例4：instruction - 客服回复生成 - 订单确认

```json
{
  "instruction_id": "INST-004",
  "instruction_type": "instruction",
  "task": "用英语生成订单确认邮件",
  "output": "Dear Customer,\n\nThank you for your order #12345. We are pleased to confirm that your order has been received and is being processed.\n\nOrder Details:\n- Order Number: 12345\n- Order Date: 2024-01-15\n- Items: Electronic Tablet x10\n- Total Amount: USD 5,000\n\nEstimated Delivery: 7-10 business days\n\nWe will notify you once your order has been shipped. If you have any questions, please feel free to contact our customer service.\n\nBest regards,\nABC Trading Team",
  "tags": ["客服", "订单确认", "英语"]
}
```

### 示例5：scenario - 投诉处理

```json
{
  "instruction_id": "INST-101",
  "instruction_type": "scenario",
  "task": "客户投诉物流延误15天，要求退货或赔偿。需要生成处理方案和客服回复。",
  "output": "处理方案：\n1）核实物流情况，确认延误原因\n2）检查货物状态，确认是否已发货\n3）与物流公司沟通，确认到达时间\n4）根据情况提供补偿或退款\n\n客服回复：\n尊敬的客户，我们非常抱歉给您带来的不便。经核实，您的订单因不可抗力原因延误15天。我们已与物流公司确认，货物预计2天内到达。作为补偿，我们为您提供20%的优惠券。如需退货，我们可以为您办理。请告知您的决定。",
  "tags": ["投诉处理", "物流延误", "客服"]
}
```

### 示例6：scenario - 协商沟通

```json
{
  "instruction_id": "INST-102",
  "instruction_type": "scenario",
  "task": "买方要求修改付款方式，从信用证改为T/T。需要评估风险并生成协商回复。",
  "output": "风险评估：\n1）买方信用评级良好，历史付款记录优秀\n2）订单金额在可接受范围内\n3）T/T付款方式对卖方风险可控\n\n协商回复：\n尊敬的买方，\n\n我们已收到您关于修改付款方式的请求。经过内部评估，我们同意将付款方式从信用证（L/C）改为T/T（电汇）。\n\n新的付款条款如下：\n- 首付款：30%（订单确认后3个工作日内）\n- 尾款：70%（发货前3个工作日内）\n\n请您在收到本邮件后确认接受新的付款条款。\n\n如有任何疑问，请随时与我们联系。\n\n此致，\n卖方",
  "tags": ["协商", "付款方式", "风险控制"]
}
```

### 示例7：scenario - 风险应对

```json
{
  "instruction_id": "INST-103",
  "instruction_type": "scenario",
  "task": "海关查验发现货物归类问题，需要生成应对方案。",
  "output": "应对方案：\n1）立即联系海关，了解具体归类问题\n2）准备商品详细说明和技术资料\n3）查阅相关归类决定和先例\n4）如归类错误，申请更正\n5）如归类正确但存在争议，申请海关预裁定\n\n后续措施：\n1）建立归类复核机制，重要货物双人确认\n2）定期参加海关归类培训，更新专业知识\n3）与海关保持良好沟通，及时了解政策变化",
  "tags": ["风险应对", "归类问题", "海关"]
}
```

### 示例8：scenario - 合规处理

```json
{
  "instruction_id": "INST-104",
  "instruction_type": "scenario",
  "task": "发现某订单可能涉及出口管制商品，需要生成合规审查方案。",
  "output": "合规审查方案：\n1）立即核实商品是否在出口管制清单上\n2）确认目的地国家是否为敏感国家\n3）检查最终用户信息，评估合规风险\n4）如需许可证，及时申请\n5）如存在合规风险，暂停订单并通知管理层\n\n风险评估：\n- 风险等级：中\n- 主要风险：出口管制合规性\n- 建议措施：申请出口许可证，进行最终用户审查\n\n后续行动：\n1）完善合规审查流程\n2）建立出口管制商品清单库\n3）定期进行合规培训",
  "tags": ["合规处理", "出口管制", "风险控制"]
}
```

---

## 数量目标

### 语言数量分布

| 语言 | 数量目标 | 生成方式 | 人工校对比例 |
|------|---------|---------|------------|
| 中文 | 100条 | 专家编写 | - |
| 英语 | 100条 | AI翻译 | 20% |
| 泰语 | 80条 | AI翻译 | 30% |
| 马来语 | 80条 | AI翻译 | 30% |
| 越南语 | 80条 | AI翻译 | 30% |
| **合计** | **440条** | - | - |

### instruction_type 分布建议

| 类型 | 中文 | 英语 | 泰语 | 马来语 | 越南语 | 合计 |
|------|------|------|------|--------|--------|------|
| instruction | 50 | 50 | 40 | 40 | 40 | 220 |
| scenario | 50 | 50 | 40 | 40 | 40 | 220 |
| **合计** | **100** | **100** | **80** | **80** | **80** | **440** |

### 具体类型分布

#### instruction 类型分布（220条）
| 子类型 | 中文 | 英语 | 泰语 | 马来语 | 越南语 | 合计 |
|--------|------|------|------|--------|--------|------|
| 客服回复生成 | 20 | 20 | 15 | 15 | 15 | 85 |
| 商务文书生成 | 15 | 15 | 10 | 10 | 10 | 60 |
| 市场内容本地化 | 15 | 15 | 15 | 15 | 15 | 75 |

#### scenario 类型分布（220条）
| 子类型 | 中文 | 英语 | 泰语 | 马来语 | 越南语 | 合计 |
|--------|------|------|------|--------|--------|------|
| 投诉处理 | 10 | 10 | 10 | 10 | 10 | 50 |
| 协商沟通 | 10 | 10 | 10 | 10 | 10 | 50 |
| 风险应对 | 10 | 10 | 10 | 10 | 10 | 50 |
| 合规处理 | 10 | 10 | 10 | 10 | 10 | 50 |
| 问题解决 | 10 | 10 | 0 | 0 | 0 | 20 |

---

## 批量导入示例

### 目录结构
```
/struction_import/
  ├── struction_zh.json    # 中文指令（100条）
  ├── struction_en.json    # 英文指令（100条）
  ├── struction_th.json    # 泰语指令（80条）
  ├── struction_ms.json    # 马来语指令（80条）
  └── struction_vi.json    # 越南语指令（80条）
```

### 批量导入的struction_zh.json（包含多条）

```json
{
  "meta": {
    "version": "1.0",
    "corpus_type": "struction",
    "language": "zh",
    "domain": "trade",
    "created_by": "专家团队",
    "created_at": "2024-01-15T10:00:00Z",
    "description": "指令/场景生成库 - 中文"
  },
  "data": [
    {
      "instruction_id": "INST-001",
      "instruction_type": "instruction",
      "task": "用越南语向客户解释跨境物流时效",
      "output": "Thời gian vận chuyển đơn hàng xuyên biên giới thường mất 7-12 ngày làm việc, tùy thuộc vào phương thức vận chuyển và địa điểm đích. Chúng tôi sẽ thông báo cho bạn ngay khi hàng xuất phát.",
      "tags": ["客服", "物流", "越南语"]
    },
    {
      "instruction_id": "INST-002",
      "instruction_type": "instruction",
      "task": "用泰语生成商业发票",
      "output": "ใบแจ้งราคาสินค้าเชิงพาณิชย์\n\nผู้ขาย:\nบริษัท: ABC Trading Co., Ltd.\nที่อยู่: 123 Main Street, Bangkok, Thailand\nโทรศัพท์: +66-2-123-4567\n\nผู้ซื้อ:\nบริษัท: XYZ Import Co., Ltd.\nที่อยู่: 456 North Avenue, Ho Chi Minh City, Vietnam\nโทรศัพท์: +84-8-765-4321\n\nรายละเอียดสินค้า...",
      "tags": ["商务文书", "发票", "泰语"]
    },
    {
      "instruction_id": "INST-003",
      "instruction_type": "instruction",
      "task": "用马来语翻译产品描述",
      "output": "Produk ini dibuat menggunakan bahan berkualiti tinggi dan telah lulus ujian ketahanan yang ketat. Sesuai untuk penggunaan jangka panjang dan memenuhi piawaian kualiti antarabangsa. Produk ini telah disahkan oleh SIRIM dan mempunyai sijil kelulusan.",
      "tags": ["市场内容", "产品描述", "马来语"]
    },
    {
      "instruction_id": "INST-004",
      "instruction_type": "instruction",
      "task": "用英语生成订单确认邮件",
      "output": "Dear Customer,\n\nThank you for your order #12345. We are pleased to confirm that your order has been received and is being processed.\n\nOrder Details:\n- Order Number: 12345\n- Order Date: 2024-01-15\n- Items: Electronic Tablet x10\n- Total Amount: USD 5,000\n\nEstimated Delivery: 7-10 business days\n\nWe will notify you once your order has been shipped. If you have any questions, please feel free to contact our customer service.\n\nBest regards,\nABC Trading Team",
      "tags": ["客服", "订单确认", "英语"]
    },
    {
      "instruction_id": "INST-101",
      "instruction_type": "scenario",
      "task": "客户投诉物流延误15天，要求退货或赔偿。需要生成处理方案和客服回复。",
      "output": "处理方案：\n1）核实物流情况，确认延误原因\n2）检查货物状态，确认是否已发货\n3）与物流公司沟通，确认到达时间\n4）根据情况提供补偿或退款\n\n客服回复：\n尊敬的客户，我们非常抱歉给您带来的不便。经核实，您的订单因不可抗力原因延误15天。我们已与物流公司确认，货物预计2天内到达。作为补偿，我们为您提供20%的优惠券。如需退货，我们可以为您办理。请告知您的决定。",
      "tags": ["投诉处理", "物流延误", "客服"]
    },
    {
      "instruction_id": "INST-102",
      "instruction_type": "scenario",
      "task": "买方要求修改付款方式，从信用证改为T/T。需要评估风险并生成协商回复。",
      "output": "风险评估：\n1）买方信用评级良好，历史付款记录优秀\n2）订单金额在可接受范围内\n3）T/T付款方式对卖方风险可控\n\n协商回复：\n尊敬的买方，\n\n我们已收到您关于修改付款方式的请求。经过内部评估，我们同意将付款方式从信用证（L/C）改为T/T（电汇）。\n\n新的付款条款如下：\n- 首付款：30%（订单确认后3个工作日内）\n- 尾款：70%（发货前3个工作日内）\n\n请您在收到本邮件后确认接受新的付款条款。\n\n如有任何疑问，请随时与我们联系。\n\n此致，\n卖方",
      "tags": ["协商", "付款方式", "风险控制"]
    }
  ]
}
```

---

## 多语生成策略

### 源语言策略
- **源语言**：中文
- **语料来源**：专家编写的100条指令
- **质量保证**：由业务专家审核，确保指令准确性和实用性

### 翻译策略

#### 1. 翻译方式
- **英语**：AI翻译 + 人工校对（建议抽检20%）
- **泰语**：AI翻译 + 人工校对（建议抽检30%）
- **马来语**：AI翻译 + 人工校对（建议抽检30%）
- **越南语**：AI翻译 + 人工校对（建议抽检30%）

#### 2. instruction_id保持一致
- 所有语言的指令保持相同的`instruction_id`（如INST-001、INST-002等）
- 便于跨语言查询同一指令
- 便于多语言AI助手使用

#### 3. 翻译Prompt模板

```
作为跨境贸易专家，请将以下中文指令翻译为[目标语言]。

要求：
1. 准确翻译专业术语（参考术语库）
2. 保持指令类型一致（instruction 或 scenario）
3. 对于scenario类型，保持output的分隔符格式（\n\n）
4. 表达地道、专业、自然
5. 确保task和output的准确性

中文指令：
{
  "instruction_id": "INST-XXX",
  "instruction_type": "[instruction 或 scenario]",
  "task": "[任务描述]",
  "output": "[输出内容]",
  "tags": ["标签1", "标签2"]
}

请返回目标语言的JSON格式。
```

### 翻译质量控制

#### 1. 专业术语翻译一致性
- 使用第一类别"术语与标准表达类"的术语库
- 关键术语（如物流、发票、客服等）保持一致性
- 缩写术语保留英文（如L/C、T/T等）

#### 2. 指令类型保持一致
- `instruction_type`字段必须准确翻译
- instruction类型：instruction（直接生成）
- scenario类型：scenario（场景处理）

#### 3. output格式保持一致
- **instruction类型**：output是纯文本
- **scenario类型**：output使用换行符分隔不同部分
- 保持分隔符的一致性（"\n\n"）

#### 4. 人工抽检标准
- **英语**：抽检20%，重点关注术语准确性和表达地道性
- **泰语/马来语/越南语**：抽检30%，重点关注语法、词汇准确性、换行符格式
- 抽检记录：记录抽检结果，用于后续AI模型优化

---

## 与其他类别的关联

### 与第一类别（术语类）的关联
- **术语一致性**：指令中的术语与术语库保持一致
- **翻译参考**：使用术语库的translations作为翻译参考

### 与第二类别（问答类）的关联
- **问答指令化**：可以将问答扩展为指令形式
- **场景复用**：问答中的场景可以提取为scenario类型指令

### 与第五类别（案例类）的关联
- **案例场景化**：可以将案例中的情况提取为scenario类型指令
- **经验指令化**：可以将案例中的经验总结为instruction类型指令

### 跨类别复用示例

#### 从问答类提取指令
```
问答库 QA-002（中文）:
  ├── question: "进口货物报关需要准备哪些单证？"
  └── answer: "进口货物报关通常需要准备以下单证：1）商业发票；2）装箱单；3）提单或运单；4）合同；5）原产地证书..."

指令库 INST-005（instruction类型）:
  ├── instruction_type: "instruction"
  ├── task: "用英语生成报关单证清单说明"
  └── output: "Import customs clearance typically requires the following documents: 1) Commercial Invoice; 2) Packing List; 3) Bill of Lading or Air Waybill; 4) Contract; 5) Certificate of Origin..."
```

#### 从案例类提取指令
```
案例库 CASE-004（中文）:
  ├── background: "某企业向东南亚发货，因台风导致物流延误15天"
  ├── situation: "客户要求取消订单并退款，企业面临货款两失风险"
  └── conclusion: "物流延误是跨境贸易常见风险，积极沟通和灵活处理可以转化为机会"

指令库 INST-106（scenario类型）:
  ├── instruction_type: "scenario"
  ├── task: "客户投诉物流延误15天，要求取消订单并退款。需要生成处理方案和客服回复。",
  └── output: "处理方案：\n1）核实物流情况...;\n\n客服回复：\n尊敬的客户，我们非常抱歉..."
```

---

## 数据验证规则

### 通用验证规则
1. **JSON格式验证**：文件必须是有效的JSON格式
2. **字段类型验证**：所有字段类型必须符合定义
3. **必填字段验证**：必填字段不能为空或null
4. **唯一性验证**：instruction_id必须在文件内唯一
5. **枚举值验证**：instruction_type、language等字段必须在定义的范围内
6. **格式验证**：日期、时间等格式必须正确（如created_at使用ISO 8601格式）

### 指令特定验证规则
1. **instruction_id格式**：必须符合 INST-XXX 的格式（XXX为数字）
2. **instruction_type枚举**：必须是 "instruction" 或 "scenario"（严格区分大小写）
3. **task长度**：任务描述不能少于10个字符
4. **output长度**：输出内容不能少于20个字符
5. **output格式一致性**：instruction类型为纯文本，scenario类型包含分隔符

---

## 注意事项

1. **instruction_id命名**：必须保持跨语言一致，便于多语言AI助手使用
2. **instruction_type严格区分**：必须准确填写 "instruction" 或 "scenario"（大小写敏感）
3. **output格式规范**：instruction类型用纯文本，scenario类型用换行符分隔不同部分
4. **术语一致性**：指令中的术语与术语库保持一致
5. **分隔符规范**：scenario类型的output中，不同部分用"\n\n"分隔
6. **tags分类**：建议使用预定义的标签分类，便于检索
7. **人工校对**：英语20%，其他语言30%，确保翻译质量
8. **跨类别复用**：可从问答类、案例类提取指令，提高效率
9. **文件命名**：严格按照 struction_{语言代码}.json 格式命名
10. **应用场景**：指令设计要考虑实际应用场景（客服、商务、合规等）

---

## 优势总结

### 1. 结构极度简洁
- 仅5个字段（4个必填 + 1个可选）
- instruction_type只有2种值
- output字段统一为string类型

### 2. 统一性高
- 指令类和场景类使用相同的JSON结构
- 通过instruction_type区分，易于管理
- 数据库表设计简单，导入导出逻辑统一

### 3. 易于使用
- 结构清晰，task和output一目了然
- AI可以直接理解和执行
- 应用层解析逻辑简单

### 4. 扩展性强
- 未来增加新的指令类型不需要改结构
- 支持多种应用场景（客服、商务、合规等）
- 可与其他类别关联复用

### 5. AI能力放大
- instruction类型：直接生成内容，提高AI内容生成能力
- scenario类型：场景处理，提高AI问题解决能力
- 支持多语言，扩大AI应用范围
