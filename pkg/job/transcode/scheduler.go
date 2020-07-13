package transcode

import (
	"bytes"
	"context"
	"runtime"
	"strconv"
	"time"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/WuLiFang/csheet/v6/pkg/model/file"
	"github.com/WuLiFang/csheet/v6/pkg/model/presentation"
	"github.com/WuLiFang/csheet/v6/pkg/onceflight"
	"go.uber.org/zap"
	"golang.org/x/sync/semaphore"
)

// job weight config
var (
	MaxWeight          int64 = 1024
	ImageThumbWeight   int64 = MaxWeight / int64(runtime.NumCPU()/2+1)
	ImageRegularWeight int64 = MaxWeight / int64(runtime.NumCPU()/2+1)
	VideoRegularWeight int64 = MaxWeight
)

func weightByJobType(t jobType) int64 {
	switch t {
	case JobTypeImageThumb:
		return ImageThumbWeight
	case JobTypeImageRegular:
		return ImageRegularWeight
	case JobTypeVideoRegular:
		return VideoRegularWeight
	}
	return MaxWeight
}

type scheduler struct {
	weight *semaphore.Weighted
	cancel context.CancelFunc
	flight onceflight.Group
}

func (s *scheduler) scheduleByTag(
	ctx context.Context,
	p presentation.Presentation,
	rawTag, errorTag, successTag, outputFile string,
	jt jobType,
) (err error) {
	var logger = logging.Logger("job.transcode").Sugar()
	var outdated = errorTag != rawTag &&
		successTag != rawTag
	if !outdated {
		return
	}
	s.flight.Do(strconv.Itoa(int(jt))+":"+p.Raw, func() {
		var w = weightByJobType(jt)
		err = s.weight.Acquire(ctx, w)
		if err != nil {
			return
		}
		go func() {
			defer s.weight.Release(w)
			var err = jt.Run(p)
			if err != nil {
				logger.Error(
					"transcode error",
					zap.Error(err),
					zap.Any("presentation", p),
					zap.Any("type", jt),
				)
			}
		}()
		logger.Infow("scheduled", "jobType", jt, "raw", p.Raw)
	})
	return
}

// Schedule job async, but block if weight not enough (too many job running).
func (s *scheduler) Schedule(ctx context.Context, p presentation.Presentation) (err error) {
	var raw file.File
	raw, err = file.FindByPath(p.Raw)
	if err == db.ErrKeyNotFound {
		return db.Delete(db.IndexPresentationOutdated.Key(p.ID()))
	}
	if err != nil {
		return
	}
	rawTag := raw.Tag()
	_ = rawTag
	err = s.scheduleByTag(
		ctx,
		p,
		rawTag, p.ThumbErrorTag, p.ThumbSuccessTag,
		p.Thumb, thumbJobType(p.Type))
	if err != nil {
		return
	}
	err = s.scheduleByTag(
		ctx,
		p,
		rawTag, p.RegularErrorTag, p.RegularSuccessTag,
		p.Regular, regularJobType(p.Type))
	if err != nil {
		return
	}
	err = db.Delete(db.IndexPresentationOutdated.Key(p.ID()))
	return
}

func iterateAllPresentation(fn func(p presentation.Presentation) error) error {
	var logger = logging.Logger("job.transcode").Sugar()
	return db.View(func(txn *db.Txn) (err error) {
		opts := db.DefaultIteratorOptions
		opts.PrefetchValues = false
		it := txn.NewIterator(opts)
		defer it.Close()
		prefix := db.IndexPresentation.Bytes()
		for it.Seek(prefix); it.ValidForPrefix(prefix); it.Next() {
			var v presentation.Presentation
			var k = it.Item().Key()
			err = txn.Get(k, &v)
			if err != nil {
				return
			}

			var k2 []byte
			k2, err = v.Key()
			if err != nil {
				return
			}
			if bytes.Compare(k, k2) != 0 {
				logger.Warnw("detected danling key, removing", "presentation", v)
				err = db.Delete(k)
				if err != nil {
					return
				}
				continue
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

// Start schedule jobs, restart if already started.
func (s *scheduler) Start() {
	if s.cancel != nil {
		s.Stop()
	}
	s.weight = semaphore.NewWeighted(MaxWeight)
	logger := logging.Logger("transcode.scheduler")
	var ctx = context.Background()
	ctx, s.cancel = context.WithCancel(ctx)

	go func() {
		var allowFullScan = true
		var ticker = time.NewTicker(5 * time.Second) // limit min interval between scan.
		defer ticker.Stop()
		for {
			<-ticker.C
			jobCount := 0
			startTime := time.Now()
			err := iteratePresentation(func(v presentation.Presentation) (err error) {
				jobCount++
				return s.Schedule(ctx, v)
			}, allowFullScan)
			if err == context.Canceled {
				return
			} else if err != nil {
				logger.Error("presentation scan failed", zap.Error(err))
			} else {
				allowFullScan = false
				logger.Info("presentation scan completed",
					zap.Int("count", jobCount),
					zap.Duration("elapsed", time.Since(startTime)),
				)
			}
		}
	}()
}

// Stop schedule jobs.
func (s *scheduler) Stop() {
	if s.cancel == nil {
		// not started
		return
	}
	s.cancel()
}

// Scheduler schedule job runs.
var Scheduler = &scheduler{}
