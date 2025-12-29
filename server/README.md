# Claude Play Backend

This is the Go backend for the Claude Play application. It uses **Gin** for the web framework and **Viper** for configuration.

## Prerequisites

- Go 1.18+

## Structure

- `cmd/api`: Entry point.
- `internal/server`: Router and server configuration.
- `internal/handlers`: HTTP handlers.
- `internal/config`: Configuration management.

## Running locally

```bash
# Install dependencies
go mod download

# Run the server
go run cmd/api/main.go
```

The server defaults to port `8081`.
Access the health check at: `http://localhost:8081/api/health`

## Configuration

Copy `server/.env.example` to `server/.env` to set local overrides.

Environment variables can be used to override defaults:

- `PORT`: Server port (default 8081)
- `MODE`: `debug` or `release` (default debug)
- `OPENAI_API_KEY`: OpenAI API key (required for `/api/chat/stream`)
- `OPENAI_BASE_URL`: Override OpenAI base URL
- `DB_PATH`: SQLite database path
- `DATABASE_URL`: Postgres connection string
- `CORS_ALLOWED_ORIGINS`: Comma-separated origins for CORS
- `SERVER_API_KEY`: Shared secret for backend access (`X-API-Key` header)
