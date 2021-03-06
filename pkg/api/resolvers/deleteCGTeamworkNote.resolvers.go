package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"
	"strings"

	"github.com/WuLiFang/csheet/v6/pkg/api/models"
	"github.com/WuLiFang/csheet/v6/pkg/cgteamwork"
	"go.uber.org/zap"
)

func (r *mutationResolver) DeleteCGTeamworkNote(ctx context.Context, input models.DeleteCGTeamworkNoteInput) (*models.DeleteCGTeamworkNotePayload, error) {
	var logger = getLogger(ctx).With(zap.String("username", input.Username))
	ret := new(models.DeleteCGTeamworkNotePayload)
	ret.ClientMutationID = input.ClientMutationID

	ctx = cgteamwork.WithClient(ctx, &cgteamwork.Client{
		URL:      cgteamwork.DefaultClient.URL,
		Username: input.Username,
		Password: input.Password,
	})

	for _, i := range input.ID {
		parts := strings.SplitN(i, ":", 2)
		if len(parts) != 2 {
			return ret, fmt.Errorf("invalid note id: %s", i)
		}
		database := parts[0]
		noteID := parts[1]

		s := cgteamwork.Select(database, "shot").WithModuleType("task")
		err := s.DeleteNote(ctx, noteID)
		if err != nil {
			return ret, err
		}
		ret.DeletedCount++
		logger.Info("delete", zap.String("id", i))
	}
	return ret, nil
}
