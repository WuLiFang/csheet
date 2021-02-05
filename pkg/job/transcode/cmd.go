package transcode

import (
	"bytes"
	"errors"
	"os/exec"
	"time"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/models/presentation"
)

func getMiddleFrameTimeOffset(p presentation.Presentation) (time.Duration, error) {
	switch p.Type {
	case presentation.TypeImage:
	case presentation.TypeVideo:
		if p.Metadata == nil {
			return 0, errors.New("getMiddleFrameTimeOffset: should probe first")
		}
		duration, _ := time.ParseDuration(p.Metadata["duration"] + "s")
		return duration / 2, nil
	default:
		logging.Logger("job.transcode.cmd").Sugar().
			DPanic("unsupported type", "p", p)
	}
	return 0, nil
}

func runCommand(cmd *exec.Cmd) (err error) {
	var logger = logging.Logger("job.transcode.cmd").Sugar()
	logger.Debugw("run", "args", cmd.Args)
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
