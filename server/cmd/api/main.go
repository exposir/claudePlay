package main

import (
	"claude-play-backend/internal/config"
	"claude-play-backend/internal/db"
	"claude-play-backend/internal/server"
	"fmt"
	"log"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	database := db.InitDB(cfg.DBPath, cfg.DatabaseURL)
	r := server.NewServer(cfg, database)

	addr := fmt.Sprintf("0.0.0.0:%s", cfg.Port)
	log.Printf("Server starting on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
