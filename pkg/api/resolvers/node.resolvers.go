package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"encoding/base64"
	"errors"

	"github.com/WuLiFang/csheet/pkg/api/generated/model"
	"github.com/WuLiFang/csheet/pkg/db"
	"github.com/WuLiFang/csheet/pkg/model/collection"
	"github.com/WuLiFang/csheet/pkg/model/event/collected"
	"github.com/WuLiFang/csheet/pkg/model/presentation"
)

func (r *queryResolver) Node(ctx context.Context, id string) (model.Node, error) {
	key, err := base64.RawURLEncoding.DecodeString(id)
	if err != nil {
		return nil, err
	}
	index, err := db.UnmarshalKey(key)

	switch index {
	case db.IndexCollectedEvent:
		return collected.FindByID(id)
	case db.IndexCollection:
		return collection.FindByID(id)
	case db.IndexPresentation:
		return presentation.FindByID(id)
	}
	return nil, errors.New("unsupported id format")
}
