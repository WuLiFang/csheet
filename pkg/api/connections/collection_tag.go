package connections

import (
	"context"
	"regexp"

	"github.com/WuLiFang/csheet/v6/pkg/api/models"
	"github.com/WuLiFang/csheet/v6/pkg/db"
)

// CollectionTag connection from db.
func CollectionTag(ctx context.Context, regex *string, first *int, last *int, before *string, after *string) (ret *models.StringConnection, err error) {
	var pattern *regexp.Regexp
	if regex != nil {
		pattern, err = regexp.Compile(*regex)
		if err != nil {
			return
		}
	}
	return resolveCollectionTagConnection(ctx, db.IndexCollectionTag.Key(), func(v *string) (bool, error) {
		if v == nil {
			return false, nil
		}
		if pattern != nil {
			if pattern.FindString(*v) == "" {
				return false, nil
			}
		}
		return true, nil
	}, first, last, after, before)
}
