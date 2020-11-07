package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/WuLiFang/csheet/v6/pkg/api/generated"
	"github.com/WuLiFang/csheet/v6/pkg/model/file"
)

func (r *diskFileResolver) Path(ctx context.Context, obj *file.File, format *string) (string, error) {
	return formatPath(obj.Path, format), nil
}

// DiskFile returns generated.DiskFileResolver implementation.
func (r *Resolver) DiskFile() generated.DiskFileResolver { return &diskFileResolver{r} }

type diskFileResolver struct{ *Resolver }
