package config

import (
	"strings"
	"time"

	"github.com/WuLiFang/csheet/v6/pkg/getenv"
	"github.com/WuLiFang/csheet/v6/pkg/job/transcode"
)

func newStringSet(v []string) (ret map[string]struct{}) {
	ret = make(map[string]struct{})
	for _, i := range v {
		ret[i] = struct{}{}
	}
	return
}

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
	Release                     = getenv.String("CSHEET_RELEASE", "")
	IssueTrackerURL             = getenv.String("CSHEET_ISSUE_TRACKER_URL", "https://github.com/WuLiFang/csheet/issues")
	WatchWorkers                = getenv.Int("CSHEET_WATCH_WORKERS", 8)
	TranscodeMaxWeight          = getenv.Int64("CSHEET_TRANSCODE_MAX_WEIGHT", transcode.MaxWeight)
	TranscodeImageThumbWeight   = getenv.Int64("CSHEET_TRANSCODE_IMAGE_THUMB_WEIGHT", transcode.ImageThumbWeight)
	TranscodeImageRegularWeight = getenv.Int64("CSHEET_TRANSCODE_IMAGE_REGULAR_WEIGHT", transcode.ImageRegularWeight)
	TranscodeVideoRegularWeight = getenv.Int64("CSHEET_TRANSCODE_VIDEO_REGULAR_WEIGHT", transcode.VideoRegularWeight)
	CORSHosts                   = strings.Split(getenv.String("CSHEET_CORS_HOSTS", ""), ",")
	AdminToken                  = getenv.String("CSHEET_ADMIN_TOKEN", "")
	DisableWebP                 = getenv.Bool("CSHEET_DISABLE_WEBP", false)
	APITracingEnabled           = getenv.Bool("CSHEET_API_TRACING_ENABLED", false)
	UseXForwardedFor            = getenv.Bool("USE_X_FORWARDED_FOR", false)
)
