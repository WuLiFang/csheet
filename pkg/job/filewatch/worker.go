package filewatch

import (
	"os"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/model/file"
)

type worker struct {
	stop    chan bool
	manager *manager
}

func (m *manager) newWorker() worker {
	return worker{
		stop:    make(chan bool),
		manager: m,
	}
}

func (w worker) Run(j file.File) (err error) {
	return j.Stat()
}

func (w worker) Start() {
	for {
		select {
		case <-w.stop:
			return
		case j := <-w.manager.job:
			w.manager.flight.Do(j.Path, func() {
				var logger = logging.Logger("job.filewatch").Sugar()
				err := w.Run(j)
				if os.IsNotExist(err) {
					logger.Infow("detected file remove", "path", j.Path)
					err = j.Delete()
				}
				if err != nil {
					logger.Errorw("worker error", "error", err, "file", j)
				}
			})

		}
	}
}

func (w worker) Stop() {
	w.stop <- true
}
