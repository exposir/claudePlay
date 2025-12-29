package server

import (
	"claude-play-backend/internal/config"
	"claude-play-backend/internal/handlers/chat"
	"claude-play-backend/internal/handlers/health"
	"claude-play-backend/internal/server/middleware"
	"claude-play-backend/internal/services/ai"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func NewServer(cfg *config.Config, db *gorm.DB) *gin.Engine {
	if cfg.Mode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()
	r.Use(middleware.RequireAPIKey(cfg.ServerAPIKey))
	rateLimiter := middleware.NewIPRateLimiter(60, time.Minute)
	r.Use(rateLimiter.Middleware())

	// Handlers
	chatHandler := &chat.ChatHandler{
		OpenAI: &ai.OpenAIProvider{
			APIKey:  cfg.OpenAIApiKey,
			BaseURL: cfg.OpenAIBaseURL,
		},
		DB: db,
	}

	// CORS Configuration
	corsConfig := cors.DefaultConfig()
	if strings.TrimSpace(cfg.CorsAllowedOrigins) == "" {
		corsConfig.AllowAllOrigins = true
	} else {
		origins := strings.Split(cfg.CorsAllowedOrigins, ",")
		for i := range origins {
			origins[i] = strings.TrimSpace(origins[i])
		}
		corsConfig.AllowOrigins = origins
	}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization", "X-API-Key"}
	r.Use(cors.New(corsConfig))

	// Routes
	api := r.Group("/api")
	{
		api.GET("/health", health.HealthCheck)
		api.POST("/chat/stream", chatHandler.Stream)
	}

	return r
}
