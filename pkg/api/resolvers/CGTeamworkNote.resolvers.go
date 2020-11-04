package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	"github.com/WuLiFang/csheet/v6/pkg/api/generated"
	"github.com/WuLiFang/csheet/v6/pkg/api/generated/model"
	"github.com/WuLiFang/csheet/v6/pkg/cgteamwork"
	cgteamworkCollector "github.com/WuLiFang/csheet/v6/pkg/collector/cgteamwork"
	"github.com/WuLiFang/csheet/v6/pkg/model/collection"
	"github.com/tidwall/gjson"
)

func (r *cGTeamworkNoteResolver) ID(ctx context.Context, obj *cgteamwork.Note) (string, error) {
	return fmt.Sprintf("%s:%s", obj.Database, obj.ID), nil
}

func (r *collectionResolver) CgteamworkNotes(ctx context.Context, obj *collection.Collection, pipeline []string) ([]model.CollectionCGTeamworkNote, error) {
	db, _, _, err := cgteamworkCollector.ParseOrigin(obj.Origin)
	if err != nil {
		return nil, nil
	}

	var pipelineSet map[string]struct{}
	if pipeline != nil {
		pipelineSet = make(map[string]struct{})
		for _, i := range pipeline {
			pipelineSet[i] = struct{}{}
		}
	}

	var ret []model.CollectionCGTeamworkNote
	var innerError error
	gjson.Parse(obj.Metadata["cgteamwork.tasks"]).ForEach(
		func(key, value gjson.Result) bool {
			pipeline := value.Get("pipeline").String()
			if _, ok := pipelineSet[pipeline]; !ok && pipelineSet != nil {
				return true
			}
			s := cgteamwork.Select(db, "task").
				WithModuleType("shot").
				WithFilter(cgteamwork.F("task.id").Equal(value.Get("id").String()))
			notes, err := s.Notes(ctx)
			if err != nil {
				innerError = err
				return false
			}
			ret = append(ret, model.CollectionCGTeamworkNote{
				Pipeline: value.Get("pipeline").String(),
				Notes:    notes,
			})
			return true
		})

	return ret, innerError
}

// CGTeamworkNote returns generated.CGTeamworkNoteResolver implementation.
func (r *Resolver) CGTeamworkNote() generated.CGTeamworkNoteResolver {
	return &cGTeamworkNoteResolver{r}
}

type cGTeamworkNoteResolver struct{ *Resolver }
