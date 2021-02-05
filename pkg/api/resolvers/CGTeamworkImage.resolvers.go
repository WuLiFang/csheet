package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/WuLiFang/csheet/v6/pkg/api/generated"
	"github.com/WuLiFang/csheet/v6/pkg/api/models"
	"github.com/WuLiFang/csheet/v6/pkg/cgteamwork"
)

func (r *cGTeamworkImageResolver) Max(ctx context.Context, obj *cgteamwork.Image) (*models.WebFile, error) {
	return &models.WebFile{
		URL: "/cgteamwork" + obj.Max,
	}, nil
}

func (r *cGTeamworkImageResolver) Min(ctx context.Context, obj *cgteamwork.Image) (*models.WebFile, error) {
	return &models.WebFile{
		URL: "/cgteamwork" + obj.Min,
	}, nil
}

// CGTeamworkImage returns generated.CGTeamworkImageResolver implementation.
func (r *Resolver) CGTeamworkImage() generated.CGTeamworkImageResolver {
	return &cGTeamworkImageResolver{r}
}

type cGTeamworkImageResolver struct{ *Resolver }
