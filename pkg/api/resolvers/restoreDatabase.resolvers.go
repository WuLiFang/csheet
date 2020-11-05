package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"os"

	"github.com/WuLiFang/csheet/v6/pkg/api/generated/model"
	"github.com/WuLiFang/csheet/v6/pkg/db"
)

func (r *mutationResolver) RestoreDatabase(ctx context.Context, input model.RestoreDatabaseInput) (*model.RestoreDatabasePayload, error) {
	ret := new(model.RestoreDatabasePayload)
	ret.ClientMutationID = input.ClientMutationID
	err := verifyAdminToken(input.AdminToken)
	if err != nil {
		return ret, err
	}

	if !dereferenceBool(input.SkipBackup) {
		backupPayload, err := r.BackupDatabase(
			ctx,
			model.BackupDatabaseInput{
				AdminToken: input.AdminToken,
			},
		)
		if err != nil {
			return ret, err
		}
		ret.Backup = backupPayload.Created
	}

	f, err := os.Open(input.BackupFile)
	if err != nil {
		return ret, err
	}
	defer f.Close()
	err = db.Restore(f, 8, dereferenceBool(input.SkipDrop))
	if err != nil {
		return ret, err
	}
	ret.IsDropped = !dereferenceBool(input.SkipDrop)
	return ret, nil
}
