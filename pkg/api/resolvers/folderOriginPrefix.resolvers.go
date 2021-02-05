package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/WuLiFang/csheet/v6/pkg/models/collection"
	"github.com/WuLiFang/csheet/v6/pkg/unipath"
)

func (r *queryResolver) FolderOriginPrefix(ctx context.Context, root string) (string, error) {
	return collection.Origin("folder", unipath.Auto(root)), nil
}
