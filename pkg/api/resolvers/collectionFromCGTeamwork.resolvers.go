package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"time"

	"github.com/WuLiFang/csheet/v6/pkg/collector/base"
	"github.com/WuLiFang/csheet/v6/pkg/collector/cgteamwork"
)

func (r *mutationResolver) CollectFromCGTeamwork(ctx context.Context, database string, prefix string, pipeline string) (*base.CollectResult, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	v, err := cgteamwork.Collect(ctx, cgteamwork.Options{
		Database: database,
		Pipeline: pipeline,
		Prefix:   prefix,
	})
	return &v, err
}
