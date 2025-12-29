package db

import (
	"claude-play-backend/internal/models"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func InitDB(dbPath string, databaseURL string) *gorm.DB {
	var dialector gorm.Dialector

	if databaseURL != "" {
		log.Println("Initializing PostgreSQL database...")
		dialector = postgres.Open(databaseURL)
	} else {
		log.Printf("Initializing SQLite database at %s...", dbPath)
		dialector = sqlite.Open(dbPath)
	}

	db, err := gorm.Open(dialector, &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	// For Postgres on some platforms (like Heroku/Railway), we might need to handle SSL
	// But usually the driver handles it if the URL contains sslmode=require

	// Auto Migrate
	err = db.AutoMigrate(&models.Conversation{}, &models.ChatMessage{})
	if err != nil {
		// Log error but maybe don't crash if it's just a connection blip, though for DB init crashing is usually safer
		log.Fatalf("failed to migrate database: %v", err)
	}

	return db
}
