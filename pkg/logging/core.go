package logging

import (
	"os"

	"github.com/WuLiFang/csheet/v6/internal/config"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
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
		config.Level.SetLevel(zap.DebugLevel)
	} else {
		config.Level.SetLevel(zap.InfoLevel)
	}
	logger, err := config.Build(
		zap.WrapCore(func(core zapcore.Core) zapcore.Core {
			return zapcore.NewTee(
				core,
				&SentryCore{LevelEnabler: zap.NewAtomicLevelAt(zapcore.WarnLevel)},
			)
		}))
	if err != nil {
		panic(err)
	}
	return logger.Named(n).Sugar()
}
