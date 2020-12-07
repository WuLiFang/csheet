package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	"github.com/WuLiFang/csheet/v6/pkg/api/generated"
	"github.com/WuLiFang/csheet/v6/pkg/cgteamwork"
)

func (r *cGTeamworkFlowStageResolver) ID(ctx context.Context, obj *cgteamwork.FlowStage) (string, error) {
	return fmt.Sprintf("%s:%s", obj.Field.Database, obj.Field.ID), nil
}

// CGTeamworkFlowStage returns generated.CGTeamworkFlowStageResolver implementation.
func (r *Resolver) CGTeamworkFlowStage() generated.CGTeamworkFlowStageResolver {
	return &cGTeamworkFlowStageResolver{r}
}

type cGTeamworkFlowStageResolver struct{ *Resolver }
