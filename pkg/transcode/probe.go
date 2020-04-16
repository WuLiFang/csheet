package transcode

import (
	"bytes"
	"errors"
	"io/ioutil"
	"os/exec"
	"time"

	"github.com/tidwall/gjson"
)

// MediaInfo data
type MediaInfo struct {
	JSON gjson.Result
}

// Duration for this media.
func (m MediaInfo) Duration() time.Duration {
	return time.Duration(m.JSON.Get(`format.duration`).Float() * float64(time.Second))
}

// FrameRate for first video stream.
func (m MediaInfo) FrameRate() string {
	return m.JSON.Get(`streams.#(codec_type=="video").r_frame_rate`).String()
}

// FrameCount for first video stream.
func (m MediaInfo) FrameCount() int64 {
	return m.JSON.Get(`streams.#(codec_type="video").nb_frames`).Int()
}

// Probe file with ffprobe.
func Probe(filename string) (ret MediaInfo, err error) {
	var c = exec.Command(ffprobe, "-hide_banner",
		"-show_entries", "format:streams",
		"-print_format", "json",
		"-loglevel", "error",
		filename,
	)
	stdout := new(bytes.Buffer)
	stderr := new(bytes.Buffer)
	c.Stderr = stderr
	c.Stdout = stdout
	err = c.Run()
	if err != nil {
		return
	}

	if c.ProcessState.ExitCode() > 0 {
		var errMsg []byte
		errMsg, err = ioutil.ReadAll(stderr)
		if err != nil {
			return
		}
		err = errors.New(string(errMsg))
		return
	}
	data, err := ioutil.ReadAll(stdout)
	if err != nil {
		return
	}
	ret.JSON = gjson.ParseBytes(data)
	return
}
