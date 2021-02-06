package connections

import (
	"context"
	"strings"

	"github.com/WuLiFang/csheet/v6/pkg/api/models"
	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/WuLiFang/csheet/v6/pkg/models/collection"
	"github.com/WuLiFang/csheet/v6/pkg/util"
)

// MatchCollection with condition
func MatchCollection(v *collection.Collection, originPrefix *string, presentationCountGt *int, tagOr, tagAnd []string) (bool, error) {
	if v == nil {
		return false, nil
	}
	if originPrefix != nil && !strings.HasPrefix(v.Origin, *originPrefix) {
		return false, nil
	}
	if presentationCountGt != nil && len(v.PresentationIDs) <= *presentationCountGt {
		return false, nil
	}
	if tagAnd != nil || tagOr != nil {
		var tagSet = util.StringSet(v.Tags)
		if tagAnd != nil {
			for _, i := range tagAnd {
				if _, ok := tagSet[i]; !ok {
					return false, nil
				}
			}
		}
		if tagOr != nil {
			var match = false
			for _, i := range tagOr {
				if _, ok := tagSet[i]; ok {
					match = true
					break
				}
			}
			if !match {
				return false, nil
			}
		}
	}

	return true, nil
}

// Collection connection from db.
func Collection(
	ctx context.Context,
	originPrefix *string,
	presentationCountGt *int,
	tagOr []string,
	tagAnd []string,
	first *int,
	last *int,
	before *string,
	after *string,
) (ret *models.CollectionConnection, err error) {
	var prefix []byte
	if originPrefix != nil {
		prefix = db.IndexCollectionOrigin.Key(*originPrefix)
	} else if len(tagAnd) > 0 {
		prefix = db.IndexCollectionTag.Key(tagAnd[0])
	} else if len(tagOr) == 1 {
		prefix = db.IndexCollectionTag.Key(tagOr[0])
	} else {
		prefix = db.IndexCollection.Key()
	}
	var filter = func(v *collection.Collection) (bool, error) {
		return MatchCollection(v, originPrefix, presentationCountGt, tagOr, tagAnd)
	}
	ret, err = resolveCollectionConnection(ctx, prefix, filter, first, last, after, before)
	if err != nil {
		return
	}
	ret.Prefix = prefix
	ret.Filter = filter
	return
}
