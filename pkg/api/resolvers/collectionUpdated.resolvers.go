package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"strings"

	"github.com/WuLiFang/csheet/v6/pkg/api/generated"
	"github.com/WuLiFang/csheet/v6/pkg/model/collection"
	"go.uber.org/zap"
)

func (r *subscriptionResolver) CollectionUpdated(ctx context.Context, id []string, originPrefix *string, presentationCountGt *int) (<-chan *collection.Collection, error) {
	logger := getLogger(ctx).
		With(
			zap.Int("index", subscriptionIndex()),
		)

	wantedIDs := map[string]struct{}{}
	for _, i := range id {
		wantedIDs[i] = struct{}{}
	}

	ret := make(chan *collection.Collection, 1)
	c, unsubscribe := collection.SignalSaved.Subscribe(1)
	logger.Debug("start", zap.Any("args", map[string]interface{}{
		"id":             id,
		"originPrefix":   originPrefix,
		"presentationGt": presentationCountGt,
	}))
	go func() {
		<-ctx.Done()
		logger.Debug("context done")
		unsubscribe()
		logger.Debug("stop")
	}()
	go func() {
		defer close(ret)
		for i := range c {
			logger.Debug("match", zap.String("id", i.ID()))
			if originPrefix != nil && !strings.HasPrefix(i.Origin, *originPrefix) {
				continue
			}
			if id != nil {
				if _, ok := wantedIDs[i.ID()]; !ok {
					continue
				}
			}
			if presentationCountGt != nil && len(i.PresentationIDs) <= *presentationCountGt {
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

// Subscription returns generated.SubscriptionResolver implementation.
func (r *Resolver) Subscription() generated.SubscriptionResolver { return &subscriptionResolver{r} }

type subscriptionResolver struct{ *Resolver }
