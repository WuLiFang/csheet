package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/WuLiFang/csheet/v6/pkg/api/generated"
	"github.com/WuLiFang/csheet/v6/pkg/cgteamwork"
)

func (r *queryResolver) CgteamworkProjects(ctx context.Context, q *string) ([]cgteamwork.Project, error) {
	var filter cgteamwork.Filter

	if q != nil {
		filter = cgteamwork.F("project.code", "has", q).
			Or(cgteamwork.F("project.full_name", "has", q)).
			Or(cgteamwork.F("project.database", "has", q))
	}
	return cgteamwork.DefaultClient.ListProjects(ctx, filter)
}

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type queryResolver struct{ *Resolver }
