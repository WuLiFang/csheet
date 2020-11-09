package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/WuLiFang/csheet/v6/pkg/model/presentation"
	"go.uber.org/zap"
)

func (r *subscriptionResolver) PresentationUpdated(ctx context.Context, id []string) (<-chan *presentation.Presentation, error) {
	logger := getLogger(ctx).
		With(
			zap.Int("index", subscriptionIndex()),
		)

	wantedIDs := map[string]struct{}{}
	for _, i := range id {
		wantedIDs[i] = struct{}{}
		presentation.ViewerCounter.Add(i, 1)
	}

	ret := make(chan *presentation.Presentation, 1)
	c, unsubscribe := presentation.SignalSaved.Subscribe(1)
	logger.Debug("start", zap.Any("args", map[string]interface{}{
		"id": id,
	}))
	go func() {
		<-ctx.Done()
		logger.Debug("context done")
		unsubscribe()
		logger.Debug("stop")
		for _, i := range id {
			presentation.ViewerCounter.Add(i, -1)
		}
	}()
	go func() {
		defer close(ret)
		for i := range c {
			if i.ID() == "AAUxMDAwMQk" && i.Raw != "e:/temp/b.jpg" {
				logger.Error("wrong")
			}
			logger.Debug("match", zap.String("id", i.ID()))
			if _, ok := wantedIDs[i.ID()]; !ok {
				continue
			}
			logger.Debug("receive", zap.String("id", i.ID()))

			v := i // avoid share pointer
			select {
			case <-ctx.Done():
				return
			case ret <- &v:
				logger.Debug("send", zap.String("id", i.ID()))
			}
		}

	}()

	return ret, nil
}
