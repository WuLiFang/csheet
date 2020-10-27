package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"
	"strings"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/api/generated/model"
	"github.com/WuLiFang/csheet/v6/pkg/cgteamwork"
	cgteamworkCollector "github.com/WuLiFang/csheet/v6/pkg/collector/cgteamwork"
	"github.com/WuLiFang/csheet/v6/pkg/model/collection"
	"github.com/tidwall/gjson"
	"go.uber.org/zap"
)

func (r *mutationResolver) UpdateCGTeamworkFlow(ctx context.Context, input model.UpdateCGTeamworkFlowInput) (*model.UpdateCGTeamworkFlowPayload, error) {
	logger := logging.For(ctx).Logger("api")
	ctx = cgteamwork.WithClient(ctx, &cgteamwork.Client{
		URL:      cgteamwork.DefaultClient.URL,
		Username: input.Username,
		Password: input.Password,
	})
	ret := new(model.UpdateCGTeamworkFlowPayload)
	ret.ClientMutationID = input.ClientMutationID

	m := make(map[cgteamworkCollector.Options]struct{})

	for _, i := range input.Data {
		col, err := collection.FindByID(i.ID)
		if err != nil {
			return ret, err
		}
		pipeline := col.Metadata["cgteamwork.pipeline"]
		if i.Pipeline != nil {
			pipeline = *i.Pipeline
		}
		taskID := gjson.Parse(col.Metadata["cgteamwork.tasks"]).Get(fmt.Sprintf("#(pipeline=%s).id", pipeline)).String()
		if taskID == "" {
			continue
		}
		parts := strings.Split(col.Origin, collection.OriginSeperator)
		if len(parts) != 4 {
			logger.DPanic("invalid origin", zap.Any("collection", col))
			continue
		}
		database := parts[1]
		s := cgteamwork.Select(database, "shot").
			WithModuleType("task").
			WithFilter(cgteamwork.F("task.id").Equal(taskID))
		note := ""
		if i.Note != nil {
			note = *i.Note
		}
		err = s.UpdateFlow(ctx, fmt.Sprintf("task.%s_status", i.Stage), i.Status, note)
		if err != nil {
			return ret, err
		}
		m[cgteamworkCollector.Options{
			Database: database,
			Pipeline: col.Metadata["cgteamwork.pipeline"],
			Prefix:   parts[3],
		}] = struct{}{}
	}

	for i := range m {
		_, err := cgteamworkCollector.Collect(ctx, i)
		if err != nil {
			return ret, err
		}
	}

	ids := make(map[string]struct{})
	for _, i := range input.Data {
		if _, ok := ids[i.ID]; ok {
			continue
		}
		col, err := collection.FindByID(i.ID)
		if err != nil {
			return ret, err
		}
		ret.Updated = append(ret.Updated, col)
		ids[i.ID] = struct{}{}
	}
	return ret, nil
}
