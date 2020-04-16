package transcode

import "os/exec"

var ffmpeg = "ffmpeg"

func ffmpegOptions() []string {
	return []string{"-y", "-hide_banner"}
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
