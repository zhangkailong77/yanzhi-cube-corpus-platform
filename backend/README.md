# 语料库管理平台 - 后端 API

## 项目结构

```
backend/
├── api/                       # API 模块
│   ├── main.py                # FastAPI 应用入口
│   ├── api.py                 # 路由汇总
│   ├── models/                # 数据模型 (SQLAlchemy)
│   │   └── user.py
│   ├── schemas/               # Pydantic 模型
│   │   └── auth.py
│   ├── services/              # 业务逻辑
│   │   └── auth_service.py
│   ├── routes/                # API 路由
│   │   ├── auth.py
│   │   └── user.py
│   └── utils/                 # 工具函数
│       └── security.py
├── database/                  # 数据库相关
│   ├── schema.sql             # 数据库表结构
│   └── init_db.py            # 初始化脚本
├── static/                    # 静态文件
├── requirements.txt           # Python 依赖
└── .env.example              # 环境变量模板
```

## 快速开始

### 1. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 初始化数据库

```bash
python -m database.init_db
```

### 3. 启动 API 服务器

```bash
python -m api.main
```

API 服务将在 `http://localhost:8000` 启动

## API 文档

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 初始管理员账户

```
用户名: admin
密码: Yanzhi2026
```

## API 端点

### 认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 用户登录 |
| GET | `/api/auth/me` | 获取当前用户信息 |
| POST | `/api/auth/logout` | 用户登出 |
| GET | `/api/auth/verify` | 验证 Token |

### 用户

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/user/profile` | 获取用户资料 |
| GET | `/api/user/list` | 获取用户列表（管理员） |

## 技术栈

- **Web 框架**: FastAPI
- **数据库**: MySQL + SQLAlchemy (异步)
- **认证**: JWT (python-jose) + bcrypt
- **数据验证**: Pydantic v2
