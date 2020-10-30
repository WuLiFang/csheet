package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/model/presentation"
	"go.uber.org/zap"
)

func (r *subscriptionResolver) PresentationUpdated(ctx context.Context, id []string) (<-chan *presentation.Presentation, error) {
	logger := logging.For(ctx).Logger("api.subscription").
		With(
			zap.Int("index", subscriptionIndex()),
			zap.String("path", "presentationUpdated"),
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
			logger.Debug("match", zap.String("id", i.ID()))
			if _, ok := wantedIDs[i.ID()]; !ok {
				continue
			}
			logger.Debug("receive", zap.String("id", i.ID()))

			select {
			case <-ctx.Done():
				return
			case ret <- &i:
				logger.Debug("send", zap.String("id", i.ID()))
			default:
				logger.Error("overflow")
			}
		}

	}()

	return ret, nil
}
