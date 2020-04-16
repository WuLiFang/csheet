package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/WuLiFang/csheet/pkg/api/generated"
	"github.com/WuLiFang/csheet/pkg/cgteamwork"
)

func (r *queryResolver) CgteamworkProjects(ctx context.Context) ([]cgteamwork.Project, error) {
	return cgteamwork.DefaultClient.ListActiveProject(ctx)
}

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type queryResolver struct{ *Resolver }
