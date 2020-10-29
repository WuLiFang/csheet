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
	wantedIDs := map[string]struct{}{}
	for _, i := range id {
		wantedIDs[i] = struct{}{}
		presentation.ViewerCounter.Add(i, 1)
	}

	ctx, cancel := context.WithCancel(ctx)
	ret := make(chan *presentation.Presentation, 8)
	c := presentation.SignalSaved.Subscribe(ctx, 0)
	go func() {
		defer close(ret)
		for i := range c {
			if _, ok := wantedIDs[i.ID()]; !ok {
				continue
			}

			select {
			case <-ctx.Done():
				return
			case ret <- &i:
			default:
				logging.For(ctx).Logger("api").Error("subscription item overflow", zap.Any("presentation", i))
				cancel()
			}
		}
	}()

	return ret, nil
}
