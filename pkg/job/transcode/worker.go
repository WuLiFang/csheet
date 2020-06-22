package transcode

import (
	"strconv"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
)

type worker struct {
	manager *manager
	jobType jobType
	stop    chan struct{}
}

func (w worker) Stop() {
	w.stop <- struct{}{}
}

func (w worker) Start() {
	var logger = logging.Logger("job.transcode").Sugar()
	for {
		select {
		case <-w.stop:
			return
		case j := <-w.manager.jobs[w.jobType]:
			w.manager.flight.Do(strconv.Itoa(int(w.jobType))+":"+j.Raw, func() {
				err := w.jobType.Run(j)
				if err != nil {
					logger.Errorw(
						"transcode error",
						"error", err,
						"presentation", j,
						"type", w.jobType,
					)
				}
			})

		}
	}
}
