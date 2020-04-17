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
) (err error) {
	if errorTag != rawTag &&
		(successTag != rawTag || !isExists(outputFile)) {
		select {
		case m.jobs[jt] <- p:
			logger.Debugw("scheduled transcode", "presentation", p)
		default:
		}
	} else {
		err = filestore.SetAccessTime(path.Join(filestore.Dir, p.Regular), time.Now())
	}
	return err
}

func (m *manager) discoverJob(p presentation.Presentation, rawTag string) (err error) {
	err = m.discoverJobByTag(
		p,
		rawTag, p.RegularErrorTag, p.RegularSuccessTag,
		p.Regular, regularJobType(p.Type))
	if err != nil {
		return
	}
	err = m.discoverJobByTag(
		p,
		rawTag, p.ThumbErrorTag, p.ThumbSuccessTag,
		p.Thumb, thumbJobType(p.Type))
	return
}

func (m *manager) Start() {
	m.startMu.Do(func() {
		m.stop = make(chan struct{})
		go func() {
			var isCanceld bool
			for !isCanceld {
				jobCount := 0
				startTime := time.Now()
				m.rate.Wait(context.Background())
				presentation.Scan(func(v presentation.Presentation) bool {
					m.rate.Wait(context.Background())
					select {
					case <-m.stop:
						isCanceld = true
						return false
					default:
						jobCount++
						raw, err := file.FindByPath(v.Raw)
						if err != nil {
							return true
						}
						rawTag := raw.Tag()
						m.discoverJob(v, rawTag)
						return true
					}
				})
				logger.Infow("presentation scan completed",
					"count", jobCount,
					"elapsed", time.Since(startTime),
				)
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
