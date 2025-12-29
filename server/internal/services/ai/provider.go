package ai

import (
	"context"
)

type Message struct {
	Role    string   `json:"role"`
	Content string   `json:"content"`
	Images  []string `json:"images,omitempty"`
}

type ChatRequest struct {
	Provider       string    `json:"provider"`
	Model          string    `json:"model"`
	ConversationID string    `json:"conversationId"`
	Messages       []Message `json:"messages"`
}

type Provider interface {
	ChatStream(ctx context.Context, req ChatRequest, onChunk func(string) error) error
}
