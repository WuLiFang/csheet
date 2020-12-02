package transcode

import (
	"os/exec"
	"strings"

	"github.com/WuLiFang/csheet/v6/pkg/transcode"
)

// DisableWebP format, use png or jpg instead.
var DisableWebP = false

func extByPixelFormat(v string) string {
	if !DisableWebP {
		return ".webp"
	}
	if v == "rgba" {
		return ".png"
	}
	return ".jpg"
}

func transcodeImage(src, dst string, o *transcode.ImageOptions) *exec.Cmd {
	if strings.HasSuffix(dst, ".webp") {
		return transcode.WebP(src, dst, o)
	}
	if strings.HasSuffix(dst, ".png") {
		return transcode.PNG(src, dst, o)
	}
	return transcode.JPG(src, dst, o)
}
