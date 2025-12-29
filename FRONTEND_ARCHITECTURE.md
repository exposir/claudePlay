# 前端架构文档

本文档详细介绍了 **claudePlay** 项目的前端架构。该应用基于现代 React 最佳实践构建，强调模块化、类型安全和本地优先（Local-first）的数据持久化。

## 🏗 核心架构

应用采用了 **分层架构 (Layered Architecture)** 与 **原子化组件 (Atomic Component)** 设计原则。

### 高层架构分层

1.  **视图层 (UI)**: 负责渲染和用户交互的 React 组件。
2.  **状态管理层**: 使用 Zustand 处理全局状态。
3.  **服务层**: 外部 API（AI 提供商）的抽象层以及本地数据持久化逻辑。
4.  **数据层**: 底层数据结构和类型定义。

## 🛠 技术栈

*   **框架**: [React 19](https://react.dev/)
*   **语言**: [TypeScript](https://www.typescriptlang.org/) (启用严格模式)
*   **构建工具**: [Vite](https://vitejs.dev/)
*   **样式**: [Tailwind CSS](https://tailwindcss.com/)
*   **状态管理**: [Zustand](https://github.com/pmndrs/zustand)
*   **持久化**: [Dexie.js](https://dexie.org/) (基于 IndexedDB 的封装)
*   **UI 组件库**: 基于 [shadcn/ui](https://ui.shadcn.com/) 模式的自定义组件。

## 📂 目录结构与职责

`src/` 目录按技术职责划分：

```
src/
├── components/          # UI 组件
│   ├── ui/              # 原子级、通用的 UI 组件（Button, Input 等）
│   └── ...              # 包含业务逻辑的组件（ChatInterface 等）
├── store/               # 全局状态管理 (Zustand stores)
├── services/            # API 客户端和业务逻辑适配器
├── db/                  # 数据库配置 (Dexie/IndexedDB)
├── types/               # TypeScript 定义 / 领域模型
├── lib/                 # 共享工具库 (cn 混合, 格式化等)
└── hooks/               # 自定义 React hooks
```

### 关键目录说明

*   **`components/ui/`**: 存放“无状态”组件，纯粹负责展示。模仿 shadcn/ui 结构，方便直接定制源码。
*   **`services/`**: 实现了 **适配器模式 (Adapter Pattern)**。`ai.ts` 为不同的 AI 提供商（OpenAI, Anthropic）提供统一接口，UI 层无需关心底层具体调用哪个 API。
*   **`store/`**: 包含 `chatStore.ts`，作为对话会话的“大脑”，处理当前选择的模型、API Key 和临时 UI 状态。

## 🔄 数据流

应用遵循 **单向数据流 (Unidirectional Data Flow)**：

1.  **用户交互**: 用户在 `ChatInterface` 输入消息。
2.  **动作分发**: 组件调用 `chatStore` 中的函数或直接触发服务。
3.  **服务执行**: `services/ai.ts` 与后端或第三方 API 通信。
4.  **状态更新**:
    *   流式响应（Streaming）实时更新 UI。
    *   完成后，消息通过 `db/index.ts` 异步保存到 **IndexedDB**。
5.  **重新渲染**: React 组件订阅 Store 变化并高效更新。

## 💡 关键架构模式

### 1. 本地优先策略 (Local-First)
应用优先使用本地存储：
*   **对话历史**: 存储在 IndexedDB 中。这允许存储大量文本历史，突破了 localStorage 5MB 的限制。
*   **隐私保护**: 用户数据保留在自己的设备上。

### 2. 服务适配器模式
为了支持多种 AI 模型而不让组件充斥 `if/else` 逻辑，`services/ai.ts` 模块标准化了请求/响应格式。新增一个提供商（如 Gemini）只需在服务层增加一个新的适配器。

### 3. UI 原子设计
组件自下而上构建：
*   **原子 (Atoms)**: `Button`, `Input`
*   **分子 (Molecules)**: `ApiKeyInput`, `ModelSelector`
*   **有机体 (Organisms)**: `ChatInterface`

## 🚀 未来扩展

*   **Hook 提取**: `ChatInterface` 中复杂的逻辑（如流处理）可以提取到自定义 Hook（如 `useChatStream`）中。
*   **错误边界**: 为主应用添加全局错误处理。