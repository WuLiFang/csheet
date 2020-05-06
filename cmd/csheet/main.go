package main

import (
	"flag"
	"log"
	"os"
	"runtime"
	"time"

	"github.com/WuLiFang/csheet/v6/internal/config"
	"github.com/WuLiFang/csheet/v6/internal/router"
	"github.com/WuLiFang/csheet/v6/pkg/collector/cgteamwork"
	"github.com/WuLiFang/csheet/v6/pkg/collector/folder"
	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/WuLiFang/csheet/v6/pkg/filestore"
	"github.com/WuLiFang/csheet/v6/pkg/job/filewatch"
	"github.com/WuLiFang/csheet/v6/pkg/job/transcode"
	_ "github.com/WuLiFang/csheet/v6/pkg/mime"
	"github.com/getsentry/sentry-go"
	"github.com/tidwall/gjson"
)

func main() {
	defer logger.Sync()
	flag.Parse()

	var err error

	os.MkdirAll(config.Storage, 0x600)
	filestore.Dir = config.Storage + "/files"
	filestore.TempDir = config.Storage + "/temp"
	go func() {
		var ticker = time.NewTicker(24 * time.Hour)
		for {
			if config.FileLife > 0 {
				filestore.Prune(filestore.Dir, time.Now().Add(-config.FileLife))
			}
			if config.TempLife > 0 {
				filestore.Prune(filestore.TempDir, time.Now().Add(-config.TempLife))
			}
			<-ticker.C
		}
	}()

	err = db.Open(config.Storage + "/db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	db.EnableGC(5 * time.Minute)

	filewatch.Manager.SetRateLimit(config.WatchRate)
	filewatch.Manager.Scale(8)

	transcode.Manager.Scale(transcode.JobTypeImageThumb, runtime.NumCPU())
	transcode.Manager.Scale(transcode.JobTypeImageRegular, 1)
	transcode.Manager.Scale(transcode.JobTypeVideoRegular, 1)

	if config.Env == "production" && config.FolderInclude == "*" {
		logger.Warn("allowing user scan any folder on host," +
			"use CSHEET_FOLDER_INCLUDE to limit allowed folder.")
	}

	folder.WalkInclude = folder.ParseWalkRule(config.FolderInclude)
	folder.WalkExclude = folder.ParseWalkRule(config.FolderExclude)

	cgteamwork.MaxTaskPerCollect = config.CGTeamworkMaxTaskPerCollect
	if gjson.Valid(config.CGTeamworkPipelineOverwrite) {
		cgteamwork.PipelineOverwrite = gjson.Parse(config.CGTeamworkPipelineOverwrite)
	} else {
		logger.Warn("ignore invalid CSHEET_CGTEAMWORK_OVERWRITE")
	}

	if config.SentryDSN != "" {
		err := sentry.Init(sentry.ClientOptions{
			Dsn:         config.SentryDSN,
			Environment: config.Env,
		})
		if err != nil {
			logger.Error("sentry initialization failed", "error", err)
		}
	}

	sentry.CaptureMessage("server started")
	r := router.New()
	err = r.Run(config.Address)
	if err != nil {
		log.Fatal(err)
	}

}
