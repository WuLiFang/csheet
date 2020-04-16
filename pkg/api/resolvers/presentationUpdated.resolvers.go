package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/WuLiFang/csheet/pkg/model/presentation"
)

func (r *subscriptionResolver) PresentationUpdated(ctx context.Context, id []string) (<-chan *presentation.Presentation, error) {
	c := make(chan presentation.Presentation)
	ret := make(chan *presentation.Presentation)
	presentation.SignalUpdated.Notify(c)
	wantedIDs := map[string]struct{}{}
	for _, i := range id {
		wantedIDs[i] = struct{}{}
		presentation.ViewerCounter.Add(i, 1)
	}

	go func() {
		defer func() {
			for _, i := range id {
				presentation.ViewerCounter.Add(i, -1)
			}
		}()
		defer presentation.SignalUpdated.Stop(c)
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
