package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/WuLiFang/csheet/v6/pkg/cgteamwork"
)

func (r *queryResolver) CgteamworkPipelines(ctx context.Context, database string, q *string, module []string) ([]cgteamwork.Pipeline, error) {
	var f = cgteamwork.F("#id").Has("%")
	if module != nil {
		f = f.And(cgteamwork.F("module").In(module))
	}
	if q != nil {
		f = f.And(cgteamwork.F("entity_name").HasIgnoreCase(*q)).
			Or(f.And(cgteamwork.F("description").HasIgnoreCase(*q)))
	}
	return cgteamwork.Pipelines(ctx, database, cgteamwork.PipelinesOptionFilter(f))
}
