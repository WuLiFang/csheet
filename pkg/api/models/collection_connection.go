package models

import (
	"context"
	"fmt"
	"sort"
	"sync"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/WuLiFang/csheet/v6/pkg/models/collection"
	"go.uber.org/zap"
)

// CollectionConnection return type
type CollectionConnection struct {
	Edges        []*CollectionEdge        `json:"edges"`
	Nodes        []*collection.Collection `json:"nodes"`
	PageInfo     *PageInfo                `json:"pageInfo"`
	Prefix       []byte
	Filter       func(v *collection.Collection) (ret bool, err error)
	fullScanMu   sync.Mutex
	fullScanDone bool
	totalCount   int
	tagCount     []CollectionTagCount
}

func (c *CollectionConnection) fullScan(ctx context.Context) (err error) {
	c.fullScanMu.Lock()
	defer c.fullScanMu.Unlock()
	if c.fullScanDone {
		return
	}
	if c.Prefix == nil {
		err = fmt.Errorf("models.CollectionConnection: fullScan: prefix not defined")
		return
	}
	var totalCount int
	var tagCountMap = make(map[string]int)
	err = db.View(func(txn *db.Txn) (err error) {
		opt := db.DefaultIteratorOptions
		cur := txn.NewIterator(opt)
		defer cur.Close()
		start := c.Prefix

		for cur.Seek(start); cur.ValidForPrefix(c.Prefix); cur.Next() {
			var item = cur.Item()
			var node = new(collection.Collection)
			var pk string
			pk, err = txn.PrimaryKey(item.Key())
			if err != nil {
				return
			}
			if pk == string(item.Key()) {
				err = item.Value(func(val []byte) error {
					return db.UnmarshalValue(val, node)
				})
			} else {
				err = txn.Get(db.IndexCollection.Key(pk), node)
			}
			if err == db.ErrKeyNotFound {
				var logger = logging.For(ctx).Logger("connections").With(
					zap.String("func", "resolveCollectionConnection"),
				)
				var key = item.KeyCopy(nil)
				logger.Warn(
					"ignore outdated secondary key",
					zap.Binary("key", key),
					zap.Binary("prefix", c.Prefix),
				)
				continue
			}
			if err != nil {
				return
			}
			if c.Filter != nil {
				var match bool
				match, err = c.Filter(node)
				if err != nil {
					return
				}
				if !match {
					continue
				}
			}
			totalCount++
			for _, tag := range node.Tags {
				tagCountMap[tag]++
			}
		}
		return
	})
	if err != nil {
		return
	}
	c.totalCount = totalCount
	var tagCount = make([]CollectionTagCount, 0, len(tagCountMap))
	for k, v := range tagCountMap {
		tagCount = append(tagCount, CollectionTagCount{
			Tag:   k,
			Count: v,
		})
	}
	c.tagCount = tagCount
	sort.SliceStable(tagCount, func(i, j int) bool {
		return tagCount[i].Tag < tagCount[j].Tag
	})
	c.fullScanDone = true
	return
}

// TotalCount for matched collection
func (c *CollectionConnection) TotalCount(ctx context.Context) (ret int, err error) {
	err = c.fullScan(ctx)
	if err != nil {
		return
	}
	ret = c.totalCount
	return
}

// TagCount for matched collection
func (c *CollectionConnection) TagCount(ctx context.Context) (ret []CollectionTagCount, err error) {
	err = c.fullScan(ctx)
	if err != nil {
		return
	}
	ret = c.tagCount
	return
}
