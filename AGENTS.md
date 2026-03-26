# AGENTS.md

颜值立方语料库平台 - 简版协作规范

## 1. 常用命令

```bash
# Frontend (/frontend)
npm install
npm run dev
npm run build
npm run preview

# Backend (/backend)
pip install -r requirements.txt
python -m api.main
uvicorn api.main:app --reload

# Database (/backend)
python -m database.init_db
python -m database.check_users
```

## 2. 环境变量

- 前端启用 AI 功能需要：`frontend/.env.local` 中配置 `GEMINI_API_KEY`
- 后端读取根目录 `.env`
- 严禁提交任何 `.env` 文件

## 3. 前端规范（TypeScript/React）

- 跨模块导入统一使用 `@/` 别名，不使用复杂相对路径
- 使用函数式组件与类型标注
- 对象结构优先 `interface`，联合/基础类型用 `type`
- 样式使用 Tailwind，保持简洁一致
- 事件命名：组件内 `handleXxx`，对外回调 `onXxx`
- API 调用使用 `async/await`，并处理异常

## 4. 后端规范（Python/FastAPI）

- 所有函数添加类型注解
- 数据库 I/O 与外部调用使用异步
- API 错误统一使用 `HTTPException`
- 使用 `logging`，不要使用 `print()`
- 导入顺序：标准库 -> 第三方 -> 本地模块

## 5. 通用规则

- 保持 2 空格缩进与现有代码风格一致
- 不提交无关改动，不破坏现有功能
- 涉及用户输入必须校验，数据库操作必须参数化

## 6. 变更记录（新增）

- 任何代码、配置、文案、样式修改，**都必须同步更新** `docs/change-log.md`
- 记录至少包含：日期、修改文件路径、修改内容摘要
- 未更新 `change-log.md` 视为改动未完成
