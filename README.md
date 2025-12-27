# AI Chat Application

A modern chat application supporting multiple AI providers, allowing you to use OpenAI and Anthropic Claude in a single interface.

## Live Demo

Visit the live application: **https://exposir.github.io/claudePlay/**

## Features

### Core Features

- **Multiple AI Provider Support**
  - OpenAI (GPT-3.5, GPT-4, GPT-4 Turbo, etc.)
  - Anthropic Claude (Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku)

- **Conversation Management**
  - Create multiple independent conversations
  - Automatic conversation history saving
  - Quick switching between conversations
  - Delete unwanted conversations
  - Auto-generated conversation titles

- **Flexible Model Selection**
  - Each conversation can independently select AI provider
  - Each conversation can independently select model
  - Switch models anytime during conversation

- **User Experience**
  - Clean and intuitive chat interface
  - Sidebar for quick access to conversation history
  - Markdown rendering support
  - Code syntax highlighting
  - Local storage - no data uploaded to servers

### Supported Models

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

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 9+
- OpenAI API Key and/or Anthropic API Key

### Getting API Keys

1. **OpenAI API Key:** Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Anthropic API Key:** Visit [Anthropic Console](https://console.anthropic.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/exposir/claudePlay.git
cd claudePlay

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit [http://localhost:5173](http://localhost:5173)

### First-time Usage

1. Open the application and enter your API Key(s) (at least one)
2. Click confirm to start using
3. Type messages in the chat interface
4. Switch AI providers and models at the top

## Usage Guide

### Conversation Management

- **New Conversation:** Click the "New Conversation" button at the top of the sidebar
- **Switch Conversation:** Click any conversation in the sidebar
- **Delete Conversation:** Hover over a conversation and click the delete icon

### Switching AI Models

At the top of the chat interface:
1. Select AI provider (OpenAI / Anthropic)
2. Select specific model
3. New messages will use the newly selected model

### Data Storage

- All conversation data is stored in browser LocalStorage
- API Keys are also stored locally and never uploaded to any server
- Clearing browser data will result in loss of conversation history

## Development

### Available Commands

```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm preview  # Preview production build
pnpm lint     # Run ESLint checks
pnpm deploy   # Deploy to GitHub Pages
```

### Tech Stack

- **React 19** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7** - Build tool
- **Tailwind CSS** - Styling framework
- **OpenAI SDK** - OpenAI API integration
- **Anthropic SDK** - Claude API integration
- **React Markdown** - Markdown rendering
- **React Syntax Highlighter** - Code highlighting

### Project Structure

```
src/
├── components/              # React components
│   ├── ApiKeyInput.tsx         # API Key input component
│   ├── ChatInterface.tsx       # Chat interface
│   └── ConversationSidebar.tsx # Conversation sidebar
├── types/                   # TypeScript type definitions
│   └── chat.ts                 # Chat-related types
├── utils/                   # Utility functions
│   └── conversations.ts        # Conversation management
├── App.tsx                  # Main application component
└── main.tsx                 # Application entry point
```

## Deployment

### Deploy to GitHub Pages

This project is configured for GitHub Pages deployment:

```bash
# Build and deploy
pnpm run deploy
```

This will:
1. Build the project
2. Deploy to the `gh-pages` branch
3. Your site will be available at `https://[username].github.io/claudePlay/`

### Deploy to Other Platforms

Build the project:

```bash
pnpm build
```

The `dist/` directory can be deployed to any static hosting service.

**Recommended hosting platforms:**
- [Vercel](https://vercel.com) - Zero configuration deployment
- [Netlify](https://netlify.com) - Continuous deployment from Git
- [Cloudflare Pages](https://pages.cloudflare.com) - Fast global CDN
- [GitHub Pages](https://pages.github.com) - Free static hosting

## Important Notes

- API Keys are stored only in your local browser - keep them safe
- Using AI services incurs costs - check pricing from each provider
- Recommend setting API usage limits to avoid unexpected charges
- Conversation data is stored locally - switching browsers or clearing data will lose history

## License

MIT

## Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [React Documentation](https://react.dev)
- [Development Guidelines](./CLAUDE.md)
