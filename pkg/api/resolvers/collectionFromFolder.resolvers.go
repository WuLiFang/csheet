package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"time"

	"github.com/WuLiFang/csheet/pkg/collector/folder"
	"github.com/WuLiFang/csheet/pkg/model/event/collected"
)

func (r *mutationResolver) CollectFromFolder(ctx context.Context, root string) (*collected.Event, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	return folder.Collect(ctx, root)
}
