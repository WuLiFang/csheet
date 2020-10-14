package transcode

import (
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
	VideoRegularWeight int64 = MaxWeight/2 + 1
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
	flight *onceflight.Group
}

func (s *scheduler) transcodeOnDemand(
	ctx context.Context,
	p presentation.Presentation,
	rawTag, errorTag, successTag, outputFile string,
	jt jobType,
) (err error) {
	var logger = logging.Logger("job.transcode")
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
		defer s.weight.Release(w)
		var err = jt.Run(ctx, p)
		if err != nil {
			logger.Error(
				"transcode error",
				zap.Error(err),
				zap.Any("presentation", p),
				zap.Any("type", jt),
			)
		}
	})
	return
}

// transcode create job for given presentation if needed,
// block if weight not enough (too many job running).
func (s *scheduler) transcode(ctx context.Context, p presentation.Presentation) (err error) {
	var raw file.File
	raw, err = file.FindByPath(p.Raw)
	if err == db.ErrKeyNotFound {
		return db.Delete(db.IndexPresentationOutdated.Key(p.ID()))
	}
	if err != nil {
		return
	}
	rawTag := raw.Tag()
	err = s.transcodeOnDemand(
		ctx,
		p,
		rawTag, p.ThumbErrorTag, p.ThumbSuccessTag,
		p.Thumb, thumbJobType(p.Type))
	if err != nil {
		return
	}
	err = s.transcodeOnDemand(
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

// Start schedule jobs, restart if already started.
func (s *scheduler) Start() {
	if s.cancel != nil {
		s.Stop()
	}
	s.weight = semaphore.NewWeighted(MaxWeight)
	s.flight = new(onceflight.Group)
	logger := logging.Logger("transcode.scheduler")
	var ctx = context.Background()
	ctx, s.cancel = context.WithCancel(ctx)

	go func() {
		var ticker = time.NewTicker(5 * time.Second) // limit min interval between scan.
		defer ticker.Stop()
		var c = make(chan presentation.Presentation)
		defer close(c)

		for i := 0; i < 8; i++ {
			go func() {
				for p := range c {
					var err = s.transcode(ctx, p)
					if err == context.Canceled {
						return
					}
					if err != nil {
						logger.Error("schedule task failed", zap.Error(err))
					}
				}
			}()
		}
		for {
			<-ticker.C
			jobCount := 0
			startTime := time.Now()
			err := iterateOutdatedPresentation(func(v presentation.Presentation) (err error) {
				jobCount++
				c <- v
				return
			})
			if err == context.Canceled {
				return
			} else if err != nil {
				logger.Error("presentation scan failed", zap.Error(err))
			} else {
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

func init() {
	file.SignalSaved.Connect(func(ctx context.Context, f *file.File) (err error) {
		ids, err := presentation.FindIDByPath(f.Path)
		if err != nil {
			return
		}
		err = db.Update(func(txn *db.Txn) (err error) {
			for _, i := range ids {
				err = txn.Set(db.IndexPresentationOutdated.Key(i), nil)
				if err != nil {
					return
				}
			}
			return
		})
		return
	})
}
