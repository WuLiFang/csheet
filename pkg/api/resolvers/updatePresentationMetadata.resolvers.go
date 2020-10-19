package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	"github.com/WuLiFang/csheet/v6/pkg/api/generated/model"
	"github.com/WuLiFang/csheet/v6/pkg/model/presentation"
)

func (r *mutationResolver) UpdatePresentationMetadata(ctx context.Context, input model.UpdatePresentationMetadataInput) (*model.UpdatePresentationMetadataPayload, error) {
	var ret = new(model.UpdatePresentationMetadataPayload)
	var err error
	ret.ClientMutationID = input.ClientMutationID
	var m = make(map[string]presentation.Presentation)

	for _, i := range input.Data {
		v, ok := m[i.ID]
		if len(i.Key) > 1<<10 {
			return ret, fmt.Errorf("key length excess limit (1 KiB): %s", i.Key)
		}
		if len(i.Value) > 1<<20 {
			return ret, fmt.Errorf("value length excess limit (1 MiB): %s", i.Key)
		}
		if !ok {
			v, err = presentation.FindByID(i.ID)
			if err != nil {
				return ret, err
			}

			m[i.ID] = v
		}
		v.SetMetadata(i.Key, i.Value)
		m[i.ID] = v
	}

	ret.Updated = make([]presentation.Presentation, 0, len(m))
	for _, i := range m {
		i.Save(ctx)
		ret.Updated = append(ret.Updated, i)
	}

	return ret, err
}
