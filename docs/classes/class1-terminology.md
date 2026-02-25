# 第一类别：术语与标准表达类

## 类别说明

**定义**：行业术语在不同语言下的标准对照与解释

**目标**：建立跨境贸易基础术语库，提供准确的术语定义、翻译和使用示例

---

## JSON格式定义

### 文件命名规范
```
term_{语言代码}.json

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
    "corpus_type": "terminology",
    "language": "zh",
    "domain": "trade",
    "created_by": "专家团队",
    "created_at": "2024-01-15T10:00:00Z",
    "description": "跨境贸易术语库 - 中文"
  },
  "data": [
    {
      "term_id": "TERM-001",
      "term": "原产地证书",
      "abbreviation": "CO",
      "category": "贸易单证",
      "definition": "证明货物原产地的官方文件，用于确定关税优惠和贸易限制",
      "examples": [
        "出口货物需要提供原产地证书才能享受关税优惠",
        "RCEP协定项下原产地证书的有效期延长至3年"
      ],
      "related_terms": ["产地证", "原产地证明", "Certificate of Origin"],
      "translations": {
        "en": "Certificate of Origin",
        "th": "ใบรับรองถิ่นกำเนิด",
        "ms": "Sijil Asal",
        "vi": "Giấy chứng nhận xuất xứ"
      },
      "tags": ["单证", "清关", "关税"]
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
| `corpus_type` | string | 是 | 语料类型（固定值：terminology） |
| `language` | string | 是 | 语言代码（zh/en/th/ms/vi） |
| `domain` | string | 是 | 业务域（trade/customs/payment/logistics等） |
| `created_by` | string | 是 | 创建者/团队 |
| `created_at` | string | 是 | 创建时间（ISO 8601格式） |
| `description` | string | 是 | 语料描述 |

### 术语记录字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `term_id` | string | 是 | 术语唯一标识符（如：TERM-001） |
| `term` | string | 是 | 术语名称 |
| `abbreviation` | string | 否 | 术语缩写（如：CO、B/L等） |
| `category` | string | 是 | 术语分类（见下方分类标准） |
| `definition` | string | 是 | 术语定义 |
| `examples` | array | 否 | 例句列表，展示术语在上下文中的使用 |
| `related_terms` | array | 否 | 相关术语列表（同义词、近义词等） |
| `translations` | object | 否 | 多语言翻译映射 |
| `tags` | array | 否 | 标签列表，便于分类和检索 |

---

## 分类标准

### category 字段的可选值

```
1. 贸易单证：CO（原产地证书）、B/L（提单）、CI（商业发票）、PL（装箱单）、PI（形式发票）等
2. 贸易术语：FOB、CIF、DDP、EXW、Incoterms 2020等
3. 海关术语：HS编码、报关、查验、清关、信用管理等
4. 支付方式：L/C（信用证）、TT（电汇）、DP（付款交单）、DA（承兑交单）等
5. 物流术语：海运、空运、多式联运、集装箱、整箱/拼箱等
6. 保险术语：保单、保险费率、免赔额、险别等
7. 贸易协定：RCEP、FTA、WTO、TPP等
8. 其他：法规、机构、商品类别、汇率等
```

### tags 字段建议值

```
核心标签：
- 单证
- 清关
- 关税
- 海关
- 支付
- 物流
- 保险
- 合规
- 风险管理
- 金融

场景标签：
- 进口
- 出口
- 转口
- B2B
- B2C
- 跨境电商
```

---

## 示例数据

### 示例1：贸易单证类 - 原产地证书

```json
{
  "term_id": "TERM-001",
  "term": "原产地证书",
  "abbreviation": "CO",
  "category": "贸易单证",
  "definition": "证明货物原产地的官方文件，用于确定关税优惠和贸易限制",
  "examples": [
    "出口货物需要提供原产地证书才能享受关税优惠",
    "RCEP协定项下原产地证书的有效期延长至3年"
  ],
  "related_terms": ["产地证", "原产地证明", "Certificate of Origin"],
  "translations": {
    "en": "Certificate of Origin",
    "th": "ใบรับรองถิ่นกำเนิด",
    "ms": "Sijil Asal",
    "vi": "Giấy chứng nhận xuất xứ"
  },
  "tags": ["单证", "清关", "关税"]
}
```

### 示例2：贸易单证类 - 提单

```json
{
  "term_id": "TERM-002",
  "term": "提单",
  "abbreviation": "B/L",
  "category": "贸易单证",
  "definition": "承运人签发的货物收据，也是物权凭证，用于货物运输和提货",
  "examples": [
    "货物装船后，船公司签发了正本提单",
    "电放提单可以加快货物清关速度"
  ],
  "related_terms": ["Bill of Lading", "海运提单", "正本提单"],
  "translations": {
    "en": "Bill of Lading",
    "th": "ใบอนุญาตขนส่ง",
    "ms": "Bil Pemuatan",
    "vi": "Vận đơn"
  },
  "tags": ["单证", "物流", "海运"]
}
```

### 示例3：海关术语类 - HS编码

```json
{
  "term_id": "TERM-003",
  "term": "海关编码",
  "abbreviation": "HS Code",
  "category": "海关术语",
  "definition": "商品名称及编码协调制度的简称，用于国际贸易商品的统一分类",
  "examples": [
    "查询该商品的HS编码可以确定适用的关税税率",
    "HS编码847130归类为便携式自动数据处理设备"
  ],
  "related_terms": ["HS Code", "商品编码", "税则号列"],
  "translations": {
    "en": "HS Code",
    "th": "รหัส HS",
    "ms": "Kod HS",
    "vi": "Mã HS"
  },
  "tags": ["海关", "编码", "关税"]
}
```

### 示例4：支付术语类 - 信用证

```json
{
  "term_id": "TERM-004",
  "term": "信用证",
  "abbreviation": "L/C",
  "category": "支付方式",
  "definition": "银行应进口商请求开立的承诺付款文件，出口商提交符合信用证条款的单据后，银行保证付款",
  "examples": [
    "使用信用证支付可以降低出口商的收汇风险",
    "不可撤销信用证是最常见的信用证类型"
  ],
  "related_terms": ["Letter of Credit", "L/C", "跟单信用证"],
  "translations": {
    "en": "Letter of Credit",
    "th": "หนังสือค้ำประกันธนาคาร",
    "ms": "Surat Kredit",
    "vi": "Thư tín dụng"
  },
  "tags": ["支付", "金融", "银行"]
}
```

### 示例5：贸易术语类 - FOB

```json
{
  "term_id": "TERM-005",
  "term": "离岸价",
  "abbreviation": "FOB",
  "category": "贸易术语",
  "definition": "Free On Board的缩写，卖方在货物越过船舷时完成交货，之后的风险和费用由买方承担",
  "examples": [
    "该批货物采用FOB上海条款，卖方负责将货物运至上海港并装船",
    "FOB价格通常不包含运费和保险费"
  ],
  "related_terms": ["Free On Board", "船上交货", "离岸价格"],
  "translations": {
    "en": "Free On Board",
    "th": "FOB (Free On Board)",
    "ms": "FOB (Free On Board)",
    "vi": "FOB (Free On Board)"
  },
  "tags": ["贸易术语", "价格", "责任划分"]
}
```

### 示例6：物流术语类 - 集装箱

```json
{
  "term_id": "TERM-006",
  "term": "集装箱",
  "abbreviation": "Container",
  "category": "物流术语",
  "definition": "用于货物运输、储存、转运的标准规格容器，具有防盗、防潮、便于机械化装卸等特点",
  "examples": [
    "该批货物使用20英尺集装箱装载",
    "冷藏集装箱适用于温度敏感商品的运输"
  ],
  "related_terms": ["货柜", "集装箱运输", "TEU"],
  "translations": {
    "en": "Container",
    "th": "ตู้คอนเทนเนอร์",
    "ms": "Kontena",
    "vi": "Container"
  },
  "tags": ["物流", "海运", "包装"]
}
```

---

## 常见术语缩写说明

### 贸易单证缩写
| 缩写 | 英文全称 | 中文名称 |
|------|---------|---------|
| CO | Certificate of Origin | 原产地证书 |
| B/L | Bill of Lading | 提单 |
| CI | Commercial Invoice | 商业发票 |
| PL | Packing List | 装箱单 |
| PI | Proforma Invoice | 形式发票 |
| AWB | Air Waybill | 空运单 |

### 支付方式缩写
| 缩写 | 英文全称 | 中文名称 |
|------|---------|---------|
| L/C | Letter of Credit | 信用证 |
| TT | Telegraphic Transfer | 电汇 |
| DP | Documents against Payment | 付款交单 |
| DA | Documents against Acceptance | 承兑交单 |
| W/U | Western Union | 西联汇款 |

### 贸易术语缩写（Incoterms 2020）
| 缩写 | 英文全称 | 中文名称 |
|------|---------|---------|
| EXW | Ex Works | 工厂交货 |
| FOB | Free On Board | 离岸价 |
| CIF | Cost, Insurance and Freight | 到岸价 |
| DDP | Delivered Duty Paid | 完税后交货 |
| FCA | Free Carrier | 货交承运人 |

---

## 批量导入示例

### 目录结构
```
/term_import/
  ├── term_zh.json    # 中文术语
  ├── term_en.json    # 英文术语
  ├── term_th.json    # 泰语术语
  ├── term_ms.json    # 马来语术语
  └── term_vi.json    # 越南语术语
```

### 批量导入的term_zh.json（包含多条）

```json
{
  "meta": {
    "version": "1.0",
    "corpus_type": "terminology",
    "language": "zh",
    "domain": "trade",
    "created_by": "专家团队",
    "created_at": "2024-01-15T10:00:00Z",
    "description": "跨境贸易术语库 - 中文"
  },
  "data": [
    {
      "term_id": "TERM-001",
      "term": "原产地证书",
      "abbreviation": "CO",
      "category": "贸易单证",
      "definition": "证明货物原产地的官方文件，用于确定关税优惠和贸易限制",
      "examples": [
        "出口货物需要提供原产地证书才能享受关税优惠",
        "RCEP协定项下原产地证书的有效期延长至3年"
      ],
      "related_terms": ["产地证", "原产地证明", "Certificate of Origin"],
      "translations": {
        "en": "Certificate of Origin",
        "th": "ใบรับรองถิ่นกำเนิด",
        "ms": "Sijil Asal",
        "vi": "Giấy chứng nhận xuất xứ"
      },
      "tags": ["单证", "清关", "关税"]
    },
    {
      "term_id": "TERM-002",
      "term": "提单",
      "abbreviation": "B/L",
      "category": "贸易单证",
      "definition": "承运人签发的货物收据，也是物权凭证，用于货物运输和提货",
      "examples": [
        "货物装船后，船公司签发了正本提单",
        "电放提单可以加快货物清关速度"
      ],
      "related_terms": ["Bill of Lading", "海运提单", "正本提单"],
      "translations": {
        "en": "Bill of Lading",
        "th": "ใบอนุญาตขนส่ง",
        "ms": "Bil Pemuatan",
        "vi": "Vận đơn"
      },
      "tags": ["单证", "物流", "海运"]
    },
    {
      "term_id": "TERM-003",
      "term": "海关编码",
      "abbreviation": "HS Code",
      "category": "海关术语",
      "definition": "商品名称及编码协调制度的简称，用于国际贸易商品的统一分类",
      "examples": [
        "查询该商品的HS编码可以确定适用的关税税率",
        "HS编码847130归类为便携式自动数据处理设备"
      ],
      "related_terms": ["HS Code", "商品编码", "税则号列"],
      "translations": {
        "en": "HS Code",
        "th": "รหัส HS",
        "ms": "Kod HS",
        "vi": "Mã HS"
      },
      "tags": ["海关", "编码", "关税"]
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
4. **唯一性验证**：term_id必须在文件内唯一
5. **枚举值验证**：category、language等字段必须在定义的范围内
6. **格式验证**：日期、时间等格式必须正确（如created_at使用ISO 8601格式）

### 术语特定验证规则
1. **term_id格式**：必须符合 TERM-XXX 的格式（XXX为数字）
2. **abbreviation格式**：缩写应为字母组合，不包含特殊字符（除/、-、空格等）
3. **examples数量**：如果存在，至少包含1个例句
4. **translations语言代码**：必须是有效的语言代码（zh/en/th/ms/vi）
5. **tags数量**：如果存在，至少包含1个标签

---

## 错误处理规范

### 严重错误（导致整个文件导入失败）
- JSON格式错误
- meta信息缺失或无效
- data不是数组类型
- 文件编码问题

### 警告错误（跳过当前记录，继续导入下一条）
- 记录缺少必填字段（term_id、term、category、definition）
- 字段类型不匹配
- term_id重复
- abbreviation或category不符合规范

### 信息提示（记录导入，但提醒注意）
- 可选字段缺失（examples、related_terms、translations、tags）
- 定义文本过短（少于10个字符）
- 例句数量少于建议值

---

## 注意事项

1. **abbreviation字段**：不是所有术语都有缩写，如无缩写可省略此字段
2. **translations字段**：建议包含其他4种语言的翻译，便于多语对齐
3. **examples字段**：例句应展示术语在实际业务场景中的使用
4. **related_terms字段**：可包含同义词、近义词、英文对照等
5. **category字段**：必须从预定义的分类标准中选择
6. **term_id命名**：建议使用 TERM-{数字} 的格式，数字从001开始递增

---

## 数量目标（参考规划）

| 语言 | 数量目标 | 阶段 |
|------|---------|------|
| 中文 | 500条 | 阶段1 |
| 英语 | 500条 | 阶段1 |
| 泰语 | 500条 | 阶段1 |
| 马来语 | 500条 | 阶段1 |
| 越南语 | 500条 | 阶段1 |

**总计**：2,500条术语记录
