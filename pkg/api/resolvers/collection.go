package resolvers

import (
	"strings"

	"github.com/WuLiFang/csheet/v6/pkg/models/collection"
)

func filterCollection(v *collection.Collection, originPrefix *string, presentationCountGt *int, tagAnd, tagOr []string) bool {
	if v == nil {
		return false
	}
	if originPrefix != nil && !strings.HasPrefix(v.Origin, *originPrefix) {
		return false
	}
	if presentationCountGt != nil && len(v.PresentationIDs) <= *presentationCountGt {
		return false
	}
	if tagAnd != nil || tagOr != nil {
		var tagSet = stringSet(v.Tags)
		if tagAnd != nil {
			for _, i := range tagAnd {
				if _, ok := tagSet[i]; !ok {
					return false
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
				return false
			}
		}
	}

	return true
}
