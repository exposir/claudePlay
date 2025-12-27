# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React 19 + TypeScript 5.9 frontend project built with Vite 7 and managed with pnpm.

## Common Commands

### Development
```bash
pnpm install          # Install dependencies
pnpm dev             # Start development server (with HMR)
pnpm build           # Type check with TypeScript and build for production
pnpm preview         # Preview production build locally
pnpm lint            # Run ESLint on all files
```

## Architecture

### Project Structure
```
src/
├── App.tsx          # Main application component
├── App.css          # App-specific styles
├── main.tsx         # Application entry point
├── index.css        # Global styles
└── assets/          # Static assets (images, fonts, etc.)

public/              # Public static files (served as-is)
dist/                # Production build output (generated, not in git)
```

### Tech Stack
- **React 19.2** - Latest React with improved hooks and concurrent features
- **TypeScript 5.9** - Type-safe development
- **Vite 7** - Fast build tool with HMR
- **ESLint 9** - Code quality and consistency

### Build & Configuration
- `vite.config.ts` - Vite configuration with React plugin
- `tsconfig.json` - TypeScript configuration (references app and node configs)
- `tsconfig.app.json` - TypeScript config for application code
- `tsconfig.node.json` - TypeScript config for Node.js scripts
- `eslint.config.js` - ESLint configuration with React rules

### State Management
Not yet implemented. Common options: Zustand, Jotai, Redux Toolkit, or React Context.

### Routing
Not yet implemented. Recommended: React Router.

### API Integration
Not yet implemented. Consider: TanStack Query (React Query), SWR, or Axios.

## Development Notes

- **Always use pnpm** - This project uses pnpm as the package manager, not npm or yarn.
- **HMR** - Vite provides instant hot module replacement during development.
- **Type Checking** - Run `tsc -b` or use the build command to type check before deployment.
- **ESLint** - Consider enabling type-aware lint rules for production (see README.md for details).
