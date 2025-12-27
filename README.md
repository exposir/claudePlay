# AI Chat Application

一个支持多 AI 提供商的现代化聊天应用，让你在同一个界面中使用 OpenAI 和 Anthropic Claude 的强大能力。

## 功能特性

### 核心功能

- **多 AI 提供商支持**
  - OpenAI (GPT-3.5, GPT-4, GPT-4 Turbo 等)
  - Anthropic Claude (Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku)

- **对话管理**
  - 创建多个独立对话
  - 对话历史自动保存
  - 快速切换不同对话
  - 删除不需要的对话
  - 自动生成对话标题

- **灵活的模型选择**
  - 每个对话可以独立选择 AI 提供商
  - 每个对话可以独立选择模型
  - 支持在对话中随时切换模型

- **用户体验**
  - 简洁直观的聊天界面
  - 侧边栏快速访问历史对话
  - Markdown 渲染支持
  - 代码高亮显示
  - 本地存储，数据不上传服务器

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

### 前置要求

- Node.js 18+
- pnpm 9+
- OpenAI API Key 和/或 Anthropic API Key

### 获取 API Key

1. **OpenAI API Key:** 访问 [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Anthropic API Key:** 访问 [Anthropic Console](https://console.anthropic.com/)

### 安装

```bash
# 克隆项目
git clone <your-repo-url>
cd claudePlay

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 [http://localhost:5173](http://localhost:5173)

### 首次使用

1. 打开应用后，输入你的 API Key（至少一个）
2. 点击确认，开始使用
3. 在聊天界面中输入消息
4. 可以在顶部切换 AI 提供商和模型

## 使用说明

### 对话管理

- **新建对话:** 点击侧边栏顶部的 "新对话" 按钮
- **切换对话:** 在侧边栏点击任意对话
- **删除对话:** 鼠标悬停在对话上，点击删除图标

### 切换 AI 模型

在聊天界面顶部可以：
1. 选择 AI 提供商 (OpenAI / Anthropic)
2. 选择具体模型
3. 切换后，新消息将使用新选择的模型

### 数据存储

- 所有对话数据存储在浏览器的 LocalStorage 中
- API Key 也存储在本地，不会上传到任何服务器
- 清除浏览器数据会导致对话历史丢失

## 开发

### 可用命令

```bash
pnpm dev      # 启动开发服务器
pnpm build    # 构建生产版本
pnpm preview  # 预览生产构建
pnpm lint     # 运行 ESLint 检查
```

### 技术栈

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
├── components/          # React 组件
│   ├── ApiKeyInput.tsx      # API Key 输入组件
│   ├── ChatInterface.tsx    # 聊天界面
│   └── ConversationSidebar.tsx  # 对话侧边栏
├── types/              # TypeScript 类型定义
│   └── chat.ts             # 聊天相关类型
├── utils/              # 工具函数
│   └── conversations.ts    # 对话管理工具
├── App.tsx             # 主应用组件
└── main.tsx            # 应用入口
```

## 部署

```bash
# 构建生产版本
pnpm build

# dist/ 目录可以部署到任何静态托管服务
```

**推荐的托管平台:**
- [Vercel](https://vercel.com)
- [Netlify](https://netlify.com)
- [Cloudflare Pages](https://pages.cloudflare.com)

## 注意事项

- API Key 仅存储在本地浏览器中，请妥善保管
- 使用 AI 服务会产生费用，请查看各服务商的定价
- 建议设置 API 使用限额，避免意外超支
- 对话数据存储在本地，切换浏览器或清除数据会丢失历史记录

## 许可证

MIT

## 相关资源

- [OpenAI API 文档](https://platform.openai.com/docs)
- [Anthropic API 文档](https://docs.anthropic.com/)
- [React 文档](https://react.dev)
- [开发指南](./CLAUDE.md)
