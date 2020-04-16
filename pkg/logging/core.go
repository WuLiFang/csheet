package logging

import (
	"os"

	"go.uber.org/zap"
)

var rootLogger *zap.Logger

func init() {
	if os.Getenv("GIN_MODE") != "release" {
		rootLogger, _ = zap.NewDevelopment()
	} else {
		rootLogger, _ = zap.NewProduction()
	}
}

// Root returns root logger
func Root() *zap.Logger {
	return rootLogger
}

func getConfig() zap.Config {
	if os.Getenv("GIN_MODE") == "release" {
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
