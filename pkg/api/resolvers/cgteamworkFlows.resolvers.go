package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/WuLiFang/csheet/v6/pkg/api/generated"
	"github.com/WuLiFang/csheet/v6/pkg/cgteamwork"
)

func (r *queryResolver) CgteamworkFlows(ctx context.Context, database string, pipeline []string) ([]cgteamwork.Flow, error) {
	var modules = map[string]struct{}{}

	var pipelinesOptions []cgteamwork.PipelinesOption
	var err error
	if pipeline == nil {
		modules["asset"] = struct{}{}
		modules["shot"] = struct{}{}
	} else {
		pipelinesOptions = append(pipelinesOptions, cgteamwork.PipelinesOptionFilter(cgteamwork.F("entity_name").In(pipeline)))
	}
	pipelines, err := cgteamwork.Pipelines(ctx, database, pipelinesOptions...)
	if err != nil {
		return nil, err
	}
	var findPipeline = func(id string) (ret cgteamwork.Pipeline, ok bool) {
		for _, i := range pipelines {
			if i.ID == id {
				return i, true
			}
		}
		return
	}
	statues, err := cgteamwork.Statuses(ctx)
	if err != nil {
		return nil, err
	}
	var findStatuses = func(id string) (ret cgteamwork.Status, ok bool) {
		for _, i := range statues {
			if i.ID == id {
				return i, true
			}
		}
		return
	}

	for _, i := range pipelines {
		modules[i.Module.Name] = struct{}{}
	}
	var ret = []cgteamwork.Flow{}
	for module := range modules {
		s := cgteamwork.Select(database, module).WithModuleType("task")
		flows, err := s.Flows(ctx)
		if err != nil {
			return ret, err
		}
		for _, i := range flows {
			if pipeline, ok := findPipeline(i.Pipeline.ID); ok {
				i.Pipeline = pipeline
				ret = append(ret, i)

				// load status color
				for _, stage := range i.Stages {
					for index, status := range stage.Statuses {
						if o, ok := findStatuses(status.ID); ok {
							stage.Statuses[index] = o
						}
					}
				}
			}
		}
	}
	return ret, nil
}

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type queryResolver struct{ *Resolver }
