package transcode

import (
	"context"
	"path"
	"sync"
	"time"

	"github.com/WuLiFang/csheet/pkg/filestore"
	"github.com/WuLiFang/csheet/pkg/model/file"
	"github.com/WuLiFang/csheet/pkg/model/presentation"
	"github.com/WuLiFang/csheet/pkg/onceflight"
	"golang.org/x/time/rate"
)

type manager struct {
	workers         map[jobType][]worker
	jobs            map[jobType]chan presentation.Presentation
	changeListeners []chan presentation.Presentation
	changed         chan presentation.Presentation
	startMu         sync.Once
	stop            chan struct{}
	rate            *rate.Limiter
	flight          *onceflight.Group
}

func newManager() *manager {
	ret := &manager{
		jobs:    map[jobType]chan presentation.Presentation{},
		workers: map[jobType][]worker{},
		changed: make(chan presentation.Presentation),
		rate:    rate.NewLimiter(100, 1),
		flight:  &onceflight.Group{},
	}
	return ret
}

func (m *manager) Start() {
	m.startMu.Do(func() {
		m.stop = make(chan struct{})
		go func() {
			var isCanceld bool
			for !isCanceld {
				m.rate.Wait(context.Background())
				presentation.Scan(func(v presentation.Presentation) bool {
					m.rate.Wait(context.Background())
					select {
					case <-m.stop:
						isCanceld = true
						return false
					default:
						raw, err := file.FindByPath(v.Raw)
						if err != nil {
							return true
						}
						rawTag := raw.Tag()
						if v.RegularErrorTag != rawTag &&
							(v.RegularSuccessTag != rawTag || !isExists(v.Regular)) {
							select {
							case m.jobs[regularJobType(v.Type)] <- v:
								logger.Debugw("scheduled regular transcode", "presentation", v)
							default:
							}
						} else {
							filestore.SetAccessTime(path.Join(filestore.Dir, v.Regular), time.Now())
						}
						if v.ThumbErrorTag != rawTag &&
							(v.ThumbSuccessTag != rawTag || !isExists(v.Thumb)) {
							select {
							case m.jobs[thumbJobType(v.Type)] <- v:
								logger.Debugw("scheduled thumb transcode", "presentation", v)
							default:
							}
						} else {
							filestore.SetAccessTime(path.Join(filestore.Dir, v.Thumb), time.Now())
						}
						return true
					}
				})

			}
		}()
		go func() {
			for i := range m.changed {
				logger.Infow("presentation changed", "file", i)
				for _, l := range m.changeListeners {
					l <- i
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
