# AGENTS.md

颜值立方语料库平台 - 代理编码指南。

## 构建和开发命令

```bash
# 前端（在 /frontend 目录下）
npm install              # 安装依赖
npm run dev              # 启动开发服务器（端口 3001，主机 0.0.0.0）
npm run build            # 生产构建
npm run preview          # 预览生产构建

# 后端（在 /backend 目录下）
pip install -r requirements.txt    # 安装 Python 依赖
python -m api.main                  # 启动 FastAPI 服务器（端口 8000）
uvicorn api.main:app --reload       # 替代开发服务器

# 数据库（在 /backend 目录下）
python -m database.init_db          # 初始化数据库表
python -m database.check_users      # 验证用户账户
```

## 环境设置

**必需**：在 `.env.local` 中设置 `GEMINI_API_KEY` 以启用前端 AI 功能。

后端从根目录的 `.env` 文件读取配置：
```
APP_NAME=语料库管理平台
DEBUG=True
ALLOWED_ORIGINS=http://localhost:3001
DB_HOST=...
DB_USER=...
DB_PASSWORD=...
```

## 代码风格指南

### TypeScript/React（前端）

**导入**：使用 `@` 别名进行绝对导入，组件不使用相对导入
```tsx
import { Component } from '@/components/Component';
import { useAuth } from '@/contexts/AuthContext';
import type { Type } from '@/types/file';
```

**组件**：函数式组件，带显式类型注解
```tsx
interface ComponentProps {
  prop1: string;
  prop2?: number;  // 可选
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  return <div>{prop1}</div>;
};
```

**Hooks**：自定义 hooks 以 `use` 开头，使用类型化的返回值
```tsx
const useCustomHook = (): { state: boolean; setState: Dispatch<SetStateAction<boolean>> } => {
  const [state, setState] = useState(false);
  return { state, setState };
};
```

**状态管理**：局部状态优先使用 `useState`，全局/共享状态使用 contexts
```tsx
const [value, setValue] = useState<string>('');
const { user, logout } = useAuth();
```

**事件处理器**：组件事件处理器前缀 `handle`，传递给子组件的回调前缀 `on`
```tsx
const handleSearch = () => { /* ... */ };
const onSubmit = (data: FormData) => { /* ... */ };
```

**样式**：Tailwind 工具类，优先使用语义化间距（space-x、gap）而非任意值
```tsx
className="flex flex-col gap-4 p-6 rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
```

**错误处理**：使用类型化的错误处理和用户友好的错误信息
```tsx
try {
  await fetchData();
} catch (error) {
  console.error('Failed:', error);
  setError(error instanceof Error ? error.message : 'Unknown error');
}
```

**API 调用**：使用 async/await，为可取消请求使用 abort controllers
```tsx
const fetchData = async () => {
  const response = await fetch('/api/data');
  if (!response.ok) throw new Error('Request failed');
  return response.json();
};
```

**类型安全**：对象形状始终使用 `interface`，联合类型/原始类型使用 `type`
```tsx
interface User { id: number; name: string; }
type Status = 'pending' | 'success' | 'error';
```

**注释**：最少的内联注释（无 JSDoc），优先使用自文档化代码

### Python（后端）

**导入**：标准库 → 第三方库 → 本地模块（各组内按字母顺序排序）
```python
from datetime import timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from api.schemas.auth import LoginRequest
```

**类型注解**：所有函数和方法必须有类型提示
```python
async def get_user(db: AsyncSession, user_id: int) -> Optional[User]:
    """根据 ID 获取用户。"""
    return await db.get(User, user_id)
```

**Async/Await**：所有数据库 I/O 和外部 API 调用必须是异步的
```python
async def authenticate(db: AsyncSession, username: str, password: str) -> bool:
    user = await db.execute(select(User).where(User.username == username))
    return user and verify_password(password, user.password_hash)
```

**错误处理**：API 错误使用 HTTPException，使用状态码抛出
```python
if not user:
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials"
    )
```

**文档字符串**：使用 Google 风格的函数文档字符串（中英文）
```python
def create_access_token(data: dict, expires_delta: timedelta) -> str:
    """创建 JWT access token / Create JWT access token.
    
    Args:
        data: 要编码的 payload 数据
        expires_delta: Token 过期时间
    
    Returns:
        编码后的 JWT token 字符串
    """
```

**命名**：变量/函数使用 snake_case，类使用 PascalCase，常量使用 UPPER_CASE
```python
user_service = AuthService()  # snake_case
class UserService:             # PascalCase
    MAX_RETRIES = 3           # UPPER_CASE
```

**日志记录**：使用 `logging` 模块，不要使用 `print()`
```python
import logging
logger = logging.getLogger(__name__)
logger.error("Database connection failed: %s", str(error))
```

### 通用规则

**路径别名**：所有跨模块导入使用 `@/`（在 vite.config.ts 和 tsconfig.json 中配置）
**语言**：双语代码库（中文注释/文档可接受），用户界面文本使用 i18n 系统
**状态**：优先使用受控组件而非非受控组件，共享状态时向上提升
**性能**：昂贵的组件使用 React.memo，昂贵的计算使用 useMemo/useCallback
**安全性**：绝不提交 .env 文件，验证所有用户输入，使用参数化查询
**格式**：未配置 Prettier/ESLint——手动格式化（2 空格缩进）并保持一致风格
