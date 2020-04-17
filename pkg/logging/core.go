package logging

import (
	"os"

	"go.uber.org/zap"
)

func getConfig() zap.Config {
	if os.Getenv("CSHEET_ENV") == "production" {
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
