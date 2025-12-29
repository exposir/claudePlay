package server

import (
	"claude-play-backend/internal/config"
	"claude-play-backend/internal/handlers/chat"
	"claude-play-backend/internal/handlers/health"
	"claude-play-backend/internal/services/ai"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func NewServer(cfg *config.Config, db *gorm.DB) *gin.Engine {
	if cfg.Mode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	// Handlers
	chatHandler := &chat.ChatHandler{
		OpenAI: &ai.OpenAIProvider{
			APIKey:  cfg.OpenAIApiKey,
			BaseURL: cfg.OpenAIBaseURL,
		},
		DB: db,
	}

	// CORS Configuration
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	// Routes
	api := r.Group("/api")
	{
		api.GET("/health", health.HealthCheck)
		api.POST("/chat/stream", chatHandler.Stream)
	}

	return r
}
