package transcode

import (
	"context"
	"runtime"
	"strconv"
	"time"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/WuLiFang/csheet/v6/pkg/models/file"
	"github.com/WuLiFang/csheet/v6/pkg/models/presentation"
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

func isTagOutdated(rawTag, successTag, errorTag string) bool {
	if rawTag == "" {
		return false
	}
	return errorTag != rawTag &&
		successTag != rawTag
}

func (s *scheduler) transcodeByType(
	ctx context.Context,
	p presentation.Presentation,
	jt jobType,
) (err error) {
	var logger = logging.Logger("job.transcode")
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

// transcode all size for given presentation if needed,
// block if weight not enough (too many job running).
func (s *scheduler) transcode(ctx context.Context, p presentation.Presentation) (err error) {
	if isTagOutdated(p.RawTag(), p.ThumbSuccessTag, p.ThumbErrorTag) {
		err = p.ProbeAndSave(ctx)
		if err != nil {
			return
		}
		err = s.transcodeByType(
			ctx,
			p,
			thumbJobType(p.Type))
		if err != nil {
			return
		}
	}
	if isTagOutdated(p.RawTag(), p.RegularSuccessTag, p.RegularErrorTag) {
		err = s.transcodeByType(
			ctx,
			p,
			regularJobType(p.Type))
		if err != nil {
			return
		}
	}
	err = db.Delete(db.IndexPresentationOutdated.Key(p.PrimaryKey()))
	return
}

// Start schedule jobs, restart if already started.
func (s *scheduler) Start() {
	if s.cancel != nil {
		s.Stop()
	}
	s.weight = semaphore.NewWeighted(MaxWeight)
	s.flight = new(onceflight.Group)
	logger := logging.Logger("job.transcode")
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
			err := presentation.IterateOutdated(func(v presentation.Presentation) (err error) {
				jobCount++
				c <- v
				return
			})
			if err == context.Canceled {
				return
			} else if err != nil {
				logger.Error("scan failed", zap.Error(err))
			} else if jobCount > 0 {
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
		ps, err := presentation.FindByPath(f.Path)
		if err != nil {
			return
		}
		for _, i := range ps {
			// trigger save hooks
			err = i.Save(ctx)
			if err != nil {
				return
			}
		}
		return
	})
}
