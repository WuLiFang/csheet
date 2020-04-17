// Package getenv to get environment vairable with type and default.
package getenv

import (
	"os"
	"strconv"
	"time"
)

// String from env var, default value used when env var is empty.
func String(key string, d string) string {
	ret := os.Getenv(key)
	if ret == "" {
		return d
	}
	return ret
}

// Duration from env var, default value used when env var is empty or invalid.
func Duration(key string, d time.Duration) time.Duration {
	v := os.Getenv(key)
	if v == "" {
		return d
	}
	ret, err := time.ParseDuration(v)
	if err != nil {
		return d
	}
	return ret
}

// Int from env var, default value used when env var is empty or invalid.
func Int(key string, d int) int {
	v := os.Getenv(key)
	if v == "" {
		return d
	}
	ret, err := strconv.Atoi(v)
	if err != nil {
		return d
	}
	return ret
}
