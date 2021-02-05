package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/WuLiFang/csheet/v6/pkg/api/models"
	"github.com/WuLiFang/csheet/v6/pkg/models/collection"
)

func (r *mutationResolver) UpdateCollection(ctx context.Context, input models.UpdateCollectionInput) (*models.UpdateCollectionPayload, error) {
	var ret = new(models.UpdateCollectionPayload)
	ret.ClientMutationID = input.ClientMutationID
	var err error

	for _, i := range input.Data {
		col, findErr := collection.FindByID(ctx, i.ID)
		err = findErr
		if err != nil {
			return ret, err
		}
		if i.Tags != nil {
			col.Tags = i.Tags
		}
		err = col.Save(ctx)
		if err != nil {
			return ret, err
		}
		ret.Updated = append(ret.Updated, *col)
	}
	return ret, err
}
