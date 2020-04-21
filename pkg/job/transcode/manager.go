package transcode

import (
	"context"
	"sync"
	"time"

	"github.com/WuLiFang/csheet/pkg/db"
	"github.com/WuLiFang/csheet/pkg/model/file"
	"github.com/WuLiFang/csheet/pkg/model/presentation"
	"github.com/WuLiFang/csheet/pkg/onceflight"
	"golang.org/x/time/rate"
)

type manager struct {
	workers map[jobType][]worker
	jobs    map[jobType]chan presentation.Presentation
	startMu sync.Once
	stop    chan struct{}
	rate    *rate.Limiter
	flight  *onceflight.Group
}

func newManager() *manager {
	ret := &manager{
		jobs:    map[jobType]chan presentation.Presentation{},
		workers: map[jobType][]worker{},
		rate:    rate.NewLimiter(100, 1),
		flight:  &onceflight.Group{},
	}
	return ret
}

func (m *manager) discoverJobByTag(
	p presentation.Presentation,
	rawTag, errorTag, successTag, outputFile string,
	jt jobType,
) {
	if errorTag != rawTag &&
		successTag != rawTag {
		select {
		case m.jobs[jt] <- p:
			logger.Infow("scheduled transcode", "jobType", jt, "raw", p.Raw)
		default:
		}
	} else {
	}
}

func (m *manager) discoverJob(p presentation.Presentation, rawTag string) {
	m.discoverJobByTag(
		p,
		rawTag, p.RegularErrorTag, p.RegularSuccessTag,
		p.Regular, regularJobType(p.Type))
	m.discoverJobByTag(
		p,
		rawTag, p.ThumbErrorTag, p.ThumbSuccessTag,
		p.Thumb, thumbJobType(p.Type))
}

func (m *manager) Start() {
	m.startMu.Do(func() {
		m.stop = make(chan struct{})
		go func() {
			var isCanceled bool
			for !isCanceled {
				jobCount := 0
				startTime := time.Now()
				m.rate.Wait(context.Background())
				err := db.View(func(txn *db.Txn) (err error) {
					opts := db.DefaultIteratorOptions
					opts.PrefetchValues = false
					it := txn.NewIterator(opts)
					defer it.Close()
					prefix := db.IndexPresentation.Bytes()
					for it.Seek(prefix); it.ValidForPrefix(prefix); it.Next() {
						select {
						case <-m.stop:
							isCanceled = true
							return
						default:
							err = m.rate.Wait(context.Background())
							if err != nil {
								logger.DPanic("wait rate limit fail", "error", err)
								return
							}
							var v presentation.Presentation
							err = db.Get(it.Item().Key(), &v)
							if err != nil {
								return
							}
							jobCount++
							var raw file.File
							raw, err = file.FindByPath(v.Raw)
							if err == db.ErrKeyNotFound {
								continue
							}
							if err != nil {
								return
							}
							rawTag := raw.Tag()
							m.discoverJob(v, rawTag)
						}
					}
					return
				})
				if err != nil {
					logger.Errorw("presentation scan failed", "error", err)
				} else {
					logger.Infow("presentation scan completed",
						"count", jobCount,
						"elapsed", time.Since(startTime),
					)
				}
			}
		}()
		go func() {
			c := make(chan presentation.Presentation)
			presentation.SignalUpdated.Notify(c)
			defer presentation.SignalUpdated.Stop(c)
			for {
				select {
				case <-m.stop:
					return
				case p := <-c:
					f, err := file.FindByPath(p.Raw)
					if err == db.ErrKeyNotFound {
						continue
					}
					if err != nil {
						logger.Error("db find error", "error", err)
						continue
					}
					m.discoverJob(p, f.Tag())
				}
			}
		}()
	})
}

func (m *manager) Stop() {
	m.stop <- struct{}{}
	m.startMu = sync.Once{}
}

func (m *manager) newWorker(jobType jobType) worker {
	return worker{
		jobType: jobType,
		stop:    make(chan struct{}),
		manager: m,
	}
}

func (m *manager) Scale(jobType jobType, n int) (change int) {
	if m.workers[jobType] == nil {
		m.workers[jobType] = make([]worker, 0, 8)
	}
	if m.jobs[jobType] == nil {
		m.jobs[jobType] = make(chan presentation.Presentation)
	}
	workers := m.workers[jobType]
	m.Start()
	// Add workers
	for len(workers) < n {
		w := m.newWorker(jobType)
		workers = append(workers, w)
		go w.Start()
		change++
	}
	// Remove workers
	for len(m.workers[jobType]) > n {
		index := len(m.workers) - 1
		w := workers[index]
		w.Stop()
		workers = workers[:index-1]
		change--
	}
	m.workers[jobType] = workers
	return
}

// Manager manage transcode.
var Manager = newManager()
