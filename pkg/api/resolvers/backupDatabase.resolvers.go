package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"os"
	"path"
	"time"

	"github.com/WuLiFang/csheet/v6/internal/config"
	"github.com/WuLiFang/csheet/v6/pkg/api/generated"
	"github.com/WuLiFang/csheet/v6/pkg/api/generated/model"
	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/WuLiFang/csheet/v6/pkg/model/file"
)

func (r *mutationResolver) BackupDatabase(ctx context.Context, input model.BackupDatabaseInput) (*model.BackupDatabasePayload, error) {
	ret := new(model.BackupDatabasePayload)
	ret.ClientMutationID = input.ClientMutationID
	err := verifyAdminToken(input.AdminToken)
	if err != nil {
		return ret, err
	}

	var fullpath = path.Join(config.Storage, "backup", time.Now().Format("csheet-20060102-030405.bak"))
	err = os.MkdirAll(path.Dir(fullpath), 0700)
	if err != nil {
		return ret, err
	}
	f, err := os.Create(fullpath)
	if err != nil {
		return ret, err
	}
	defer f.Close()
	_, err = db.Backup(f, 0)
	if err != nil {
		return ret, err
	}
	ret.Created = new(file.File)
	ret.Created.Path = fullpath
	fi, err := f.Stat()
	if err != nil {
		return ret, err
	}
	ret.Created.ModTime = fi.ModTime()
	ret.Created.Size = fi.Size()
	return ret, err
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

type mutationResolver struct{ *Resolver }
