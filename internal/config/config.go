package config

import (
	"flag"
	"time"

	"github.com/WuLiFang/csheet/v6/pkg/getenv"
)

var (
	// Env config
	Env string
	// Address config
	Address string
	// Storage config
	Storage string
	// WatchRate config
	WatchRate int
	// FileLife config
	FileLife time.Duration
	// TempLife config
	TempLife time.Duration
	// FolderInclude config
	FolderInclude string
	// FolderExclude config
	FolderExclude string
	// CGTeamworkMaxTaskPerCollect config
	CGTeamworkMaxTaskPerCollect int
	// CGTeamworkPipelineOverwrite config
	CGTeamworkPipelineOverwrite string
	// SentryDSN config
	SentryDSN string
)

func init() {
	flag.StringVar(
		&Env,
		"env",
		getenv.String("CSHEET_ENV", "development"),
		"production or development")
	flag.StringVar(
		&Address,
		"address",
		getenv.String("CSHEET_ADDRESS", "0.0.0.0:80"),
		"bind address")
	flag.StringVar(
		&Storage,
		"storage",
		getenv.String("CSHEET_STORAGE", "storage"),
		"data storage path")
	flag.IntVar(
		&WatchRate,
		"watch-rate",
		getenv.Int("CSHEET_WATCH_RATE", 50),
		"watch file stats per seconds")
	flag.DurationVar(
		&FileLife,
		"file-life",
		getenv.Duration("CSHEET_FILE_LIFE", 240*time.Hour),
		"filestore file keep time after last access. 0 to disable prune.")
	flag.DurationVar(
		&TempLife,
		"temp-life",
		getenv.Duration("CSHEET_TEMP_LIFE", time.Hour),
		"filestore temp keep time after last access. 0 to disable prune.")
	flag.StringVar(
		&FolderInclude,
		"folder-include",
		getenv.String("CSHEET_FOLDER_INCLUDE", "*"),
		"folder include list, separate by comma. '*' means as folder.")
	flag.StringVar(
		&FolderExclude,
		"folder-exclude",
		getenv.String("CSHEET_FOLDER_EXCLUDE", ""),
		"folder exclude list, separate by comma.")
	flag.IntVar(
		&CGTeamworkMaxTaskPerCollect,
		"cgteamwork-max-task-per-collect",
		getenv.Int("CSHEET_CGTEAMWORK_MAX_TASK_PER_COLLECT", 1000),
		"cgteamwork task limit per collect")
	flag.StringVar(
		&CGTeamworkPipelineOverwrite,
		"cgteamwork-pipeline-overwrite",
		getenv.String("CSHEET_CGTEAMWORK_PIPELINE_OVERWRITE", "{}"),
		"replace cgteamwork collect with other pipelines. json `Record<string, []string>` format")
	flag.StringVar(
		&SentryDSN,
		"sentry-dsn",
		getenv.String("CSHEET_SERVER_SENTRY_DSN", ""),
		"server sentry dsn")
}
