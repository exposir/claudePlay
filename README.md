# AI Chat Application (AI 聊天应用)

一个现代化的 AI 聊天应用，支持多个模型提供商，让你在同一个界面中使用 OpenAI 和 Anthropic Claude。

## 在线演示

访问在线应用：**https://exposir.github.io/claudePlay/**

## 功能特性

### 核心功能

- **支持多个 AI 提供商**
  - OpenAI (GPT-3.5, GPT-4, GPT-4 Turbo 等)
  - Anthropic Claude (Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku)

- **对话管理**
  - 创建多个独立的对话
  - 自动保存对话历史
  - 快速切换对话
  - 删除不需要的对话
  - 自动生成对话标题

- **灵活的模型选择**
  - 每个对话可独立选择 AI 提供商
  - 每个对话可独立选择模型
  - 在对话过程中随时切换模型

- **用户体验**
  - 简洁直观的聊天界面
  - 侧边栏快速访问历史记录
  - 支持 Markdown 渲染
  - 代码语法高亮
  - 本地存储 - 数据不上传至服务器存储

### 支持的模型

**OpenAI:**
- GPT-3.5 Turbo
- GPT-4
- GPT-4 Turbo
- GPT-4o
- GPT-4o Mini

**Anthropic Claude:**
- Claude 3.5 Sonnet
- Claude 3 Opus
- Claude 3 Sonnet
- Claude 3 Haiku

## 快速开始

### 前置条件

- Node.js 18+
- pnpm 9+
- OpenAI API Key 和/或 Anthropic API Key

### 获取 API Key

1. **OpenAI API Key:** 访问 [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Anthropic API Key:** 访问 [Anthropic Console](https://console.anthropic.com/)

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/exposir/claudePlay.git
cd claudePlay

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 [http://localhost:5173](http://localhost:5173)

### 首次使用

1. 打开应用并输入您的 API Key（至少一个）
2. 点击确认开始使用
3. 在聊天界面输入消息
4. 在顶部切换 AI 提供商和模型

## 使用指南

### 对话管理

- **新建对话:** 点击侧边栏顶部的“新建对话”按钮
- **切换对话:** 点击侧边栏中的任何对话
- **删除对话:** 将鼠标悬停在对话上并点击删除图标

### 切换 AI 模型

在聊天界面顶部：
1. 选择 AI 提供商 (OpenAI / Anthropic)
2. 选择具体模型
3. 新消息将使用新选定的模型

### 数据存储

- 所有对话数据都存储在浏览器的 IndexedDB 中（通过 Dexie）
- API Key 也存储在本地，绝不上传到任何服务器
- 清除浏览器数据会导致对话历史丢失

## 开发相关

### 可用命令

```bash
pnpm dev      # 启动开发服务器
pnpm build    # 生产环境构建
pnpm preview  # 预览生产环境构建
pnpm lint     # 运行 ESLint 检查
pnpm deploy   # 部署到 GitHub Pages
```

### 技术栈

> 有关前端架构的详细深入分析，请参阅 [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md)。

- **React 19** - UI 框架
- **TypeScript 5.9** - 类型安全
- **Vite 7** - 构建工具
- **Tailwind CSS** - 样式框架
- **OpenAI SDK** - OpenAI API 集成
- **Anthropic SDK** - Claude API 集成
- **React Markdown** - Markdown 渲染
- **React Syntax Highlighter** - 代码高亮

### 项目结构

```
src/
├── components/              # React 组件
│   ├── ApiKeyInput.tsx         # API Key 输入组件
│   ├── ChatInterface.tsx       # 聊天主界面
│   └── ConversationSidebar.tsx # 对话侧边栏
├── types/                   # TypeScript 类型定义
│   └── chat.ts                 # 聊天相关类型
├── utils/                   # 工具函数
│   └── conversations.ts        # 对话管理逻辑
├── App.tsx                  # 应用主组件
└── main.tsx                 # 应用入口文件
```

## 部署

### 自动部署 (GitHub Pages)

本项目使用 **GitHub Actions** 进行自动部署。每次推送到 `main` 分支都会：

1. 自动构建项目
2. 部署到 GitHub Pages
3. 更新在线站点：https://exposir.github.io/claudePlay/

**无需手动部署！** 只需将更改推送到 `main` 分支即可。

#### 手动部署（可选）

如果您更喜欢手动部署，可以使用：

```bash
pnpm run deploy
```

这将使用 `gh-pages` 包直接构建并部署。

## 注意事项

- API Key 仅存储在您的本地浏览器中 - 请务必妥善保管
- 使用 AI 服务会产生费用 - 请查看各提供商的定价说明
- 建议设置 API 使用限额以避免意外费用
- 对话数据存储在本地 - 切换浏览器或清除数据会导致历史记录丢失

## 许可证

MIT

## 资源

- [OpenAI API 文档](https://platform.openai.com/docs)
- [Anthropic API 文档](https://docs.anthropic.com/)
- [React 官方文档](https://react.dev)
- [开发指南](./CLAUDE.md)