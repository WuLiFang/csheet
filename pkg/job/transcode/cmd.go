package transcode

import (
	"bytes"
	"errors"
	"os/exec"
	"time"

	"github.com/WuLiFang/csheet/pkg/model/presentation"
	"github.com/WuLiFang/csheet/pkg/transcode"
)

func getMiddleFrameTimeOffset(p presentation.Presentation) (time.Duration, error) {
	switch p.Type {
	case presentation.TypeImage:
	case presentation.TypeVideo:
		info, err := transcode.Probe(p.Raw)
		if err != nil {
			return 0, err
		}
		return info.Duration() / 2, nil
	default:
		logger.DPanic("unsupported type", "p", p)
	}
	return 0, nil
}

func runCommand(cmd *exec.Cmd) (err error) {
	logger.Debugw("run command", "args", cmd.Args)
	stderr := bytes.NewBuffer(nil)
	cmd.Stderr = stderr
	err = cmd.Run()
	if err != nil {
		if stderr.Len() > 0 {
			return errors.New(stderr.String())
		}
		return
	}
	return
}