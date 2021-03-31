package main

import (
	"log"
	"time"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/internal/config"
	"github.com/WuLiFang/csheet/v6/internal/healthcheck"
	"github.com/WuLiFang/csheet/v6/internal/router"
	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/WuLiFang/csheet/v6/pkg/filestore"
	"github.com/WuLiFang/csheet/v6/pkg/job/filewatch"
	"github.com/WuLiFang/csheet/v6/pkg/job/transcode"
	_ "github.com/WuLiFang/csheet/v6/pkg/mime"
	"github.com/getsentry/sentry-go"
)

func main() {
	defer logging.Sync()

	config.ParseFlag()
	config.Load()

	var err error

	err = db.Open(config.DataPath + "/db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	db.EnableGC(5 * time.Minute)

	go func() {
		var ticker = time.NewTicker(24 * time.Hour)
		for {
			healthcheck.CollectionOriginIndex()
			healthcheck.CollectionTagIndex()
			healthcheck.PresentationHashIndex()
			if config.FileLife > 0 {
				filestore.Prune(filestore.Dir, time.Now().Add(-config.FileLife))
			}
			if config.TempLife > 0 {
				filestore.Prune(filestore.TempDir, time.Now().Add(-config.TempLife))
			}
			<-ticker.C
		}
	}()

	filewatch.Manager.Scale(config.WatchWorkers)

	transcode.Scheduler.Start()

	sentry.CaptureMessage("server started")
	r := router.New()
	err = r.Run(config.Address)
	if err != nil {
		log.Fatal(err)
	}
}
