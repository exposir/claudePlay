#!/bin/bash
cd server
# Kill any existing process on port 8081 to avoid "address already in use"
lsof -ti:8081 | xargs kill -9 2>/dev/null

echo "Starting server on 0.0.0.0:8081..."
nohup go run cmd/api/main.go > server.log 2>&1 &
PID=$!
echo "Server started with PID $PID"
echo "Logs are being written to server/server.log"
