package filewatch

import (
	"context"
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

func (w worker) Run(ctx context.Context, j file.File) (err error) {
	return j.Stat(ctx)
}

func (w worker) Start(ctx context.Context) {
	for {
		select {
		case <-w.stop:
			return
		case j := <-w.manager.job:
			w.manager.flight.Do(j.Path, func() {
				var logger = logging.Logger("job.filewatch").Sugar()
				err := w.Run(ctx, j)
				if os.IsNotExist(err) {
					logger.Infow("detected file remove", "path", j.Path)
					err = j.Delete(ctx)
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
