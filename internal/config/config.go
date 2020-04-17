package config

import (
	"flag"
	"time"

	"github.com/WuLiFang/csheet/pkg/getenv"
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
	// CGTeamworkTaskLimit config
	CGTeamworkTaskLimit int
	// CGTeamworkPipelineOverwrite config
	CGTeamworkPipelineOverwrite string
)

func init() {
	env := flag.String(
		"env",
		getenv.String("CSHEET_ENV", "development"),
		"production or development")
	address := flag.String(
		"address",
		getenv.String("CSHEET_ADDRESS", "0.0.0.0:80"),
		"bind address")
	storage := flag.String(
		"storage",
		getenv.String("CSHEET_STORAGE", "storage"),
		"data storage path")
	watchRate := flag.Int(
		"watch-rate",
		getenv.Int("CSHEET_WATCH_RATE", 50),
		"watch file stats per seconds")
	fileLife := flag.Duration(
		"file-life",
		getenv.Duration("CSHEET_FILE_LIFE", 240*time.Hour),
		"filestore file keep time after last access. 0 to disable prune.")
	tempLife := flag.Duration(
		"temp-life",
		getenv.Duration("CSHEET_TEMP_LIFE", time.Hour),
		"filestore temp keep time after last access. 0 to disable prune.")
	folderInclude := flag.String(
		"folder-include",
		getenv.String("CSHEET_FOLDER_INCLUDE", "*"),
		"folder include list, separate by comma. '*' means as folder.")
	folderExclude := flag.String(
		"folder-exclude",
		getenv.String("CSHEET_FOLDER_EXCLUDE", ""),
		"folder exclude list, separate by comma.")
	cgteamworkTaskLimit := flag.Int(
		"cgteamwork-max-task-per-collect",
		getenv.Int("CSHEET_CGTEAMWORK_MAX_TASK_PER_COLLECT", 1000),
		"cgteamwork task limit per collect")
	cgteamworkPipelineOverwrite := flag.String(
		"cgteamwork-pipeline-overwrite",
		getenv.String("CSHEET_CGTEAMWORK_PIPELINE_OVERWRITE", "{}"),
		"replace cgteamwork collect with other pipelines. json `Record<string, []string>` format")
	flag.Parse()
	Env = *env
	Address = *address
	Storage = *storage
	WatchRate = *watchRate
	FileLife = *fileLife
	TempLife = *tempLife
	FolderInclude = *folderInclude
	FolderExclude = *folderExclude
	CGTeamworkTaskLimit = *cgteamworkTaskLimit
	CGTeamworkPipelineOverwrite = *cgteamworkPipelineOverwrite
}
