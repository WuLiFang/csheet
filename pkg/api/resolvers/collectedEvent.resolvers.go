package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"strings"

	"github.com/WuLiFang/csheet/v6/pkg/api/generated"
	"github.com/WuLiFang/csheet/v6/pkg/model/event/collected"
)

func (r *subscriptionResolver) CollectedEvent(ctx context.Context, originPrefix string) (<-chan *collected.Event, error) {
	ret := make(chan *collected.Event)
	go collected.SignalSaved.Subscribe(func(c <-chan collected.Event) {
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
	}, 8)
	return ret, nil
}

// Subscription returns generated.SubscriptionResolver implementation.
func (r *Resolver) Subscription() generated.SubscriptionResolver { return &subscriptionResolver{r} }

type subscriptionResolver struct{ *Resolver }
