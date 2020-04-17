package main

import (
	"errors"
	"flag"
	"log"
	"os"
	"runtime"
	"strconv"
	"time"

	"github.com/WuLiFang/csheet/internal/config"
	"github.com/WuLiFang/csheet/internal/router"
	"github.com/WuLiFang/csheet/pkg/collector/folder"
	"github.com/WuLiFang/csheet/pkg/db"
	"github.com/WuLiFang/csheet/pkg/filestore"
	"github.com/WuLiFang/csheet/pkg/job/filewatch"
	"github.com/WuLiFang/csheet/pkg/job/transcode"
	"github.com/WuLiFang/csheet/pkg/logging"
	_ "github.com/WuLiFang/csheet/pkg/mime"
)

var logger = logging.Root().Sugar()

func getenv(key string, d string) string {
	ret := os.Getenv(key)
	if ret == "" {
		return d
	}
	return ret
}
func getenvInt(key string, d int) int {
	v := os.Getenv(key)
	if v == "" {
		return d
	}
	ret, err := strconv.Atoi(v)
	if err != nil {
		logger.Error("invalid environment vairable, will use default",
			"name", key,
			"default", d,
			"error", err)
		return d
	}
	return ret
}
func setupFolderCollector() (err error) {
	v := os.Getenv("CSHEET_FOLDER_INCLUDE")
	if v == "" && os.Getenv("CSHEET_ENV") != "production" {
		v = "*"
	}
	folder.WalkInclude, err = folder.ParseWalkRule(v)
	if err != nil {
		return err
	}
	folder.WalkExclude, err = folder.ParseWalkRule(os.Getenv("CSHEET_FOLDER_EXCLUDE"))
	return
}
func main() {
	defer logging.Root().Sync()

	address := flag.String("address", getenv("CSHEET_ADDRESS", "0.0.0.0:80"), "Bind address")
	storage := flag.String("storage", getenv("CSHEET_STORAGE", "storage"), "Data storage path")
	watchRate := flag.Int("watch-rate", getenvInt("CSHEET_WATCH_RATE", 50), "watch file stats per seconds")
	flag.Parse()

	var err error

	os.MkdirAll(*storage, 0x600)
	filestore.Dir = *storage + "/files"
	filestore.TempDir = *storage + "/temp"

	fileLife, err := time.ParseDuration(getenv("CSHEET_FILE_LIFE", "240h"))
	if fileLife < 0 {
		err = errors.New("file life can not be negative")
	}
	if err != nil {
		log.Fatal(err)
	}
	tempLife, err := time.ParseDuration(getenv("CSHEET_TEMP_LIFE", "1h"))
	if err != nil {
		log.Fatal(err)
	}
	if tempLife < 0 {
		err = errors.New("temp life can not be negative")
	}
	config.LoadEnv()
	go func() {
		var ticker = time.NewTicker(time.Hour)
		for {
			filestore.Prune(filestore.Dir, time.Now().Add(-fileLife))
			filestore.Prune(filestore.TempDir, time.Now().Add(-tempLife))
			<-ticker.C
		}
	}()

	err = db.Open(*storage + "/db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	db.EnableGC(5 * time.Minute)

	filewatch.Manager.SetRateLimit(*watchRate)
	filewatch.Manager.Scale(8)

	transcode.Manager.Scale(transcode.JobTypeImageThumb, runtime.NumCPU())
	transcode.Manager.Scale(transcode.JobTypeImageRegular, 1)
	transcode.Manager.Scale(transcode.JobTypeVideoRegular, 1)

	err = setupFolderCollector()
	if err != nil {
		logger.Panicw("error during setup folder collector", "error", err)
	}

	r := router.New()
	err = r.Run(*address)
	if err != nil {
		log.Fatal(err)
	}

}
