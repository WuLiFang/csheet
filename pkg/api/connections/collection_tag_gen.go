// Code generated from resolve.go.gotmpl, DO NOT EDIT.

package connections

import (
	"context"

	"github.com/WuLiFang/csheet/v6/pkg/api/models"
	"github.com/WuLiFang/csheet/v6/pkg/db"
)

func resolveCollectionTagConnection(
	ctx context.Context,
	prefix []byte,
	filter func(v *string) (bool, error),
	first, last *int,
	after, before *string,
) (ret *models.StringConnection, err error) {
	pag, err := paginate(first, last, before, after)
	if err != nil {
		return nil, err
	}

	ret = new(models.StringConnection)
	ret.PageInfo = new(models.PageInfo)
    var lastNodeValue string

	err = db.View(func(txn *db.Txn) (err error) {
		opt := db.DefaultIteratorOptions
		opt.Reverse = pag.reverse
		cur := txn.NewIterator(opt)
		defer cur.Close()
		start := prefix
		if pag.reverse {
			start = append(prefix[:], '\xff')
		}

		var isAfter = pag.after == ""
		for cur.Seek(start); cur.ValidForPrefix(prefix); cur.Next() {
			if pag.limit != 0 && len(ret.Edges) >= pag.limit {
				cur.Next()
				ret.PageInfo.HasNextPage = cur.ValidForPrefix(prefix)
				break
			}
			var item = cur.Item()
            var nodeValue = ""
            _, err = db.UnmarshalKey(item.Key(), &nodeValue)
            if err != nil {
                return
            }
            if nodeValue == lastNodeValue {
                continue
            }
            var node = &nodeValue
            lastNodeValue = nodeValue
            nodeCursor := nodeValue
			if nodeCursor == pag.after {
				isAfter = true
				continue
			}
			if nodeCursor == pag.before {
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
				ret.Edges = append(ret.Edges, &models.StringEdge{
					Node:   node,
					Cursor: nodeCursor,
				})
			} else {
				ret.PageInfo.HasPreviousPage = true
			}
		}
		return
	})
	if err != nil {
		return nil, err
	}
	if len(ret.Edges) > 0 {
		var startCursor, endCursor = ret.Edges[0].Cursor, ret.Edges[len(ret.Edges)-1].Cursor
		ret.PageInfo.StartCursor = &startCursor
		ret.PageInfo.EndCursor = &endCursor
	}
	if pag.reverse {
		for i := 0; i < len(ret.Edges)/2; i++ {
			j := len(ret.Edges) - 1 - i
			ret.Edges[i], ret.Edges[j] = ret.Edges[j], ret.Edges[i]
		}
		ret.PageInfo.HasNextPage, ret.PageInfo.HasPreviousPage = ret.PageInfo.HasPreviousPage, ret.PageInfo.HasNextPage
		ret.PageInfo.StartCursor, ret.PageInfo.EndCursor = ret.PageInfo.EndCursor, ret.PageInfo.StartCursor
	}
	if len(ret.Edges) > 0 {
		ret.Nodes = make([]*string, 0, len(ret.Edges))
	}
	for _, edge := range ret.Edges {
		ret.Nodes = append(ret.Nodes, edge.Node)
	}

	return ret, nil
}
