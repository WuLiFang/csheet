package config

import (
	"os"

	"github.com/WuLiFang/csheet/v6/pkg/collector/cgteamwork"
	"github.com/WuLiFang/csheet/v6/pkg/collector/folder"
	"github.com/WuLiFang/csheet/v6/pkg/filestore"
	"github.com/WuLiFang/csheet/v6/pkg/job/filewatch"
	"github.com/WuLiFang/csheet/v6/pkg/logging"
	"github.com/getsentry/sentry-go"
	"github.com/tidwall/gjson"
)

// Load config, panic on error.
func Load() {
	logging.Env = Env
	var logger = logging.GetLogger("config")
	if Env == "production" && FolderInclude == "*" {
		logger.Warn("allowing user scan any folder on host," +
			"use CSHEET_FOLDER_INCLUDE to limit allowed folder.")
	}

	os.MkdirAll(Storage, 0x600)
	filestore.Dir = Storage + "/files"
	filestore.TempDir = Storage + "/temp"

	filewatch.Manager.SetRateLimit(WatchRate)

	folder.WalkInclude = folder.ParseWalkRule(FolderInclude)
	folder.WalkExclude = folder.ParseWalkRule(FolderExclude)

	if SentryDSN != "" {
		err := sentry.Init(sentry.ClientOptions{
			Dsn:         SentryDSN,
			Environment: Env,
			Release:     Release,
		})
		if err != nil {
			logger.Error("sentry initialization failed", "error", err)
		}
	}

	cgteamwork.MaxTaskPerCollect = CGTeamworkMaxTaskPerCollect
	if gjson.Valid(CGTeamworkPipelineOverwrite) {
		cgteamwork.PipelineOverwrite = gjson.Parse(CGTeamworkPipelineOverwrite)
	} else {
		logger.Warn("ignore invalid CSHEET_CGTEAMWORK_PIPELINE_OVERWRITE")
	}
}
