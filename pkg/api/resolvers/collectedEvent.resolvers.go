package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"strings"

	"github.com/WuLiFang/csheet/pkg/api/generated"
	"github.com/WuLiFang/csheet/pkg/model/event/collected"
)

func (r *subscriptionResolver) CollectedEvent(ctx context.Context, originPrefix string) (<-chan *collected.Event, error) {
	c := make(chan collected.Event)
	ret := make(chan *collected.Event)
	collected.SignalUpdated.Notify(c)
	go func() {
		defer collected.SignalUpdated.Stop(c)
		defer close(ret)
		for {
			select {
			case <-ctx.Done():
				return
			case i := <-c:
				if strings.HasPrefix(i.OriginPrefix, originPrefix) {
					ret <- &i
				}
			}
		}

	}()
	return ret, nil
}

// Subscription returns generated.SubscriptionResolver implementation.
func (r *Resolver) Subscription() generated.SubscriptionResolver { return &subscriptionResolver{r} }

type subscriptionResolver struct{ *Resolver }
