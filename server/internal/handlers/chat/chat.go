package chat

import (
	"claude-play-backend/internal/models"
	"claude-play-backend/internal/services/ai"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ChatHandler struct {
	OpenAI *ai.OpenAIProvider
	DB     *gorm.DB
}

func (h *ChatHandler) Stream(c *gin.Context) {
	var req ai.ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1. Ensure Conversation exists (or just log it for now if we assume ID matches frontend)
	// Ideally we check if it exists, if not create it using info from request
	// But since frontend generates ID, we can just use it.
	
	// 2. Save the User's latest message
	// We assume the last message in the array is the new one from the user
	if len(req.Messages) > 0 {
		lastMsg := req.Messages[len(req.Messages)-1]
		if lastMsg.Role == "user" {
			userMsg := models.ChatMessage{
				ID:             fmt.Sprintf("%d", time.Now().UnixNano()), // Simple ID generation
				ConversationID: req.ConversationID,
				Role:           "user",
				Content:        lastMsg.Content,
				Timestamp:      time.Now().UnixMilli(),
			}
			h.DB.Create(&userMsg)
		}
	}
	
	// Create Conversation record if not exists (Upsert)
	conversation := models.Conversation{
		ID:        req.ConversationID,
		Provider:  req.Provider,
		Model:     req.Model,
		UpdatedAt: time.Now(),
	}
	// Use FirstOrCreate to avoid overwriting creation time if exists
	// Or use Save to update 'UpdatedAt'
	// Let's use Clauses to handle upsert properly if needed, or just simple check
	var existingConv models.Conversation
	if result := h.DB.First(&existingConv, "id = ?", req.ConversationID); result.Error != nil {
		conversation.CreatedAt = time.Now()
		h.DB.Create(&conversation)
	} else {
		h.DB.Model(&existingConv).Updates(models.Conversation{
			UpdatedAt: time.Now(),
			Model:     req.Model,
		})
	}

	// Set SSE headers
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("Transfer-Encoding", "chunked")

	var fullResponse string

	onChunk := func(text string) error {
		fullResponse += text
		c.SSEvent("message", text)
		c.Writer.Flush()
		return nil
	}

	var provider ai.Provider
	if req.Provider == "openai" {
		provider = h.OpenAI
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unsupported provider"})
		return
	}

	err := provider.ChatStream(c.Request.Context(), req, onChunk)
	if err != nil {
		c.SSEvent("error", err.Error())
	} else {
		// Save Assistant Message on success
		assistantMsg := models.ChatMessage{
			ID:             fmt.Sprintf("%d", time.Now().UnixNano()),
			ConversationID: req.ConversationID,
			Role:           "assistant",
			Content:        fullResponse,
			Timestamp:      time.Now().UnixMilli(),
		}
		h.DB.Create(&assistantMsg)
	}
	
	c.SSEvent("end", "done")
}
