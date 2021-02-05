package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"
	"mime"

	"github.com/WuLiFang/csheet/v6/pkg/api/models"
	"github.com/WuLiFang/csheet/v6/pkg/cgteamwork"
	cgteamworkCollector "github.com/WuLiFang/csheet/v6/pkg/collector/cgteamwork"
	"github.com/WuLiFang/csheet/v6/pkg/models/collection"
	"github.com/tidwall/gjson"
	"go.uber.org/zap"
)

func (r *mutationResolver) CreateCGTeamworkNote(ctx context.Context, input models.CreateCGTeamworkNoteInput) (*models.CreateCGTeamworkNotePayload, error) {
	var logger = getLogger(ctx).With(zap.String("username", input.Username))
	ret := new(models.CreateCGTeamworkNotePayload)
	ret.ClientMutationID = input.ClientMutationID
	ret.UpdatedCollections = make([]collection.Collection, 0, len(input.Data))

	ctx = cgteamwork.WithClient(ctx, &cgteamwork.Client{
		URL:      cgteamwork.DefaultClient.URL,
		Username: input.Username,
		Password: input.Password,
	})

	updateIDSet := map[string]struct{}{}
	for _, i := range input.Data {
		col, err := collection.FindByID(ctx, i.ID)
		if err != nil {
			return ret, err
		}

		db, _, _, err := cgteamworkCollector.ParseOrigin(col.Origin)
		if err != nil {
			err = fmt.Errorf("not collected from cgteamwork: %s", i.ID)
			return ret, err
		}

		id := gjson.Get(col.Metadata["cgteamwork.tasks"], fmt.Sprintf("#(pipeline=%s).id", i.Pipeline)).String()
		if id == "" {
			err = fmt.Errorf("no task for collection=%s pipeline=%s", i.ID, i.Pipeline)
			return ret, err
		}

		s := cgteamwork.Select(db, "shot").WithModuleType("task").WithFilter(cgteamwork.F("task.id").Equal(id))
		msg := cgteamwork.Message{
			HTML:   i.HTML,
			Images: make([]cgteamwork.Image, 0, len(i.Images)),
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
		err = s.CreateNote(ctx, msg)
		if err != nil {
			return ret, err
		}
		ret.CreatedCount++
		if _, ok := updateIDSet[i.ID]; !ok {
			updateIDSet[i.ID] = struct{}{}
			ret.UpdatedCollections = append(ret.UpdatedCollections, *col)
		}
		logger.Info("create",
			zap.String("origin", col.Origin),
			zap.String("pipeline", i.Pipeline),
			zap.Int("htmlLength", len(msg.HTML)),
			zap.Int("imageCount", len(msg.Images)),
		)
	}

	return ret, nil
}
