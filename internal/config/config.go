package config

import (
	"os"
	"strings"
	"time"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
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
// TODO: change default data path to `data` and drop old config support, this will be a breaking change
var (
	Env                         = getenv.String("CSHEET_ENV", "development")
	Address                     = getenv.String("CSHEET_ADDRESS", "0.0.0.0:80")
	DataPath                    = getenv.StringCoalesce([]string{"CSHEET_DATA_PATH", "CSHEET_STORAGE"}, "storage")
	WatchRate                   = getenv.Int("CSHEET_WATCH_RATE", 50)
	FileLife                    = getenv.Duration("CSHEET_FILE_LIFE", 240*time.Hour)
	TempLife                    = getenv.Duration("CSHEET_TEMP_LIFE", time.Hour)
	CollectIgnore               = getenv.String("CSHEET_COLLECT_IGNORE", "")
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
	ArchiveCollectionLimit      = getenv.Int("CSHEET_ARCHIVE_COLLECTION_LIMIT", 1000)
	UseXForwardedFor            = getenv.Bool("USE_X_FORWARDED_FOR", false)
)

func init() {
	logger := logging.Logger("config")
	if v := os.Getenv("CSHEET_WEB_SENTRY_DSN"); v != "" {
		if os.Getenv("CSHEET_CLIENT_SENTRY_DSN") == "" {
			logger.Warn("CSHEET_WEB_SENTRY_DSN is depreacted, use CSHEET_CLIENT_SENTRY_DSN instead")
			os.Setenv("CSHEET_CLIENT_SENTRY_DSN", v)
		} else {
			logger.Warn("ignore CSHEET_WEB_SENTRY_DSN when CSHEET_CLIENT_SENTRY_DSN set")
		}
	}
	if v := os.Getenv("CSHEET_STORAGE"); v != "" {
		logger.Warn("CSHEET_STORAGE is depreacted, use CSHEET_DATA_PATH instead")
	}
}
