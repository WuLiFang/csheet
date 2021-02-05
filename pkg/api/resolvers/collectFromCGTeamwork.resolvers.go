package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"errors"
	"time"

	"github.com/WuLiFang/csheet/v6/pkg/api/models"
	"github.com/WuLiFang/csheet/v6/pkg/collector/cgteamwork"
)

func (r *mutationResolver) CollectFromCGTeamwork(ctx context.Context, input *models.CollectFromCGTeamworkInput, database *string, prefix *string, pipeline *string) (*models.CollectFromCGTeamworkPayload, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	var ret = new(models.CollectFromCGTeamworkPayload)
	var err error
	defer cancel()
	if input != nil {
		ret.ClientMutationID = input.ClientMutationID
		v, err := cgteamwork.Collect(ctx, cgteamwork.Options{
			Database: input.Database,
			Pipeline: input.Pipeline,
			Prefix:   input.Prefix,
		})
		if err != nil {
			return ret, err
		}
		ret.CreatedCount = v.CreatedCount
		ret.UpdatedCount = v.UpdatedCount
		ret.OriginPrefix = v.OriginPrefix
	} else if database != nil && prefix != nil && pipeline != nil {
		v, err := cgteamwork.Collect(ctx, cgteamwork.Options{
			Database: *database,
			Pipeline: *pipeline,
			Prefix:   *prefix,
		})
		if err != nil {
			return ret, err
		}
		ret.CreatedCount = v.CreatedCount
		ret.UpdatedCount = v.UpdatedCount
		ret.OriginPrefix = v.OriginPrefix
	} else {
		return nil, errors.New("input is required when not using legacy args")
	}
	return ret, err
}
