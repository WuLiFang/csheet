package config

import (
	"os"
	"strconv"

	"github.com/WuLiFang/csheet/pkg/collector/cgteamwork"
)

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

// LoadEnv load config from env
func LoadEnv() {
	cgteamwork.CollectTaskLimit = getenvInt("CSHEET_CGTEAMWORK_COLLECT_TASK_LIMIT", 1000)
}
