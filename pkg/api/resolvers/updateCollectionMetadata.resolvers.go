package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	"github.com/WuLiFang/csheet/v6/pkg/api/generated/model"
	"github.com/WuLiFang/csheet/v6/pkg/models/collection"
	"go.uber.org/zap"
)

func (r *mutationResolver) UpdateCollectionMetadata(ctx context.Context, input model.UpdateCollectionMetadataInput) (*model.UpdateCollectionMetadataPayload, error) {
	var logger = getLogger(ctx)
	var ret = new(model.UpdateCollectionMetadataPayload)
	var err error
	ret.ClientMutationID = input.ClientMutationID
	var m = make(map[string]*collection.Collection)

	for _, i := range input.Data {
		v, ok := m[i.ID]
		if len(i.Key) > 1<<10 {
			return ret, fmt.Errorf("key length excess limit (1 KiB): %s", i.Key)
		}
		if len(i.Value) > 1<<20 {
			return ret, fmt.Errorf("value length excess limit (1 MiB): %s", i.Key)
		}
		if !ok {
			v, err = collection.FindByID(ctx, i.ID)
			if err != nil {
				return ret, err
			}

			m[i.ID] = v
		}
		if i.Value == "" {
			delete(v.Metadata, i.Key)
		} else {
			if v.Metadata == nil {
				v.Metadata = make(map[string]string)
				m[i.ID] = v
			}
			v.Metadata[i.Key] = i.Value
		}
		logger.Info("set", zap.String("origin", v.Origin), zap.String("key", i.Key))
	}

	ret.Updated = make([]collection.Collection, 0, len(m))
	for _, i := range m {
		i.Save(ctx)
		ret.Updated = append(ret.Updated, *i)
	}

	return ret, err
}
