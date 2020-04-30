package transcode

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
	workers    map[jobType][]worker
	jobs       map[jobType]chan presentation.Presentation
	startMu    sync.Once
	stopSignal signal
	flight     *onceflight.Group
}

func newManager() *manager {
	ret := &manager{
		jobs:    map[jobType]chan presentation.Presentation{},
		workers: map[jobType][]worker{},
		flight:  &onceflight.Group{},
	}
	return ret
}

func (m *manager) discoverJobByTag(
	p presentation.Presentation,
	rawTag, errorTag, successTag, outputFile string,
	jt jobType,
) bool {
	var outdated = errorTag != rawTag &&
		successTag != rawTag
	if outdated {
		select {
		case m.jobs[jt] <- p:
			logger.Infow("scheduled transcode", "jobType", jt, "raw", p.Raw)
		default:
		}
	} else {
	}
	return outdated
}

func max(a, b float64) float64 {
	if a > b {
		return a
	}
	return b
}
func min(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
}

func (m *manager) discoverJob(p presentation.Presentation, rawTag string) (err error) {
	var outdated = false
	outdated = m.discoverJobByTag(
		p,
		rawTag, p.RegularErrorTag, p.RegularSuccessTag,
		p.Regular, regularJobType(p.Type)) || outdated
	outdated = m.discoverJobByTag(
		p,
		rawTag, p.ThumbErrorTag, p.ThumbSuccessTag,
		p.Thumb, thumbJobType(p.Type)) || outdated
	if outdated {
		err = db.Set(db.IndexPresentationOutdated.Key(p.ID()), nil)
	} else {
		err = db.Delete(db.IndexPresentationOutdated.Key(p.ID()))
	}
	return
}

func iterateAllPresentation(fn func(p presentation.Presentation) error) error {
	return db.View(func(txn *db.Txn) (err error) {
		opts := db.DefaultIteratorOptions
		opts.PrefetchValues = false
		it := txn.NewIterator(opts)
		defer it.Close()
		prefix := db.IndexPresentation.Bytes()
		for it.Seek(prefix); it.ValidForPrefix(prefix); it.Next() {
			var v presentation.Presentation
			var k = it.Item().Key()
			err = db.Get(k, &v)
			if err != nil {
				return
			}
			err = fn(v)
			if err != nil {
				return
			}
		}
		return
	})
}

func iterateOutdatedPresentation(fn func(p presentation.Presentation) error) error {
	return db.View(func(txn *db.Txn) (err error) {
		opts := db.DefaultIteratorOptions
		opts.PrefetchValues = false
		it := txn.NewIterator(opts)
		defer it.Close()
		prefix := db.IndexPresentationOutdated.Bytes()
		for it.Seek(prefix); it.ValidForPrefix(prefix); it.Next() {
			var id string
			_, err = db.UnmarshalKey(it.Item().Key(), &id)
			if err != nil {
				return
			}
			var v presentation.Presentation
			v, err = presentation.FindByID(id)
			if err != nil {
				return
			}
			err = fn(v)
			if err != nil {
				return
			}
		}
		return
	})
}

func iteratePresentation(fn func(p presentation.Presentation) error, allowFullScan bool) error {
	ok, err := db.IndexPresentationOutdated.Exists()
	if err != nil {
		return err
	}
	if ok || !allowFullScan {
		return iterateOutdatedPresentation(fn)
	}
	return iterateAllPresentation(fn)
}

func (m *manager) Start() {
	m.startMu.Do(func() {

		go func() {
			cancel := make(chan struct{}, 1)
			m.stopSignal.Notify(cancel)
			defer m.stopSignal.Stop(cancel)
			var isCanceled bool
			var allowFullScan = true
			var rl = rate.NewLimiter(rate.Inf, 1)
			for !isCanceled {
				jobCount := 0
				startTime := time.Now()
				rl.Wait(context.Background())
				err := iteratePresentation(func(v presentation.Presentation) (err error) {
					select {
					case <-cancel:
						isCanceled = true
						return context.Canceled
					default:
					}
					err = rl.Wait(context.Background())
					if err != nil {
						logger.DPanic("wait rate limit fail", "error", err)
						return
					}
					jobCount++
					var raw file.File
					raw, err = file.FindByPath(v.Raw)
					if err == db.ErrKeyNotFound {
						return nil
					}
					if err != nil {
						return
					}
					rawTag := raw.Tag()
					return m.discoverJob(v, rawTag)
				}, allowFullScan)
				if err != nil {
					logger.Errorw("presentation scan failed", "error", err)
				} else {
					allowFullScan = false
					rl.SetLimit(rate.Limit(min(max(float64(jobCount/5), 0.2), 100)))
					logger.Infow("presentation scan completed",
						"count", jobCount,
						"elapsed", time.Since(startTime))
				}

			}
		}()
		go func() {
			c := make(chan presentation.Presentation)
			presentation.SignalUpdated.Notify(c)
			defer presentation.SignalUpdated.Stop(c)
			cancel := make(chan struct{}, 1)
			m.stopSignal.Notify(cancel)
			defer m.stopSignal.Stop(cancel)
			for {
				select {
				case <-cancel:
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
	m.stopSignal.Emit(struct{}{})
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
