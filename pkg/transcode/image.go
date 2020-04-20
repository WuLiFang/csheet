package transcode

import (
	"fmt"
	"os/exec"
	"strconv"
	"time"
)

// ImageOptions to configure transcode
type ImageOptions struct {
	Width      int
	Height     int
	TimeOffset time.Duration
}

func (o ImageOptions) inputOptions() (ret []string) {
	if o.TimeOffset != 0 {
		ret = append(ret, "-noaccurate_seek")
		ret = append(ret, "-ss",
			strconv.FormatFloat(o.TimeOffset.Seconds(), 'f', 10, 64))
	}
	return
}

func (o ImageOptions) outputOptions() (ret []string) {
	if o.Width != 0 || o.Height != 0 {
		var w, h = `-1`, `-1`
		if o.Width > 0 {
			w = strconv.Itoa(o.Width - o.Width%2)
		}
		if o.Height > 0 {
			h = strconv.Itoa(o.Height - o.Height%2)
		}
		ret = append(ret, "-vf")
		ret = append(ret, fmt.Sprintf("scale=%s:min(ih\\,%s):flags=lanczos", w, h))
	}
	ret = append(ret, "-q:v", "1")
	ret = append(ret, "-frames:v", "1")
	return
}

// JPG command to trancode src to dst as jpg.
func JPG(src string, dst string, o *ImageOptions) *exec.Cmd {
	var args = ffmpegOptions()
	if o != nil {
		args = append(args, o.inputOptions()...)
	}
	args = append(args, "-i", src)
	if o != nil {
		args = append(args, o.outputOptions()...)
	}
	args = append(args,
		"-codec:v", "mjpeg",
		"-f", "singlejpeg",
		dst,
	)

	c := exec.Command(ffmpeg, args...)
	return c
}

// PNG command to trancode src to dst as png.
func PNG(src string, dst string, o *ImageOptions) *exec.Cmd {
	var args = ffmpegOptions()
	if o != nil {
		args = append(args, o.inputOptions()...)
	}
	args = append(args, "-i", src)
	if o != nil {
		args = append(args, o.outputOptions()...)
	}
	args = append(args,
		"-codec:v", "png",
		"-f", "image2",
		dst,
	)

	c := exec.Command(ffmpeg, args...)
	return c
}
