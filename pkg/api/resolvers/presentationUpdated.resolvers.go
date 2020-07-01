package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/WuLiFang/csheet/v6/pkg/model/presentation"
)

func (r *subscriptionResolver) PresentationUpdated(ctx context.Context, id []string) (<-chan *presentation.Presentation, error) {
	ret := make(chan *presentation.Presentation)
	wantedIDs := map[string]struct{}{}
	for _, i := range id {
		wantedIDs[i] = struct{}{}
		presentation.ViewerCounter.Add(i, 1)
	}
	go presentation.SignalSaved.Subscribe(func(c <-chan presentation.Presentation) {
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
	}, 8)

	return ret, nil
}
