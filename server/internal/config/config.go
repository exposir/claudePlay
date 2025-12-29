package config

import (
	"errors"
	"fmt"
	"strconv"

	"github.com/spf13/viper"
	"github.com/subosito/gotenv"
)

type Config struct {
	Port               string `mapstructure:"PORT"`
	Mode               string `mapstructure:"MODE"`
	OpenAIApiKey       string `mapstructure:"OPENAI_API_KEY"`
	OpenAIBaseURL      string `mapstructure:"OPENAI_BASE_URL"`
	DBPath             string `mapstructure:"DB_PATH"`
	DatabaseURL        string `mapstructure:"DATABASE_URL"` // For Postgres
	CorsAllowedOrigins string `mapstructure:"CORS_ALLOWED_ORIGINS"`
	ServerAPIKey       string `mapstructure:"SERVER_API_KEY"`
}

func LoadConfig() (*Config, error) {
	_ = gotenv.Load()

	viper.SetDefault("PORT", "8081")
	viper.SetDefault("MODE", "debug")
	viper.SetDefault("OPENAI_BASE_URL", "https://api.openai.com/v1")
	viper.SetDefault("DB_PATH", "claude_play.db")
	// No default for DATABASE_URL, if empty we use SQLite

	viper.AutomaticEnv()

	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		return nil, err
	}

	if err := config.Validate(); err != nil {
		return nil, err
	}

	return &config, nil
}

func (c *Config) Validate() error {
	if c.Port == "" {
		return errors.New("PORT is required")
	}
	if _, err := strconv.Atoi(c.Port); err != nil {
		return fmt.Errorf("PORT must be a number: %w", err)
	}
	if c.Mode != "debug" && c.Mode != "release" {
		return fmt.Errorf("MODE must be debug or release, got %q", c.Mode)
	}
	return nil
}
