package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/WuLiFang/csheet/v6/pkg/api/generated/model"
	"github.com/WuLiFang/csheet/v6/pkg/cgteamwork"
	cgteamworkCollector "github.com/WuLiFang/csheet/v6/pkg/collector/cgteamwork"
	"github.com/WuLiFang/csheet/v6/pkg/model/collection"
	"github.com/tidwall/gjson"
)

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

// !!! WARNING !!!
// The code below was going to be deleted when updating resolvers. It has been copied here so you have
// one last chance to move it out of harms way if you want. There are two reasons this happens:
//  - When renaming or deleting a resolver the old code will be put in here. You can safely delete
//    it when you're done.
//  - You have helper methods in this file. Move them out to keep these resolver files clean.
type cGTeamworkNoteResolver struct{ *Resolver }
