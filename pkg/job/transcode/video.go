package transcode

import (
	"os/exec"
	"strings"

	"github.com/WuLiFang/csheet/v6/pkg/transcode"
	"github.com/WuLiFang/csheet/v6/pkg/util"
)

func extByFrameRate(v string) string {
	// high fps mp4 not work in browser (chrome/firefox)
	if util.ParseFrameRate(v) > 120 {
		return ".webm"
	}
	return ".mp4"
}

func transcodeVideo(src, dst string, o *transcode.VideoOptions) *exec.Cmd {
	if strings.HasSuffix(dst, ".webm") {
		return transcode.WebM(src, dst, o)
	}
	return transcode.MP4(src, dst, o)
}
