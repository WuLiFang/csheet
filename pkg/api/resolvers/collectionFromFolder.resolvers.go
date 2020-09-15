package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"time"

	"github.com/WuLiFang/csheet/v6/pkg/collector/base"
	"github.com/WuLiFang/csheet/v6/pkg/collector/folder"
)

func (r *mutationResolver) CollectFromFolder(ctx context.Context, root string) (*base.CollectResult, error) {
	ctx, cancel := context.WithTimeout(ctx, 60*time.Second)
	defer cancel()
	v, err := folder.Collect(ctx, root)
	return &v, formatError(err)
}
