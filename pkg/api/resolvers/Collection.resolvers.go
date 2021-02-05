package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"sort"

	"github.com/WuLiFang/csheet/v6/pkg/api/generated"
	"github.com/WuLiFang/csheet/v6/pkg/api/models"
	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/WuLiFang/csheet/v6/pkg/models/collection"
	"github.com/WuLiFang/csheet/v6/pkg/models/presentation"
	"go.uber.org/zap"
)

func (r *collectionResolver) Presentations(ctx context.Context, obj *collection.Collection) ([]presentation.Presentation, error) {
	ret := make([]presentation.Presentation, 0, len(obj.PresentationIDs))
	for _, i := range obj.PresentationIDs {
		v, err := presentation.FindByID(i)
		if err == db.ErrKeyNotFound {
			getLogger(ctx).Warn("presentation not found", zap.String("id", i))
			continue
		}
		if err != nil {
			return ret, err
		}
		ret = append(ret, v)
	}
	return ret, nil
}

func (r *collectionResolver) Metadata(ctx context.Context, obj *collection.Collection) ([]models.StringEntry, error) {
	var ret []models.StringEntry
	for k, v := range obj.Metadata {
		ret = append(ret, models.StringEntry{K: k, V: v})
	}
	sort.Slice(ret, func(i, j int) bool {
		return ret[i].K < ret[j].K
	})
	return ret, nil
}

// Collection returns generated.CollectionResolver implementation.
func (r *Resolver) Collection() generated.CollectionResolver { return &collectionResolver{r} }

type collectionResolver struct{ *Resolver }
