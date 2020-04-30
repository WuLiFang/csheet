package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/WuLiFang/csheet/v6/pkg/api/generated"
	"github.com/WuLiFang/csheet/v6/pkg/model/file"
	"github.com/WuLiFang/csheet/v6/pkg/unipath"
)

func (r *diskFileResolver) Path(ctx context.Context, obj *file.File, format *string) (string, error) {
	var f string
	if format != nil {
		f = *format
	}
	switch f {
	case "windows":
		return unipath.Windows(obj.Path), nil
	case "unix":
		return unipath.Unix(obj.Path), nil
	default:
		return unipath.Auto(obj.Path), nil
	}
}

// DiskFile returns generated.DiskFileResolver implementation.
func (r *Resolver) DiskFile() generated.DiskFileResolver { return &diskFileResolver{r} }

type diskFileResolver struct{ *Resolver }
