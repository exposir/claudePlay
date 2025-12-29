package config

import (
	"github.com/spf13/viper"
)

type Config struct {
	Port           string `mapstructure:"PORT"`
	Mode           string `mapstructure:"MODE"`
	OpenAIApiKey   string `mapstructure:"OPENAI_API_KEY"`
	OpenAIBaseURL  string `mapstructure:"OPENAI_BASE_URL"`
	DBPath         string `mapstructure:"DB_PATH"`
	DatabaseURL    string `mapstructure:"DATABASE_URL"` // For Postgres
}

func LoadConfig() (*Config, error) {
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

	return &config, nil
}
