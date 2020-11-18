package transcode

import (
	"os/exec"
	"strings"

	"github.com/WuLiFang/csheet/v6/pkg/transcode"
)

func extByPixelFormat(v string) string {
	if v == "rgba" {
		return ".png"
	}
	return ".jpg"
}

func transcodeImage(src, dst string, o *transcode.ImageOptions) *exec.Cmd {
	if strings.HasSuffix(dst, ".png") {
		return transcode.PNG(src, dst, o)
	}
	return transcode.JPG(src, dst, o)
}
