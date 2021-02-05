package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/WuLiFang/csheet/v6/pkg/api/connections"
	"github.com/WuLiFang/csheet/v6/pkg/api/models"
)

func (r *queryResolver) CollectionTags(ctx context.Context, regex *string, first *int, last *int, before *string, after *string) (*models.StringConnection, error) {
	return connections.CollectionTag(ctx, regex, first, last, before, after)
}
