package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/WuLiFang/csheet/pkg/api/generated/model"
	"github.com/WuLiFang/csheet/pkg/db"
	"github.com/WuLiFang/csheet/pkg/model/collection"
)

func (r *queryResolver) Collections(ctx context.Context, originPrefix *string, first *int, last *int, before *string, after *string) (*model.CollectionConnection, error) {
	cCtx, err := setupConnectionContext(first, last, before, after)
	if err != nil {
		return nil, err
	}
	ret := model.CollectionConnection{PageInfo: &model.PageInfo{}}
	nodes := []*collection.Collection{}
	err = db.View(func(txn *db.Txn) (err error) {
		opt := db.DefaultIteratorOptions
		opt.Reverse = cCtx.reverse
		cursor := txn.NewIterator(opt)
		defer cursor.Close()
		var prefix []byte
		var useSecondaryIndex bool
		if originPrefix != nil {
			prefix = db.IndexCollectionOrigin.Prefix(*originPrefix)
			useSecondaryIndex = true
		} else {
			prefix = db.IndexCollection.Bytes()
		}
		start := prefix
		if cCtx.reverse {
			start = append(prefix[:], '\xff')
		}

		var isAfter = cCtx.after == ""
		for cursor.Seek(start); cursor.ValidForPrefix(prefix); cursor.Next() {

			if cCtx.limit != 0 && len(nodes) >= cCtx.limit {
				cursor.Next()
				ret.PageInfo.HasNextPage = cursor.ValidForPrefix(prefix)
				break
			}
			var node collection.Collection
			if useSecondaryIndex {
				var pk string
				err = cursor.Item().Value(func(v []byte) error {
					return db.UnmarshalValue(v, &pk)
				})
				if err == nil {
					err = txn.Get(db.IndexCollection.Key(pk), &node)
				}
			} else {
				err = cursor.Item().Value(func(v []byte) error {
					return db.UnmarshalValue(v, &node)
				})
			}
			if err != nil {
				return
			}
			nid := node.ID()
			if nid == cCtx.after {
				isAfter = true
				continue
			}
			if nid == cCtx.before {
				ret.PageInfo.HasNextPage = true
				break
			}
			if isAfter {
				nodes = append(nodes, &node)
			} else {
				ret.PageInfo.HasPreviousPage = true
			}
		}
		return
	})
	if err != nil {
		return nil, err
	}
	ret.Nodes = nodes
	for _, i := range ret.Nodes {
		ret.Edges = append(ret.Edges, &model.CollectionEdge{
			Node:   i,
			Cursor: i.ID(),
		})
	}
	if len(nodes) > 0 {
		var startCursor, endCursor = nodes[0].ID(), nodes[len(nodes)-1].ID()
		ret.PageInfo.StartCursor = &startCursor
		ret.PageInfo.EndCursor = &endCursor
	}
	if cCtx.reverse {
		for i := 0; i < len(ret.Nodes)/2; i++ {
			j := len(ret.Nodes) - 1 - i
			ret.Nodes[i], ret.Nodes[j] = ret.Nodes[j], ret.Nodes[i]
		}
		for i := 0; i < len(ret.Edges)/2; i++ {
			j := len(ret.Edges) - 1 - i
			ret.Edges[i], ret.Edges[j] = ret.Edges[j], ret.Edges[i]
		}
		ret.PageInfo.HasNextPage, ret.PageInfo.HasPreviousPage = ret.PageInfo.HasPreviousPage, ret.PageInfo.HasNextPage
		ret.PageInfo.StartCursor, ret.PageInfo.EndCursor = ret.PageInfo.EndCursor, ret.PageInfo.StartCursor
	}
	return &ret, err
}
