package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/WuLiFang/csheet/v6/pkg/model/collection"
)

func (r *subscriptionResolver) CollectionUpdated(ctx context.Context, id []string) (<-chan *collection.Collection, error) {
	c := make(chan collection.Collection)
	ret := make(chan *collection.Collection)
	collection.SignalUpdated.Notify(c)
	wantedIDs := map[string]struct{}{}
	for _, i := range id {
		wantedIDs[i] = struct{}{}
	}
	go func() {
		defer collection.SignalUpdated.Stop(c)
		defer close(ret)
		for {
			select {
			case <-ctx.Done():
				return
			case i := <-c:
				if _, ok := wantedIDs[i.ID()]; ok {
					ret <- &i
				}
			}
		}
	}()
	return ret, nil
}
