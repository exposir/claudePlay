# Repository Guidelines

## Project Structure & Module Organization
- `src/`: React + TypeScript frontend source. UI components live in `src/components/`, shared logic in `src/services/`, state in `src/store/`, and helpers in `src/utils/`.
- `public/`: Static assets copied as-is by Vite.
- `server/`: Go backend (Gin + Viper). Entry point in `server/cmd/api/`, core logic in `server/internal/`.
- `dist/`: Production build output (generated).

## Build, Test, and Development Commands
Frontend (from repo root, uses pnpm):
- `pnpm install`: Install dependencies.
- `pnpm dev`: Run Vite dev server at `http://localhost:5173`.
- `pnpm build`: Type-check and build to `dist/`.
- `pnpm preview`: Serve the production build locally.
- `pnpm lint`: Run ESLint.
- `pnpm test`: Run Vitest unit tests.
- `pnpm deploy`: Build and publish `dist/` to GitHub Pages.

Backend (from `server/`):
- `go run cmd/api/main.go`: Start API server on `http://localhost:8080` (health: `/api/health`).

## Coding Style & Naming Conventions
- Indentation: 2 spaces; TypeScript with semicolons and single quotes as seen in `src/`.
- Components: PascalCase filenames (e.g., `ChatInterface.tsx`). Hooks and stores use `useX`/camelCase.
- Styling: Tailwind utility classes in JSX; global styles in `src/index.css` and `src/App.css`.
- Linting: ESLint via `eslint.config.js`. Run `pnpm lint` before PRs.

## Testing Guidelines
- Frontend uses Vitest; keep tests near modules (e.g., `src/utils/*.test.ts`).
- Backend uses Go's standard test runner (`go test ./...`) with `*_test.go` files.
- Keep unit tests small and deterministic; avoid network calls in CI.

## Commit & Pull Request Guidelines
- Commits follow Conventional Commit style (`feat:`, `docs:`, `ci:`, `chore:`). Keep messages short and scoped.
- PRs should include: a clear description, linked issue (if any), and screenshots/GIFs for UI changes.
- Note any new environment variables or migration steps in the PR body.

## Configuration & Security Notes
- API keys are stored in browser local storage; never commit real keys or dump them in logs.
- Copy `.env.example` (frontend) and `server/.env.example` (backend) for local configuration.
- Backend config supports `PORT`, `MODE`, `OPENAI_API_KEY`, and optional `SERVER_API_KEY` (see `server/README.md`).
