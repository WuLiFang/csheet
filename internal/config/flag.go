package config

import (
	"flag"
	"os"
)

// ParseFlag from command line
func ParseFlag() {
	var fs = flag.NewFlagSet("main", flag.ExitOnError)
	fs.StringVar(
		&Env,
		"env",
		Env,
		"production or development")
	fs.StringVar(
		&Address,
		"address",
		Address,
		"bind address")
	fs.StringVar(
		&Storage,
		"storage",
		Storage,
		"data storage path")
	fs.IntVar(
		&WatchRate,
		"watch-rate",
		WatchRate,
		"watch file stats per seconds")
	fs.DurationVar(
		&FileLife,
		"file-life",
		FileLife,
		"filestore file keep time after last access. 0 to disable prune.")
	fs.DurationVar(
		&TempLife,
		"temp-life",
		TempLife,
		"filestore temp keep time after last access. 0 to disable prune.")
	fs.StringVar(
		&FolderInclude,
		"folder-include",
		FolderInclude,
		"folder include list, separate by comma. '*' means as folder.")
	fs.StringVar(
		&FolderExclude,
		"folder-exclude",
		FolderExclude,
		"folder exclude list, separate by comma.")
	fs.IntVar(
		&CGTeamworkMaxTaskPerCollect,
		"cgteamwork-max-task-per-collect",
		CGTeamworkMaxTaskPerCollect,
		"cgteamwork task limit per collect")
	fs.StringVar(
		&CGTeamworkPipelineOverwrite,
		"cgteamwork-pipeline-overwrite",
		CGTeamworkPipelineOverwrite,
		"replace cgteamwork collect with other pipelines. json `Record<string, []string>` format")
	fs.StringVar(
		&SentryDSN,
		"sentry-dsn",
		SentryDSN,
		"server sentry dsn")
	fs.StringVar(
		&Release,
		"release",
		SentryDSN,
		"release version for sentry")
	fs.Parse(os.Args[1:])
}
