package models

import (
	"time"

	"gorm.io/gorm"
)

type Conversation struct {
	ID        string         `gorm:"primaryKey" json:"id"`
	Title     string         `json:"title"`
	Provider  string         `json:"provider"`
	Model     string         `json:"model"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	Messages  []ChatMessage  `gorm:"foreignKey:ConversationID" json:"messages"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type ChatMessage struct {
	ID             string    `gorm:"primaryKey" json:"id"`
	ConversationID string    `gorm:"index" json:"conversationId"`
	Role           string    `json:"role"`
	Content        string    `json:"content"`
	Timestamp      int64     `json:"timestamp"`
	// 为了简单起见，Images 暂不存数据库，或者以 JSON 字符串存储
	// 在 SQLite 中通常不存大二进制文件，建议存文件路径，这里先忽略图片持久化
}
