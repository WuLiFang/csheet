package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"errors"
	"time"

	"github.com/WuLiFang/csheet/v6/pkg/api/models"
	collect "github.com/WuLiFang/csheet/v6/pkg/collector/base"
	"github.com/WuLiFang/csheet/v6/pkg/collector/folder"
)

func (r *mutationResolver) CollectFromFolder(ctx context.Context, input *models.CollectFromFolderInput, root *string) (*models.CollectFromFolderPayload, error) {
	var ret = new(models.CollectFromFolderPayload)
	var err error

	ctx, cancel := context.WithTimeout(ctx, 60*time.Second)
	defer cancel()
	var v collect.CollectResult
	if input != nil {
		ret.ClientMutationID = input.ClientMutationID
		v, err = folder.Collect(ctx, input.Root)
	} else if root != nil {
		v, err = folder.Collect(ctx, *root)
	} else {
		return nil, errors.New("input is required when not using legacy args")
	}

	ret.CreatedCount = v.CreatedCount
	ret.UpdatedCount = v.UpdatedCount
	ret.OriginPrefix = v.OriginPrefix
	return ret, err
}
