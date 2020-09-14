package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/WuLiFang/csheet/v6/pkg/api/generated"
	"github.com/WuLiFang/csheet/v6/pkg/cgteamwork"
)

func (r *queryResolver) CgteamworkProjects(ctx context.Context, q *string, status []string) ([]cgteamwork.Project, error) {
	var filter cgteamwork.Filter
	if status != nil {
		if len(status) == 0 {
			return []cgteamwork.Project{}, nil
		}
		filter = filter.And(cgteamwork.F("project.status", "in", status))
	}

	if q != nil {
		filter = filter.And(cgteamwork.F("project.code", "has", q)).
			Or(filter.And(cgteamwork.F("project.full_name", "has", q)))
	}
	return cgteamwork.DefaultClient.ListProjects(ctx, filter)
}

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type queryResolver struct{ *Resolver }
