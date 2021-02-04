package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"regexp"

	"github.com/WuLiFang/csheet/v6/pkg/api/generated/model"
	"github.com/WuLiFang/csheet/v6/pkg/db"
)

func (r *queryResolver) CollectionTags(ctx context.Context, regex *string, first *int, last *int, before *string, after *string) (*model.StringConnection, error) {
	pag, err := paginate(first, last, before, after)
	if err != nil {
		return nil, err
	}
	ret := model.StringConnection{PageInfo: &model.PageInfo{}}
	nodes := []*string{}

	var pattern *regexp.Regexp
	if regex != nil {
		pattern, err = regexp.Compile(*regex)
		if err != nil {
			return &ret, err
		}

	}

	// TODO: extract similar code
	filter := func(v string) bool {
		if pattern != nil {
			if pattern.FindString(v) == "" {
				return false
			}
		}
		return true
	}
	err = db.View(func(txn *db.Txn) (err error) {
		opt := db.DefaultIteratorOptions
		opt.Reverse = pag.reverse
		cursor := txn.NewIterator(opt)
		defer cursor.Close()

		var prefix = db.IndexCollectionTag.Key()
		start := prefix
		if pag.reverse {
			start = append(prefix[:], '\xff')
		}

		var isAfter = pag.after == ""
		var lastNode = ""
		for cursor.Seek(start); cursor.ValidForPrefix(prefix); cursor.Next() {
			if pag.limit != 0 && len(nodes) >= pag.limit {
				cursor.Next()
				ret.PageInfo.HasNextPage = cursor.ValidForPrefix(prefix)
				break
			}
			var node string
			_, err = db.UnmarshalKey(cursor.Item().Key(), &node)
			if err != nil {
				return
			}
			if node == lastNode {
				continue
			}
			lastNode = node
			nid := node
			if nid == pag.after {
				isAfter = true
				continue
			}
			if nid == pag.before {
				ret.PageInfo.HasNextPage = true
				break
			}
			if isAfter && filter(node) {
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
		ret.Edges = append(ret.Edges, &model.StringEdge{
			Node:   i,
			Cursor: *i,
		})
	}
	if len(nodes) > 0 {
		var startCursor, endCursor = *nodes[0], *nodes[len(nodes)-1]
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
	return &ret, nil
}
