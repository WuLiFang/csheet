package transcode

import (
	"os/exec"
	"runtime"
	"strconv"
	"strings"
)

var ffmpeg = "ffmpeg"

func ffmpegOptions() []string {
	return []string{"-y", "-hide_banner", "-nostdin"}
}
func init() {
	v, _ := exec.LookPath("ffmpeg")
	if v != "" {
		ffmpeg = v
	}
}

var ffprobe = "ffprobe"

func init() {
	v, _ := exec.LookPath("ffprobe")
	if v != "" {
		ffprobe = v
	}
}

var nice, niceLookupErr = exec.LookPath("nice")

func niceCommand(c *exec.Cmd, n int) {
	if niceLookupErr != nil {
		return
	}
	args := c.Args[:]
	if runtime.GOOS == "windows" {
		// Escape args
		for index := range args {
			args[index] = strings.ReplaceAll(args[index], `\`, `\\`)
		}
	}
	c.Args = append([]string{nice, "-n", strconv.Itoa(n)}, args...)
	c.Path = nice
	return
}
