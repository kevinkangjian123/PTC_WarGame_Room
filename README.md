# PTC 战略作战室 (PTC Strategic War Room)

基于红蓝军动态兵棋推演模型的战略分析系统。

## 部署指南 (Zeabur)

### 1. 准备 GitHub 仓库
- 在 GitHub 上创建一个新仓库。
- 在 AI Studio 中使用 **Settings -> Export to GitHub** 将代码推送到该仓库。

### 2. 在 Zeabur 部署
- 登录 [Zeabur](https://zeabur.com/)。
- 点击 **Create Project**。
- 选择 **Deploy from GitHub** 并选择你的仓库。
- Zeabur 会自动识别 `Dockerfile` 并开始构建。

### 3. 配置环境变量
在 Zeabur 的服务设置中添加以下变量：
- `GEMINI_API_KEY`: 你的 Google Gemini API 密钥。
- `DATABASE_PATH`: 设置为 `/data/war_room.db`（如果你挂载了存储卷）。

### 4. 挂载存储卷 (可选但推荐)
- 为了让 SQLite 数据库持久化，在 Zeabur 服务设置中添加一个 **Volume**。
- 挂载路径设置为 `/data`。
- 确保环境变量 `DATABASE_PATH` 指向该路径。

## 技术栈
- **Frontend**: React, Tailwind CSS, Motion, Lucide Icons
- **Backend**: Express, SQLite (better-sqlite3)
- **AI**: Google Gemini API (@google/genai)
- **Deployment**: Docker, Zeabur
