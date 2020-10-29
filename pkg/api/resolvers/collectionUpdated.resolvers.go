package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"strings"

	"github.com/WuLiFang/csheet/v6/pkg/api/generated"
	"github.com/WuLiFang/csheet/v6/pkg/model/collection"
)

func (r *subscriptionResolver) CollectionUpdated(ctx context.Context, id []string, originPrefix *string, presentationCountGt *int) (<-chan *collection.Collection, error) {
	wantedIDs := map[string]struct{}{}
	for _, i := range id {
		wantedIDs[i] = struct{}{}
	}

	ret := make(chan *collection.Collection)
	ctx, cancel := context.WithCancel(ctx)
	c := collection.SignalSaved.Subscribe(ctx, 0)
	go func() {
		defer close(ret)
		defer cancel()
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
			case ret <- &i:
			}
			return // only one item for each resolve call
		}
	}()
	return ret, nil
}

// Subscription returns generated.SubscriptionResolver implementation.
func (r *Resolver) Subscription() generated.SubscriptionResolver { return &subscriptionResolver{r} }

type subscriptionResolver struct{ *Resolver }
