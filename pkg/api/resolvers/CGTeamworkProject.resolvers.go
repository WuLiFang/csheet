package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	"github.com/WuLiFang/csheet/v6/pkg/api/generated"
	"github.com/WuLiFang/csheet/v6/pkg/cgteamwork"
)

func (r *cGTeamworkProjectResolver) Status(ctx context.Context, obj *cgteamwork.Project) (bool, error) {
	panic(fmt.Errorf("not implemented"))
}

// CGTeamworkProject returns generated.CGTeamworkProjectResolver implementation.
func (r *Resolver) CGTeamworkProject() generated.CGTeamworkProjectResolver {
	return &cGTeamworkProjectResolver{r}
}

type cGTeamworkProjectResolver struct{ *Resolver }
