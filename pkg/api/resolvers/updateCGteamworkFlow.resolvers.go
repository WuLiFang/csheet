package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"
	"mime"
	"strings"

	"github.com/WuLiFang/csheet/v6/pkg/api/models"
	"github.com/WuLiFang/csheet/v6/pkg/cgteamwork"
	cgteamworkCollector "github.com/WuLiFang/csheet/v6/pkg/collector/cgteamwork"
	"github.com/WuLiFang/csheet/v6/pkg/models/collection"
	"github.com/tidwall/gjson"
	"go.uber.org/zap"
)

func (r *mutationResolver) UpdateCGTeamworkFlow(ctx context.Context, input models.UpdateCGTeamworkFlowInput) (*models.UpdateCGTeamworkFlowPayload, error) {
	var logger = getLogger(ctx).With(zap.String("username", input.Username))
	ctx = cgteamwork.WithClient(ctx, &cgteamwork.Client{
		URL:      cgteamwork.DefaultClient.URL,
		Username: input.Username,
		Password: input.Password,
	})
	ret := new(models.UpdateCGTeamworkFlowPayload)
	ret.ClientMutationID = input.ClientMutationID

	m := make(map[cgteamworkCollector.Options]struct{})

	var statuses map[string]cgteamwork.Status
	var findStatusByID = func(id string) (ret cgteamwork.Status, err error) {
		if statuses == nil {
			statuses = map[string]cgteamwork.Status{}
			var data []cgteamwork.Status
			data, err = cgteamwork.Statuses(ctx)
			if err != nil {
				return
			}
			for _, i := range data {
				statuses[i.ID] = i
			}
		}
		if o, ok := statuses[id]; ok {
			ret = o
			return
		}
		err = fmt.Errorf("cgteamwork: status not found: %s", id)
		return
	}
	for _, i := range input.Data {
		col, err := collection.FindByID(ctx, i.ID)
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

		var field = cgteamwork.Field{}
		// old client support
		if "leader" == i.Stage || "director" == i.Stage || "client" == i.Stage {
			field.Sign = cgteamwork.F(fmt.Sprintf("task.%s_status", i.Stage))
		} else {
			parts := strings.Split(i.Stage, ":")
			if len(parts) != 2 {
				return ret, fmt.Errorf("invalid stage id: %s", i.Stage)
			}
			if parts[0] != db {
				return ret, fmt.Errorf("stage is in other db: %s", i.Stage)
			}
			field.Database = db
			field.ID = parts[1]
			err = field.Fetch(ctx, cgteamwork.FieldOptionFields([]string{"sign"}))
			if err != nil {
				return ret, err
			}
		}

		var status = cgteamwork.Status{}
		// old client support
		if len(i.Status) < 36 {
			status.Name = i.Status
		} else {
			status, err = findStatusByID(i.Status)
			if err != nil {
				return ret, err
			}
		}
		err = s.UpdateFlow(ctx, string(field.Sign), status.Name, msg)
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
		col, err := collection.FindByID(ctx, i.ID)
		if err != nil {
			return ret, err
		}
		ret.Updated = append(ret.Updated, *col)
		ids[i.ID] = struct{}{}
	}
	return ret, nil
}
