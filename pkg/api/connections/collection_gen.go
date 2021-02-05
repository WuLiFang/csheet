// Code generated from resolve.go.gotmpl, DO NOT EDIT.

package connections

import (
	"context"

	"github.com/WuLiFang/csheet/v6/pkg/api/models"
	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"go.uber.org/zap"
	pkg1 "github.com/WuLiFang/csheet/v6/pkg/models/collection"
)

func resolveCollectionConnection(
	ctx context.Context,
	prefix []byte,
	filter func(v *pkg1.Collection) (bool, error),
	first, last *int,
	after, before *string,
) (ret *models.CollectionConnection, err error) {
	pag, err := paginate(first, last, before, after)
	if err != nil {
		return nil, err
	}

	var nodes []*pkg1.Collection
	ret = new(models.CollectionConnection)
	ret.PageInfo = new(models.PageInfo)
	index, err := db.UnmarshalKey(prefix)
	if err != nil {
		return
	}
	var useSecondaryIndex = index != db.IndexCollection

	err = db.View(func(txn *db.Txn) (err error) {
		opt := db.DefaultIteratorOptions
		opt.Reverse = pag.reverse
		cursor := txn.NewIterator(opt)
		defer cursor.Close()
		start := prefix
		if pag.reverse {
			start = append(prefix[:], '\xff')
		}

		var isAfter = pag.after == ""
		for cursor.Seek(start); cursor.ValidForPrefix(prefix); cursor.Next() {
			if pag.limit != 0 && len(nodes) >= pag.limit {
				cursor.Next()
				ret.PageInfo.HasNextPage = cursor.ValidForPrefix(prefix)
				break
			}
			var item = cursor.Item()
			node := new(pkg1.Collection)
			if useSecondaryIndex {
				var pk string
				pk, err = txn.PrimaryKey(item.Key())
				if err != nil {
					return
				}
				err = txn.Get(db.IndexCollection.Key(pk), node)
				if err == db.ErrKeyNotFound {
					var logger = logging.For(ctx).Logger("connections").With(
						zap.String("func", "resolveCollectionConnection"),
					)
					var key = item.KeyCopy(nil)
					logger.Warn(
						"ignore outdated secondary key",
						zap.Binary("key", key),
						zap.Binary("prefix", prefix),
					)
					continue
				}
			} else {
				err = cursor.Item().Value(func(v []byte) error {
					return db.UnmarshalValue(v, node)
				})
			}
			if err != nil {
				return
			}
			nid := node.ID()
			if nid == pag.after {
				isAfter = true
				continue
			}
			if nid == pag.before {
				ret.PageInfo.HasNextPage = true
				break
			}
			var match bool
			match, err = filter(node)
			if err != nil {
				return
			}
			if !match {
				continue
			}
			if isAfter {
				nodes = append(nodes, node)
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
		ret.Edges = append(ret.Edges, &models.CollectionEdge{
			Node:   i,
			Cursor: i.ID(),
		})
	}
	if len(nodes) > 0 {
		var startCursor, endCursor = nodes[0].ID(), nodes[len(nodes)-1].ID()
		ret.PageInfo.StartCursor = &startCursor
		ret.PageInfo.EndCursor = &endCursor
	}
	if pag.reverse {
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

	return ret, nil
}
