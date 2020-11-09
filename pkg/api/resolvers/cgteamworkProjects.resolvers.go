package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/WuLiFang/csheet/v6/pkg/cgteamwork"
)

func (r *queryResolver) CgteamworkProjects(ctx context.Context, q *string, name []string, database []string, status []string) ([]cgteamwork.Project, error) {
	var filter cgteamwork.Filter
	if name != nil {
		if len(name) == 0 {
			return []cgteamwork.Project{}, nil
		}
		filter = filter.And(cgteamwork.F("project.full_name").In(name))
	}
	if database != nil {
		if len(database) == 0 {
			return []cgteamwork.Project{}, nil
		}
		filter = filter.And(cgteamwork.F("project.database").In(database))
	}
	if status != nil {
		if len(status) == 0 {
			return []cgteamwork.Project{}, nil
		}
		filter = filter.And(cgteamwork.F("project.status").In(status))
	}

	if q != nil {
		filter = filter.And(cgteamwork.F("project.code").HasIgnoreCase(*q)).
			Or(filter.And(cgteamwork.F("project.full_name").HasIgnoreCase(*q)))
	}
	return cgteamwork.ListProjects(
		ctx,
		func(s cgteamwork.Selection) (ret cgteamwork.Selection) {
			ret = s.WithFilter(filter)
			if q != nil {
				ret = ret.WithLimit(20)
			}
			return
		},
	)
}
