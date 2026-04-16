# 颜值立方语料库平台｜内部交接手册

> **文档属性：内部交接文档 / 敏感信息文档**  
> 适用对象：接手开发、运维、项目负责人  
> 使用场景：本地开发、问题排查、测试联调、服务器部署、日常维护、离职交接  
> **注意：本文包含生产环境地址、默认账号、部署方式等内部信息，请勿外传。**

---

## 1. 项目概述

本项目是一个面向多语种语料管理与展示的 Web 平台，当前主要承担以下功能：

- 语料库列表展示与检索
- 语料样本分页浏览
- 多类型语料导入（JSON / JSONL / TXT / Parquet）
- 用户注册、登录、鉴权、权限控制
- 统计信息与仪表盘展示
- 音频语料浏览与部分文本修订
- 本地音频数据集与 MinIO 音频数据预览

当前代码结构为前后端分离：

- **前端**：React + TypeScript + Vite
- **后端**：FastAPI + SQLAlchemy（异步）+ MySQL
- **部署方式**：Docker Compose 为主，也支持本地分别启动前后端

---

## 2. 系统架构与访问关系

### 2.1 本地开发默认端口

| 模块 | 技术栈 | 默认端口 | 说明 |
|---|---|---:|---|
| Frontend | Vite + React | `3001` | 本地开发前端服务 |
| Backend | FastAPI + Uvicorn | `8000` | 本地开发后端服务 |
| MySQL | MySQL | `3306` | 本地/内网数据库 |

### 2.2 Docker / 生产部署默认端口

| 模块 | 容器端口 | 宿主机端口 | 说明 |
|---|---:|---:|---|
| Frontend | `3002` | `3002` | Nginx 托管前端静态文件 |
| Backend | `8001` | `8001` | FastAPI API 服务 |
| MySQL | 外部数据库 | `13306` | 当前生产数据库端口 |

### 2.3 当前代码中使用的线上地址

当前 `docker-compose.yml` / `frontend/.env.production` 中写死的线上接口地址为：

- 前端访问地址：`http://112.124.32.196:3002`
- 后端 API 地址：`http://112.124.32.196:8001`
- 后端 API 前缀：`http://112.124.32.196:8001/api`
- 生产数据库地址：`112.124.32.196:13306`

> 如果服务器 IP、域名、端口变更，需要同时检查：
>
> - `docker-compose.yml`
> - `frontend/.env.production`
> - `backend/.env.production`
> - 前端构建产物是否已重新 build

---

## 3. 仓库目录说明

```text
.
├── README.md                  # 当前交接主文档
├── AGENTS.md                  # 仓库级协作规范
├── docker-compose.yml         # Docker 部署入口
├── backend/                   # FastAPI 后端
│   ├── api/                   # 路由、模型、服务、鉴权
│   ├── database/              # 初始化、迁移、修复、种子脚本
│   ├── media/                 # 运行时生成的媒体文件目录（启动后创建）
│   ├── .env                   # 本地后端环境变量（实际运行读取它）
│   ├── .env.example           # 后端环境变量模板
│   ├── .env.production        # Docker/生产环境变量
│   ├── Dockerfile             # 后端镜像构建文件
│   └── requirements.txt       # Python 依赖
├── frontend/                  # React 前端
│   ├── api/                   # 前端 API 封装
│   ├── components/            # 页面组件
│   ├── contexts/              # 认证上下文
│   ├── pages/                 # 页面
│   ├── public/                # 静态资源（含 voicedatas）
│   ├── router/                # 路由
│   ├── .env.local             # 本地前端环境变量（需自行创建）
│   ├── .env.production        # 生产构建变量
│   ├── Dockerfile             # 前端镜像构建文件
│   ├── nginx.conf             # 前端容器中的 Nginx 配置
│   └── package.json           # Node 依赖与脚本
└── docs/
    ├── change-log.md          # 变更记录（每次改动必须更新）
    ├── plans/                 # 设计/规划文档
    ├── classes/               # 语料类别说明文档
    ├── json/                  # 示例数据
    └── resource/              # 附件/压缩包资源
```

---

## 4. 运行环境要求

### 4.1 本地开发建议版本

- Node.js：建议 `20.x`
- npm：建议随 Node 20 配套版本
- Python：建议 `3.11`
- MySQL：建议 `8.x`

### 4.2 服务器部署依赖

- Docker
- Docker Compose
- 可访问 MySQL 数据库
- 如需音频 MinIO 预览，需网络可访问 MinIO 服务

---

## 5. 环境变量与配置说明

> **重要说明**：当前项目存在“文档描述”和“代码实际读取位置”不完全一致的情况。  
> 请以“代码实际行为”为准，不要只看旧文档。

### 5.1 前端环境变量

前端实际使用到的环境变量：

| 变量名 | 用途 | 示例 |
|---|---|---|
| `GEMINI_API_KEY` | 前端 AI 功能使用，Vite 会注入到构建中 | `xxx` |
| `VITE_API_BASE_URL` | 后端根地址（登录、鉴权等） | `http://localhost:8000` |
| `VITE_API_URL` | 后端 API 前缀（语料接口等） | `http://localhost:8000/api` |

#### 本地建议创建文件

文件：`frontend/.env.local`

```env
GEMINI_API_KEY=请填写实际密钥
VITE_API_BASE_URL=http://localhost:8000
VITE_API_URL=http://localhost:8000/api
```

#### 生产构建文件

文件：`frontend/.env.production`

当前仓库中配置为：

```env
VITE_API_BASE_URL=http://112.124.32.196:8001
VITE_API_URL=http://112.124.32.196:8001/api
```

### 5.2 后端环境变量

后端代码实际从 **`backend/.env`** 读取环境变量，Docker 部署时使用 **`backend/.env.production`**。

核心配置项如下：

| 变量名 | 用途 | 当前说明 |
|---|---|---|
| `DB_HOST` | MySQL 主机 | 本地/测试/生产按环境区分 |
| `DB_PORT` | MySQL 端口 | 本地通常 `3306`，生产当前 `13306` |
| `DB_USER` | MySQL 用户名 | 当前多处默认用 `root` |
| `DB_PASSWORD` | MySQL 密码 | 敏感信息 |
| `DB_NAME` | 数据库名 | 当前为 `corpus_management` |
| `SECRET_KEY` | JWT 签名密钥 | 生产应使用强随机密钥 |
| `ALGORITHM` | JWT 算法 | 默认 `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token 有效期 | 默认 `30` |
| `APP_NAME` | 应用名称 | 展示用途 |
| `DEBUG` | 是否开发模式 | 开发 `True`，生产 `False` |
| `AUTO_INIT_DATABASE` | 启动时自动初始化数据库 | 生产慎开 |
| `ALLOWED_ORIGINS` | CORS 白名单 | 多个域名用逗号分隔 |
| `LOCAL_AUDIO_VOICEDATAS_DIR` | 本地音频语料目录 | Docker 中已显式挂载 |
| `MINIO_AUDIO_*` | MinIO 音频预览相关配置 | 有默认值，但建议显式配置 |

#### 后端本地环境变量模板

可基于 `backend/.env.example` 复制：

```bash
cp backend/.env.example backend/.env
```

然后按实际环境修改。

### 5.3 生产环境当前敏感配置（交接用）

当前仓库内可见的生产部署信息：

- 数据库主机：`112.124.32.196`
- 数据库端口：`13306`
- 数据库名：`corpus_management`
- 后端 API：`http://112.124.32.196:8001`
- 前端站点：`http://112.124.32.196:3002`

> **建议**：接手后优先做两件事：
>
> 1. 将生产环境敏感配置移出仓库，改为部署机独立环境管理；
> 2. 更换默认密钥、默认密码、MinIO 默认口令。

---

## 6. 本地开发调试

### 6.1 前端启动

```bash
cd frontend
npm install
npm run dev
```

默认访问：`http://localhost:3001`

### 6.2 后端启动

```bash
cd backend
pip install -r requirements.txt
python -m api.main
```

默认访问：`http://localhost:8000`

接口文档：

- Swagger：`http://localhost:8000/docs`
- ReDoc：`http://localhost:8000/redoc`
- 健康检查：`http://localhost:8000/health`

### 6.3 本地联调最小流程

1. 配置 `backend/.env`
2. 启动 MySQL 并确认数据库可连
3. 启动后端 `python -m api.main`
4. 配置 `frontend/.env.local`
5. 启动前端 `npm run dev`
6. 浏览器打开 `http://localhost:3001`
7. 通过 Swagger 或页面验证登录、列表、详情、导入等功能

### 6.4 本地联调注意事项

#### 1）前端调用分成两套地址

- 登录/注册/鉴权使用 `VITE_API_BASE_URL`
- 语料相关接口使用 `VITE_API_URL`

所以本地联调时 **两个变量都要配**，否则会出现部分接口正常、部分接口失败的情况。

#### 2）后端默认允许开发环境任意来源

`backend/api/main.py` 中：

- `DEBUG=True` 时，CORS 放开为 `*`
- `DEBUG=False` 时，严格按 `ALLOWED_ORIGINS` 控制

因此本地开发一般更容易联通，生产环境一旦改错 `ALLOWED_ORIGINS`，前端就会跨域失败。

#### 3）本地音频语料的实际目录不是 backend/media

音频语料预览里有两类文件：

- **导入上传生成的音频文件**：存到 `backend/media/audio`
- **本地 voicedatas 数据集**：默认读取 `frontend/public/voicedatas`

Docker 里通过卷映射把：

```text
./frontend/public/voicedatas -> /app/voicedatas
```

再通过 `LOCAL_AUDIO_VOICEDATAS_DIR=/app/voicedatas` 给后端读取。

这块是后续最容易踩坑的地方之一。

---

## 7. 数据库初始化、迁移与数据维护

### 7.1 数据库名称

当前数据库名固定为：

```text
corpus_management
```

### 7.2 推荐初始化方式

优先使用后端环境变量驱动的方式，而不是直接相信旧脚本中的硬编码地址。

#### 方式 A：依赖应用启动自动初始化

当后端环境变量中配置：

```env
AUTO_INIT_DATABASE=True
```

启动后端时会自动执行：

- 确保数据库存在
- 确保关键表存在
- 自动补 admin 用户（如缺失）

> 生产环境谨慎开启，避免误连数据库后自动改表。

#### 方式 B：手工执行初始化脚本

```bash
cd backend
python -m database.init_db
```

### 7.3 初始化脚本的重要风险

`backend/database/init_db.py` 里当前仍然写着 **硬编码内网数据库地址**：

- `192.168.31.11:3306`
- 用户 `root`
- 密码 `123456`

这意味着：

- 如果你直接执行该脚本，它**不一定读取当前 `.env`**
- 在新环境上大概率需要先改脚本
- 如果内网地址恰好可访问，可能会误操作旧数据库

**结论：接手后优先整改这一点。**

### 7.4 默认管理员账号

当前代码和 schema 中都保留了默认管理员：

- 用户名：`admin`
- 初始密码：`Yanzhi2026`

另有密码重置脚本：

```bash
cd backend
python -m database.reset_admin_password
```

该脚本默认会把管理员密码重置为：

- `Yanzhi2026.`

注意最后有一个英文句号 `.`，不要看漏。

如果要自定义重置密码，可先设置环境变量：

```bash
export ADMIN_RESET_PASSWORD='你的新密码'
python -m database.reset_admin_password
```

### 7.5 迁移/修复脚本清单

`backend/database/` 下保留了多类历史脚本，包括但不限于：

- `migrate_alignment_table.py`
- `migrate_audio_domain.py`
- `migrate_case_table.py`
- `migrate_corpus_data.py`
- `migrate_new_classes.py`
- `migrate_process_table.py`
- `migrate_qa_table.py`
- `migrate_scenario_table.py`
- `migrate_user_display_name.py`
- `fix_qa_constraints.py`
- `check_users.py`
- `seed_all_data.py`
- `seed_scenario_direct.py`
- `seed_scenario_sync.py`

**注意：这些脚本质量和风格不完全一致，有的走环境变量，有的写死数据库地址。**  
在生产库执行前，**务必先读脚本内容、确认连接目标、做好备份。**

---

## 8. Docker / 生产部署说明

### 8.1 当前部署方式

仓库根目录提供 `docker-compose.yml`，当前定义了两个服务：

- `backend`
- `frontend`

#### 启动命令

```bash
docker compose up -d --build
```

#### 查看日志

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

#### 停止服务

```bash
docker compose down
```

### 8.2 Backend 容器行为

- 基于 `python:3.11-slim`
- 安装 `requirements.txt`
- 启动命令：

```bash
uvicorn api.main:app --host 0.0.0.0 --port 8001
```

- 使用环境文件：`./backend/.env.production`
- 挂载本地音频目录：

```text
./frontend/public/voicedatas:/app/voicedatas:rw
```

- 注入环境变量：

```env
LOCAL_AUDIO_VOICEDATAS_DIR=/app/voicedatas
```

### 8.3 Frontend 容器行为

前端采用两阶段构建：

1. `node:20-alpine` 执行 `npm install` + `npm run build`
2. `nginx:alpine` 托管 `dist/`

生产端口：`3002`

Nginx 已做单页应用路由兜底：

```nginx
try_files $uri $uri/ /index.html;
```

### 8.4 生产部署前检查项

每次部署前至少检查：

- [ ] `backend/.env.production` 是否是当前环境配置
- [ ] `frontend/.env.production` 是否指向当前后端地址
- [ ] `docker-compose.yml` 中 API 地址、端口、卷映射是否正确
- [ ] 数据库是否可达
- [ ] `frontend/public/voicedatas` 是否存在且权限正确
- [ ] 若改过接口地址，是否执行了前端重新构建

---

## 9. 鉴权、角色与登录说明

### 9.1 当前角色模型

系统当前只有两种角色：

- `admin`：管理员
- `member`：普通成员

### 9.2 登录与注册

后端相关接口：

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/verify`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### 9.3 权限规则（当前实现）

- 所有人都可以看到语料库列表
- 未登录用户 / 普通成员：只能访问公开语料库详情和样本
- 非公开语料库需要更高权限
- 新注册用户默认角色是 `member`

### 9.4 Token 存储位置

前端把登录信息存储在浏览器 `localStorage`：

- `auth_token`
- `auth_user`

如果用户反馈“明明登录过又掉线/身份异常”，优先让其清理浏览器本地存储后重试。

---

## 10. 语料导入与音频数据说明

### 10.1 支持的导入格式

当前后端导入接口支持：

- `.json`
- `.jsonl`
- `.txt`（按 JSONL 处理）
- `.parquet`

### 10.2 导入能力概览

后端支持：

- 上传文件导入到已有语料库
- 创建语料库并同时导入样本
- 通过文件创建语料库并导入
- 从 MinIO 拉取对象并预览音频类语料

### 10.3 音频相关数据位置

#### A. 导入后生成的媒体文件

目录：`backend/media/audio`

访问形式：

```text
/media/audio/<文件名>
```

#### B. 本地 voicedatas 数据集

默认目录：`frontend/public/voicedatas`

这部分会被后端读取，也会被前端静态访问。

#### C. MinIO 音频预览

后端 `corpus_service.py` 中内置了一组默认 MinIO 配置，包含：

- endpoint
- access_key
- secret_key
- bucket
- object_name
- cache_prefix
- enabled

虽然代码里有默认值，但**不要把“代码默认值存在”理解为“生产环境就应该继续这样跑”**。  
接手后建议统一改成环境变量显式配置。

---

## 11. 常见日常操作

### 11.1 本地开发启动

```bash
# backend
cd backend
pip install -r requirements.txt
python -m api.main

# frontend
cd frontend
npm install
npm run dev
```

### 11.2 检查用户表

```bash
cd backend
python -m database.check_users
```

> 注意：该脚本当前写死内网数据库地址，只适合在确认目标环境后使用。

### 11.3 重置管理员密码

```bash
cd backend
python -m database.reset_admin_password
```

### 11.4 Docker 重建部署

```bash
docker compose down
docker compose up -d --build
```

### 11.5 查看后端接口是否存活

```bash
curl http://127.0.0.1:8000/health
# 或生产
curl http://112.124.32.196:8001/health
```

---

## 12. 常见故障排查

### 12.1 前端能打开，但接口全部 404 / 连接失败

优先检查：

1. `frontend/.env.local` 或 `.env.production` 是否正确
2. 前端是否重新 build
3. `VITE_API_BASE_URL` 和 `VITE_API_URL` 是否同时改了
4. 后端端口到底是 `8000` 还是 `8001`

### 12.2 浏览器报跨域错误

检查后端：

- `DEBUG` 是否为 `False`
- `ALLOWED_ORIGINS` 是否包含前端实际访问地址

### 12.3 登录失败 / Token 无效

检查：

1. `SECRET_KEY` 是否改过导致旧 token 全部失效
2. 浏览器 `localStorage` 里的 `auth_token` 是否残留旧值
3. 数据库中的 admin 密码是否被重置过

### 12.4 导入 parquet 失败

后端依赖 `pandas` + `pyarrow`，`requirements.txt` 中已有。  
如果容器或虚拟环境不完整，会报 parquet 解析依赖缺失。

### 12.5 音频语料看不到 / 编辑无效

重点检查：

- `frontend/public/voicedatas` 目录是否存在
- Docker 卷是否正确挂载到 `/app/voicedatas`
- `LOCAL_AUDIO_VOICEDATAS_DIR` 是否正确
- 目录读写权限是否足够
- 修改是否写入到了对应 `txt` 文件

### 12.6 后端启动时误初始化数据库

如果 `AUTO_INIT_DATABASE=True`，后端启动会尝试建库建表。  
如果连接配置指向生产库或错误库，可能造成非预期变更。

**建议：生产默认关闭，手工执行初始化/迁移。**

### 12.7 某些数据库脚本执行后报错

原因通常有三个：

1. 脚本写死了旧环境地址
2. 表已经存在或字段已经迁移过
3. 生产库结构与脚本假设不一致

处理原则：

- 先备份
- 先在测试库验证
- 再决定是否修改脚本或手动执行 SQL

---

## 13. 当前已知问题 / 历史遗留风险

这是接手后最该优先关注的一部分。

### 13.1 文档与代码存在不一致

例如：

- 旧 README 基本是模板内容，已经失真
- `AGENTS.md` 里写“后端读取根目录 .env”，但实际代码读取的是 `backend/.env`
- `backend/README.md` 描述的目录结构与实际代码不完全一致

**结论：后续排查请优先看实际代码，不要盲信旧文档。**

### 13.2 多个脚本存在硬编码配置

尤其数据库初始化、用户检查、历史迁移脚本，存在：

- 硬编码 IP
- 硬编码 root 密码
- 假设表结构固定

这对交接、迁移、扩容都不友好，也是当前最大技术债之一。

### 13.3 生产敏感信息仍在仓库中

当前仓库可直接看到：

- 生产数据库地址
- 数据库密码
- MinIO 默认口令
- 默认管理员密码

这在安全上存在明显风险。接手后建议立即整改。

### 13.4 缺少统一测试脚本与交付前校验链路

当前仓库中：

- 前端没有标准 lint/test 命令
- 后端没有统一 pytest 测试体系
- 发布前主要依赖人工验证

接手后如要长期维护，建议补：

- 前端 lint / typecheck
- 后端单元测试 / 冒烟测试
- 部署前 checklist

### 13.5 front/back 端口与环境切换容易混淆

目前存在两套常用端口：

- 本地开发：前端 `3001`，后端 `8000`
- Docker/生产：前端 `3002`，后端 `8001`

新同事如果不熟悉，很容易把环境变量配错。

---

## 14. 建议的接手顺序

建议接手同事按以下顺序熟悉系统：

1. 先完整读完本文
2. 本地把前后端跑起来
3. 看一遍 Swagger 接口
4. 用默认管理员登录一次，走通核心页面
5. 验证一个语料导入流程
6. 验证一个音频语料读取/编辑流程
7. 登录服务器核对 Docker Compose 与实际运行容器
8. 核对数据库连通性与表结构
9. 盘点并替换仓库内敏感配置
10. 再开始业务改动

---

## 15. 交接建议（务实版）

如果你是新接手的人，我建议第一周只做下面几件事：

### 第一优先级：保系统稳定

- 不要一上来大改架构
- 先把部署、回滚、数据库、账号体系搞清楚
- 先确认现网哪些功能是业务方在真实使用的

### 第二优先级：收口配置

- 整理 `.env` / `.env.production`
- 去掉仓库中的敏感明文
- 统一端口、域名、变量命名

### 第三优先级：收口脚本

- 逐个排查 `backend/database/*.py`
- 标记哪些还能用，哪些已经历史废弃
- 把硬编码脚本改为环境变量驱动

### 第四优先级：补最小测试与巡检能力

至少补以下能力：

- 健康检查脚本
- 登录/鉴权冒烟验证
- 语料列表接口冒烟验证
- Docker 部署后的访问验证

---

## 16. 与本次交接相关的其他文件

建议同时查看：

- `docs/change-log.md`：变更记录
- `backend/.env.example`：后端变量模板
- `docker-compose.yml`：当前部署方式
- `backend/api/main.py`：后端启动与 CORS 逻辑
- `backend/database/connection.py`：数据库初始化逻辑
- `backend/api/routes/import_corpus.py`：导入逻辑
- `backend/api/services/corpus_service.py`：音频语料 / MinIO 逻辑

---

## 17. 最后说明

这份 README 的目标不是“写得漂亮”，而是让接手人：

- 能把系统跑起来
- 能知道去哪里改配置
- 知道哪些地方风险最高
- 出问题时知道先查哪里

如果后续继续维护本项目，建议把本文继续作为主交接文档维护，不要再让 README 退化成模板说明。
