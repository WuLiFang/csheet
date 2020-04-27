package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"time"

	"github.com/WuLiFang/csheet/v6/pkg/api/generated"
	"github.com/WuLiFang/csheet/v6/pkg/collector/cgteamwork"
	"github.com/WuLiFang/csheet/v6/pkg/model/event/collected"
)

func (r *mutationResolver) CollectFromCGTeamwork(ctx context.Context, database string, prefix string, pipeline string) (*collected.Event, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	return cgteamwork.Collect(ctx, cgteamwork.Options{
		Database: database,
		Pipeline: pipeline,
		Prefix:   prefix,
	})
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

type mutationResolver struct{ *Resolver }
