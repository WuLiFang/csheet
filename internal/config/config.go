package config

import (
	"time"

	"github.com/WuLiFang/csheet/v6/pkg/getenv"
)

// Config entries
var (
	Env                         = getenv.String("CSHEET_ENV", "development")
	Address                     = getenv.String("CSHEET_ADDRESS", "0.0.0.0:80")
	Storage                     = getenv.String("CSHEET_STORAGE", "storage")
	WatchRate                   = getenv.Int("CSHEET_WATCH_RATE", 50)
	FileLife                    = getenv.Duration("CSHEET_FILE_LIFE", 240*time.Hour)
	TempLife                    = getenv.Duration("CSHEET_TEMP_LIFE", time.Hour)
	FolderInclude               = getenv.String("CSHEET_FOLDER_INCLUDE", "*")
	FolderExclude               = getenv.String("CSHEET_FOLDER_EXCLUDE", "")
	CGTeamworkMaxTaskPerCollect = getenv.Int("CSHEET_CGTEAMWORK_MAX_TASK_PER_COLLECT", 1000)
	CGTeamworkPipelineOverwrite = getenv.String("CSHEET_CGTEAMWORK_PIPELINE_OVERWRITE", "{}")
	SentryDSN                   = getenv.String("CSHEET_SERVER_SENTRY_DSN", "")
)
