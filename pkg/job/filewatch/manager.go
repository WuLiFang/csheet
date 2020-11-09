package filewatch

import (
	"context"
	"sync"
	"time"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/WuLiFang/csheet/v6/pkg/model/file"
	"github.com/WuLiFang/csheet/v6/pkg/model/presentation"
	"github.com/WuLiFang/csheet/v6/pkg/onceflight"
	"go.uber.org/zap"
	"golang.org/x/time/rate"
)

type manager struct {
	workers []worker
	job     chan file.File
	startMu sync.Once
	stop    chan bool
	rate    *rate.Limiter
	flight  *onceflight.Group
}

func newManager() *manager {
	return &manager{
		job:    make(chan file.File),
		rate:   rate.NewLimiter(10, 1),
		flight: &onceflight.Group{},
	}
}

func (m *manager) SetRateLimit(r int) {
	m.rate = rate.NewLimiter(rate.Limit(r), 1)
}

func (m *manager) Start() {
	var logger = logging.Logger("job.filewatch")
	m.startMu.Do(func() {
		m.stop = make(chan bool)
		go func(j chan<- file.File, cancel <-chan bool) {
			var isCanceld bool
			var ticker = time.NewTicker(5 * time.Second)
			defer ticker.Stop()
			for !isCanceld {
				jobCount := 0
				startTime := <-ticker.C
				for k, v := range presentation.ViewerCounter.Snapshot() {
					if v == 0 {
						continue
					}
					p, err := presentation.FindByID(k)
					if err == db.ErrKeyNotFound {
						// is ok to have non existed key
						err = nil
						continue
					}
					if err != nil {
						logger.Error("find presentation by id failed", zap.Error(err), zap.String("id", k))
						continue
					}
					err = m.rate.Wait(context.Background())
					if err != nil {
						logger.DPanic("watch rate limit failed", zap.Error(err))
					}
					if p.Raw == "" {
						continue
					}
					f, err := file.FindByPath(p.Raw)
					if err != nil {
						if err != db.ErrKeyNotFound {
							logger.Error("find file by path failed", zap.Error(err))
						}
						continue
					}
					j <- f
					jobCount++
				}
				if jobCount > 0 {
					logger.Info("scan",
						zap.Int("count", jobCount),
						zap.Duration("elapsed", time.Since(startTime)),
					)
				} else {
					logger.Debug("scan",
						zap.Int("count", jobCount),
						zap.Duration("elapsed", time.Since(startTime)),
					)
				}
			}
		}(m.job, m.stop)
	})
}

func (m *manager) Stop() {
	m.stop <- true
	m.startMu = sync.Once{}
}

func (m *manager) Scale(n int) (change int) {
	m.Start()
	// Add workers
	for len(m.workers) < n {
		w := m.newWorker()
		m.workers = append(m.workers, w)
		go w.Start(context.Background())
		change++
	}
	// Remove workers
	for len(m.workers) > n {
		index := len(m.workers) - 1
		w := m.workers[index]
		w.Stop()
		m.workers = m.workers[:index-1]
		change--
	}

	return
}

// Manager manage file watch.
var Manager = newManager()
