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

The server defaults to port `8080`.
Access the health check at: `http://localhost:8080/api/health`

## Configuration

Environment variables can be used to override defaults:

- `PORT`: Server port (default 8080)
- `MODE`: `debug` or `release` (default debug)
