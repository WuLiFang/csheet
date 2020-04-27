package logging

import (
	"os"

	"github.com/WuLiFang/csheet/v6/internal/config"
	"go.uber.org/zap"
)

func getConfig() zap.Config {
	if config.Env == "production" {
		return zap.NewProductionConfig()
	}
	return zap.NewDevelopmentConfig()
}

// GetLogger returns named logger
func GetLogger(n string) *zap.SugaredLogger {
	config := getConfig()
	if os.Getenv("DEBUG") == n {
		config.Level = zap.NewAtomicLevelAt(zap.DebugLevel)
	} else {
		config.Level = zap.NewAtomicLevelAt(zap.InfoLevel)
	}
	logger, err := config.Build()
	if err != nil {
		panic(err)
	}
	return logger.Named(n).Sugar()
}
