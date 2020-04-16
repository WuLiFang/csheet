package db

import (
	"encoding/binary"
	"encoding/hex"
	"time"
)

// TimeStamp convert time to key string
func TimeStamp(t time.Time) string {

	data := make([]byte, 8)
	binary.BigEndian.PutUint64(data, uint64(t.Unix()))
	return hex.EncodeToString(data)
}

// ParseTimeStamp convert key string to time
func ParseTimeStamp(v string) time.Time {
	data, _ := hex.DecodeString(v)
	return time.Unix(int64(binary.BigEndian.Uint64(data)), 0)
}
