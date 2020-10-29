package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"strings"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/api/generated"
	"github.com/WuLiFang/csheet/v6/pkg/model/collection"
	"go.uber.org/zap"
)

func (r *subscriptionResolver) CollectionUpdated(ctx context.Context, id []string, originPrefix *string, presentationCountGt *int) (<-chan *collection.Collection, error) {
	wantedIDs := map[string]struct{}{}
	for _, i := range id {
		wantedIDs[i] = struct{}{}
	}

	ret := make(chan *collection.Collection, 8)
	ctx, cancel := context.WithCancel(ctx)
	c := collection.SignalSaved.Subscribe(ctx, 0)
	go func() {
		defer close(ret)
		for i := range c {
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

			select {
			case <-ctx.Done():
				return
			case ret <- &i:
			default:
				logging.For(ctx).Logger("api").Error("subscription item overflow", zap.Any("collection", i))
				cancel()
			}
		}
	}()
	return ret, nil
}

// Subscription returns generated.SubscriptionResolver implementation.
func (r *Resolver) Subscription() generated.SubscriptionResolver { return &subscriptionResolver{r} }

type subscriptionResolver struct{ *Resolver }
