package transcode

import (
	"fmt"
	"os/exec"
	"strconv"
	"time"
)

// VideoOptions to configure transcode
type VideoOptions struct {
	Width         int
	Height        int
	DurationLimit time.Duration
	// SizeLimit bytes
	SizeLimit int
}

func (o VideoOptions) outputOptions() (ret []string) {
	if o.DurationLimit > 0 {
		ret = append(ret, "-t")
		ret = append(ret,
			strconv.FormatFloat(o.DurationLimit.Seconds(), 'f', 10, 64))
	}
	if o.SizeLimit > 0 {
		ret = append(ret, "-fs")
		ret = append(ret, strconv.Itoa(o.SizeLimit))
	}
	if o.Width != 0 || o.Height != 0 {
		// h264 require width and height to be multiply of 2.
		var w, h = `-2`, `-2`
		if o.Width > 0 {
			w = strconv.Itoa(o.Width - o.Width%2)
		}
		if o.Height > 0 {
			h = strconv.Itoa(o.Height - o.Height%2)
		}
		ret = append(ret, "-vf")
		ret = append(ret, fmt.Sprintf("scale=%s:min(trunc(ih/2)*2\\,%s):flags=lanczos", w, h))
	}
	return
}

// MP4 command to trancode src to dst.
func MP4(src string, dst string, o *VideoOptions) *exec.Cmd {
	var args = ffmpegOptions()
	args = append(args, "-i", src)
	if o != nil {
		args = append(args, o.outputOptions()...)
	}
	args = append(args,
		"-movflags", "faststart",
		"-vcodec", "libx264",
		"-preset", "medium",
		"-tune", "fastdecode",
		"-crf", "18",
		"-pix_fmt", "yuv420p",
		"-f", "mp4",
		dst,
	)

	c := exec.Command(ffmpeg, args...)
	return c
}
