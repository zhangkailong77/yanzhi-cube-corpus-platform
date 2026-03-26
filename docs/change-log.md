# Change Log

## 2026-03-26

### 首页 Hero 与 Logo 调整

- 文件: `frontend/components/Hero.tsx`
- 变更:
  - 删除首页 Hero 左侧大 Logo 区域中的文字展示（由 `Logo` 组件控制）。
  - 保留左侧头像显示，并将右侧搜索区域向左靠近（`md:space-x-12` 调整为 `md:space-x-6`）。
  - 将 `findCorpora` 标题设置为强制单行显示（新增 `whitespace-nowrap`），避免不同语种下换行。

- 文件: `frontend/components/ui/Logo.tsx`
- 变更:
  - `size="large"` 分支仅保留头像图片 `/2.png`。
  - 去除头像右侧 `title/subtitle` 文本显示。

### 多语言文案更新（LanguageContext）

- 文件: `frontend/components/LanguageContext.tsx`
- 变更:
  - 中文文案更新:
    - `title`: `中国（广西）`
    - `subtitle`: `东盟桂海丝语语料库管理平台`
    - `findCorpora`: `中国（广西）东盟桂海丝语语料库管理平台`
  - 其他语种同步更新 `title/subtitle/findCorpora` 为新平台命名。
  - 按最新中文文案语义，重新翻译并更新各语种 `findCorpora`:
    - `en`: `China (Guangxi)-ASEAN Guihai Silk Language Corpus Management Platform`
    - `th`: `แพลตฟอร์มการจัดการคลังข้อมูลภาษา กุ้ยไห่ซือ จีน (กว่างซี)-อาเซียน`
    - `vi`: `Nền tảng quản lý kho ngữ liệu ngôn ngữ Guihai Silk Trung Quốc (Quảng Tây) - ASEAN`
    - `ms`: `Platform Pengurusan Korpus Bahasa Guihai Silk China (Guangxi)-ASEAN`

### 说明

- 本文档用于记录前端显示与多语言文案相关改动。
- 后续修改可按日期追加，保持可追溯性。
