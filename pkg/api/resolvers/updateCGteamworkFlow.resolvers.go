package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"
	"mime"

	"github.com/WuLiFang/csheet/v6/pkg/api/generated/model"
	"github.com/WuLiFang/csheet/v6/pkg/cgteamwork"
	cgteamworkCollector "github.com/WuLiFang/csheet/v6/pkg/collector/cgteamwork"
	"github.com/WuLiFang/csheet/v6/pkg/model/collection"
	"github.com/tidwall/gjson"
	"go.uber.org/zap"
)

func (r *mutationResolver) UpdateCGTeamworkFlow(ctx context.Context, input model.UpdateCGTeamworkFlowInput) (*model.UpdateCGTeamworkFlowPayload, error) {
	var logger = getLogger(ctx).With(zap.String("username", input.Username))
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
		taskPipeline := col.Metadata["cgteamwork.pipeline"]
		if i.Pipeline != nil {
			taskPipeline = *i.Pipeline
		}
		taskID := gjson.Parse(col.Metadata["cgteamwork.tasks"]).Get(fmt.Sprintf("#(pipeline=%s).id", taskPipeline)).String()
		if taskID == "" {
			continue
		}
		db, pipeline, prefix, err := cgteamworkCollector.ParseOrigin(col.Origin)
		if err != nil {
			return ret, err
		}

		s := cgteamwork.Select(db, "shot").
			WithModuleType("task").
			WithFilter(cgteamwork.F("task.id").Equal(taskID))
		msg := cgteamwork.Message{
			Images: make([]cgteamwork.Image, 0, len(i.Images)),
		}
		if i.Note != nil {
			msg.HTML = *i.Note
		}
		for _, img := range i.Images {
			var filename = img.Filename
			if ext, _ := mime.ExtensionsByType(img.ContentType); len(ext) > 0 {
				filename += ext[0]
			}
			uploaded, err := cgteamwork.UploadImage(ctx, filename, img.File, img.Size, cgteamwork.UploadOptionProject(db))
			if err != nil {
				return ret, err
			}
			msg.Images = append(msg.Images, uploaded)
		}
		err = s.UpdateFlow(ctx, fmt.Sprintf("task.%s_status", i.Stage), i.Status, msg)
		if err != nil {
			return ret, err
		}
		m[cgteamworkCollector.Options{
			Database: db,
			Pipeline: pipeline,
			Prefix:   prefix,
		}] = struct{}{}
		logger.Info("update",
			zap.String("origin", col.Origin),
			zap.String("pipeline", pipeline),
			zap.String("stage", i.Stage),
			zap.String("status", i.Status),
			zap.Int("htmlLength", len(msg.HTML)),
			zap.Int("imageCount", len(msg.Images)),
		)
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
