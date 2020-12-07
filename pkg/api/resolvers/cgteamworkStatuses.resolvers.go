package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/WuLiFang/csheet/v6/pkg/cgteamwork"
)

func (r *queryResolver) CgteamworkStatuses(ctx context.Context) ([]cgteamwork.Status, error) {
	return cgteamwork.Statuses(ctx)
}
