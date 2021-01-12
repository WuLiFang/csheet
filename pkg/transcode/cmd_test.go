package transcode

import (
	"errors"
	"os/exec"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestFFMPEG(t *testing.T) {
	cmd := exec.Command(ffmpeg, "-version")
	data, err := cmd.CombinedOutput()
	if errors.Is(err, exec.ErrNotFound) {
		t.Skip()
	}
	require.NoError(t, err)
	assert.Regexp(t, `^ffmpeg version \d`, string(data))
}
func TestFFProbe(t *testing.T) {
	cmd := exec.Command(ffprobe, "-version")
	data, err := cmd.CombinedOutput()
	if errors.Is(err, exec.ErrNotFound) {
		t.Skip()
	}
	require.NoError(t, err)
	assert.Regexp(t, `^ffprobe version \d`, string(data))
}

func TestNiceFFMPEG(t *testing.T) {
	cmd := exec.Command(ffmpeg, "-version")
	niceCommand(cmd, 19)
	data, err := cmd.CombinedOutput()
	if errors.Is(err, exec.ErrNotFound) {
		t.Skip()
	}
	require.NoError(t, err)
	assert.Regexp(t, `^ffmpeg version \d`, string(data))
}
