package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"sort"

	"github.com/WuLiFang/csheet/v6/pkg/api/generated"
	"github.com/WuLiFang/csheet/v6/pkg/api/models"
	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/WuLiFang/csheet/v6/pkg/models/file"
	"github.com/WuLiFang/csheet/v6/pkg/models/presentation"
)

func (r *presentationResolver) Type(ctx context.Context, obj *presentation.Presentation) (string, error) {
	return string(obj.Type), nil
}

func (r *presentationResolver) Raw(ctx context.Context, obj *presentation.Presentation) (*file.File, error) {
	v, err := file.FindByPath(obj.Raw)
	if err == db.ErrKeyNotFound {
		return &file.File{
			Path: obj.Raw,
		}, nil
	}
	return &v, err
}

func (r *presentationResolver) Thumb(ctx context.Context, obj *presentation.Presentation) (*models.WebFile, error) {
	if obj.Thumb == "" {
		return nil, nil
	}
	return &models.WebFile{
		URL: "/files/" + obj.Thumb,
	}, nil
}

func (r *presentationResolver) IsThumbOutdated(ctx context.Context, obj *presentation.Presentation) (*bool, error) {
	if obj.Thumb == "" {
		v := false
		return &v, nil
	}
	raw, _ := file.FindByPath(obj.Raw)
	v := raw.Tag() != obj.ThumbSuccessTag
	return &v, nil
}

func (r *presentationResolver) IsThumbTranscodeFailed(ctx context.Context, obj *presentation.Presentation) (*bool, error) {
	raw, _ := file.FindByPath(obj.Raw)
	v := raw.Tag() == obj.ThumbErrorTag
	return &v, nil
}

func (r *presentationResolver) Regular(ctx context.Context, obj *presentation.Presentation) (*models.WebFile, error) {
	if obj.Regular == "" {
		return nil, nil
	}
	return &models.WebFile{
		URL: "/files/" + obj.Regular,
	}, nil
}

func (r *presentationResolver) IsRegularOutdated(ctx context.Context, obj *presentation.Presentation) (*bool, error) {
	if obj.Regular == "" {
		v := false
		return &v, nil
	}
	raw, _ := file.FindByPath(obj.Raw)
	v := raw.Tag() != obj.RegularSuccessTag
	return &v, nil
}

func (r *presentationResolver) IsRegularTranscodeFailed(ctx context.Context, obj *presentation.Presentation) (*bool, error) {
	raw, _ := file.FindByPath(obj.Raw)
	v := raw.Tag() == obj.RegularErrorTag
	return &v, nil
}

func (r *presentationResolver) Metadata(ctx context.Context, obj *presentation.Presentation) ([]models.StringEntry, error) {
	var ret []models.StringEntry
	for k, v := range obj.Metadata {
		ret = append(ret, models.StringEntry{K: k, V: v})
	}
	sort.Slice(ret, func(i, j int) bool {
		return ret[i].K < ret[j].K
	})
	return ret, nil
}

// Presentation returns generated.PresentationResolver implementation.
func (r *Resolver) Presentation() generated.PresentationResolver { return &presentationResolver{r} }

type presentationResolver struct{ *Resolver }
