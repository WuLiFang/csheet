package db

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestTimeStamp(t *testing.T) {
	v, err := time.Parse(time.RFC3339, "2020-04-10T18:00:00+08:00")
	require.NoError(t, err)
	result := TimeStamp(v)
	assert.Equal(t, []byte{0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x35, 0x65, 0x39, 0x30, 0x34, 0x33, 0x61, 0x30}, []byte(result))
}

func TestParseTimeStamp(t *testing.T) {
	v, err := time.Parse(time.RFC3339, "2020-04-10T18:00:00+08:00")
	require.NoError(t, err)
	result := ParseTimeStamp(string([]byte{0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x35, 0x65, 0x39, 0x30, 0x34, 0x33, 0x61, 0x30}))
	assert.Equal(t, v.Unix(), result.Unix())
}
