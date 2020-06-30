package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/WuLiFang/csheet/v6/pkg/model/collection"
)

func (r *subscriptionResolver) CollectionUpdated(ctx context.Context, id []string) (<-chan *collection.Collection, error) {
	ret := make(chan *collection.Collection)
	wantedIDs := map[string]struct{}{}
	for _, i := range id {
		wantedIDs[i] = struct{}{}
	}
	go collection.SignalSaved.Subscribe(func(c <-chan *collection.Collection) {
		for {
			select {
			case <-ctx.Done():
				return
			case i := <-c:
				if _, ok := wantedIDs[i.ID()]; ok {
					ret <- i
				}
			}
		}
	}, 8)
	return ret, nil
}
