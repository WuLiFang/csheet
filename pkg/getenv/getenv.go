// Package getenv to get environment vairable with type and default.
package getenv

import (
	"os"
	"strconv"
	"strings"
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

// Int64 from env var, default value used when env var is empty or invalid.
func Int64(key string, d int64) int64 {
	v := os.Getenv(key)
	if v == "" {
		return d
	}
	ret, err := strconv.Atoi(v)
	if err != nil {
		return d
	}
	return int64(ret)
}

// Bool from env var, case insensitive match
// "true" and "1" to true,
// "false" and "0" to false,
// default value is used if value empty or not match.
func Bool(key string, d bool) bool {
	v := os.Getenv(key)
	v = strings.ToLower(v)
	if v == "1" ||
		(v) == "true" {
		return true
	}
	if v == "0" ||
		(v) == "false" {
		return false
	}
	return d
}

// StringCoalesce returns first non-empty environment value
func StringCoalesce(names []string, d string) string {
	for _, i := range names {
		v := os.Getenv(i)
		if v != "" {
			return v
		}
	}
	return d
}
