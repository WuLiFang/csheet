package filewatch

import (
	"context"
	"sync"
	"time"

	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/WuLiFang/csheet/v6/pkg/model/file"
	"github.com/WuLiFang/csheet/v6/pkg/model/presentation"
	"github.com/WuLiFang/csheet/v6/pkg/onceflight"
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
					if err != nil {
						logger.Error("error during find presentation by id", "error", err)
						continue
					}
					err = m.rate.Wait(context.Background())
					if err != nil {
						logger.DPanicw("error during watch rate limit", "error", err)
					}
					if p.Raw == "" {
						continue
					}
					f, err := file.FindByPath(p.Raw)
					if err != nil {
						if err != db.ErrKeyNotFound {
							logger.Error("error during find file by path", "error", err)
						}
						continue
					}
					j <- f
					jobCount++
				}
				logger.Infow("file watch loop completed",
					"count", jobCount,
					"elapsed", time.Since(startTime),
				)
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
		go w.Start()
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
