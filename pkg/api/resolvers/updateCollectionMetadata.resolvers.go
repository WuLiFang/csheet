package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/WuLiFang/csheet/v6/pkg/api/generated/model"
	"github.com/WuLiFang/csheet/v6/pkg/model/collection"
)

func (r *mutationResolver) UpdateCollectionMetadata(ctx context.Context, input model.UpdateCollectionMetadataInput) (*model.UpdateCollectionMetadataPayload, error) {
	var ret = new(model.UpdateCollectionMetadataPayload)
	var err error
	ret.ClientMutationID = input.ClientMutationID
	var m = make(map[string]collection.Collection)

	for _, i := range input.Data {
		v, ok := m[i.ID]
		if !ok {
			v, err = collection.FindByID(i.ID)
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
	}

	ret.Updated = make([]collection.Collection, 0, len(m))
	for _, i := range m {
		i.Save(ctx)
		ret.Updated = append(ret.Updated, i)
	}

	return ret, err
}
