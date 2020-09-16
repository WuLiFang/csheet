package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"time"

	"github.com/WuLiFang/csheet/v6/pkg/api/generated"
	"github.com/WuLiFang/csheet/v6/pkg/collector/base"
)

func (r *collectResultResolver) ID(ctx context.Context, obj *base.CollectResult) (string, error) {
	return "", nil
}

func (r *collectResultResolver) Time(ctx context.Context, obj *base.CollectResult) (*time.Time, error) {
	var now = time.Now()
	return &now, nil
}

// CollectResult returns generated.CollectResultResolver implementation.
func (r *Resolver) CollectResult() generated.CollectResultResolver { return &collectResultResolver{r} }

type collectResultResolver struct{ *Resolver }
