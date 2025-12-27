# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React 19 + TypeScript 5.9 frontend project built with Vite 7 and managed with pnpm.

**Tech Stack:**
- **React 19.2** - Latest React with improved hooks and concurrent features
- **TypeScript 5.9** - Type-safe development with strict mode
- **Vite 7** - Fast build tool with HMR
- **ESLint 9** - Code quality and consistency

## Essential Commands

```bash
pnpm install          # Install dependencies
pnpm dev             # Start development server (with HMR)
pnpm build           # Type check + build for production
pnpm preview         # Preview production build locally
pnpm lint            # Run ESLint on all files
```

**IMPORTANT:** Always use `pnpm`, never npm or yarn.

## Project Structure

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

### Organizing New Code

When adding new features, use this structure:
```
src/
├── components/      # Reusable UI components
├── hooks/           # Custom React hooks
├── utils/           # Helper functions and utilities
├── types/           # Shared TypeScript types/interfaces
├── constants/       # Application constants
└── services/        # API calls and external services
```

## Coding Conventions

### TypeScript Guidelines

**DO:**
- Use explicit types for function parameters and return values
- Prefer `interface` for object shapes, `type` for unions/intersections
- Use `const` assertions for literal objects when appropriate
- Enable strict mode (already configured)
- Define types in the same file for small components, in `types/` for shared types

**DON'T:**
- Use `any` type (use `unknown` if type is truly unknown)
- Disable TypeScript checks with `@ts-ignore` (use `@ts-expect-error` with explanation if necessary)
- Use non-null assertions (`!`) without careful consideration

### React Component Guidelines

**Component Structure:**
```typescript
// 1. Imports (React, external libs, internal modules)
import { useState, useEffect } from 'react'
import { ExternalComponent } from 'external-lib'
import { InternalUtil } from '@/utils'

// 2. Types/Interfaces
interface MyComponentProps {
  title: string
  count?: number
}

// 3. Component
export function MyComponent({ title, count = 0 }: MyComponentProps) {
  // 3a. Hooks
  const [state, setState] = useState(0)

  // 3b. Event handlers
  const handleClick = () => {
    setState(prev => prev + 1)
  }

  // 3c. Effects
  useEffect(() => {
    // effect logic
  }, [])

  // 3d. Render
  return <div>{title}: {state}</div>
}
```

**DO:**
- Use function components (not class components)
- Use named exports for components
- Keep components small and focused (single responsibility)
- Extract complex logic into custom hooks
- Use React 19's `use` hook for promises when appropriate

**DON'T:**
- Nest component definitions inside other components
- Use default exports for components (prefer named exports)
- Put business logic directly in JSX
- Create unnecessary wrapper components

### File Naming

- Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useAuth.ts`)
- Utils: `camelCase.ts` (e.g., `formatDate.ts`)
- Types: `PascalCase.ts` or `camelCase.types.ts`
- Constants: `UPPER_SNAKE_CASE.ts` or `camelCase.constants.ts`

### Import Organization

Order imports as follows:
```typescript
// 1. React imports
import { useState, useEffect } from 'react'

// 2. External library imports
import axios from 'axios'
import { format } from 'date-fns'

// 3. Internal imports (absolute paths if configured, relative otherwise)
import { Button } from '@/components/Button'
import { useAuth } from '@/hooks/useAuth'
import type { User } from '@/types/user'

// 4. Styles
import './Component.css'
```

### Styling Conventions

- Use CSS Modules for component-specific styles (create `Component.module.css`)
- Use `index.css` for global styles only (resets, theme variables)
- Use `App.css` for app-level styles
- Prefer CSS custom properties (variables) for theming
- Use semantic class names (BEM or descriptive names)

## Configuration Files

- `vite.config.ts` - Vite configuration with React plugin
- `tsconfig.json` - Root TypeScript configuration (references app and node configs)
- `tsconfig.app.json` - TypeScript config for application code
- `tsconfig.node.json` - TypeScript config for Node.js scripts (Vite config, etc.)
- `eslint.config.js` - ESLint configuration with React rules

## Future Integrations

### State Management
Not yet implemented. When needed, consider:
- **Zustand** - Minimal, flexible (recommended for small-medium apps)
- **Jotai** - Atomic state management
- **Redux Toolkit** - For complex state with time-travel debugging
- **React Context** - For simple, localized state

### Routing
Not yet implemented. When needed, use:
- **React Router** (v7+) - Industry standard, file-based routing available

### API Integration
Not yet implemented. When needed, consider:
- **TanStack Query** (React Query) - Recommended for server state
- **SWR** - Alternative with simpler API
- **Axios** - For direct API calls without caching

### Testing
Not yet implemented. Recommended stack:
- **Vitest** - Fast, Vite-native test runner
- **React Testing Library** - Component testing
- **Playwright** - E2E testing

## Development Best Practices

### Performance
- Use React 19's automatic memoization features
- Lazy load routes/components with `React.lazy()` and `Suspense`
- Avoid inline function definitions in JSX for frequently re-rendered components
- Use `useCallback` and `useMemo` only when profiling shows benefit

### Code Quality
- Run `pnpm lint` before committing
- Fix TypeScript errors before building (`pnpm build`)
- Keep bundle size small (check with `pnpm build`)
- Avoid deep prop drilling (use context or state management when needed)

### Git Workflow
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, etc.
- Keep commits focused and atomic
- Write descriptive commit messages

## Troubleshooting

**HMR not working:**
- Check if file is inside `src/` directory
- Restart dev server (`pnpm dev`)
- Clear Vite cache: `rm -rf node_modules/.vite`

**TypeScript errors:**
- Run `pnpm build` to see all type errors
- Check `tsconfig.app.json` for strict settings
- Ensure all dependencies have types installed

**Build fails:**
- Check for TypeScript errors first
- Verify all imports resolve correctly
- Clear dist folder: `rm -rf dist`

**ESLint errors:**
- Run `pnpm lint` to see all issues
- Some rules can be auto-fixed with `pnpm lint --fix`
- Consider enabling type-aware lint rules for production (see README.md)
