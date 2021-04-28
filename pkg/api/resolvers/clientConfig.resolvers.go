package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"strings"

	"github.com/WuLiFang/csheet/v6/pkg/api/generated"
	"github.com/WuLiFang/csheet/v6/pkg/api/models"
	"github.com/WuLiFang/csheet/v6/pkg/cgteamwork"
	"github.com/WuLiFang/csheet/v6/pkg/collector/folder"
	"github.com/WuLiFang/csheet/v6/pkg/getenv"
)

func (r *clientConfigResolver) FolderInclude(ctx context.Context, obj *models.ClientConfig, format *string) ([]string, error) {
	var ret = make([]string, 0, len(obj.FolderInclude))
	for _, i := range obj.FolderInclude {
		ret = append(ret, formatPath(i, format))
	}
	return ret, nil
}

func (r *queryResolver) ClientConfig(ctx context.Context, name string) (*models.ClientConfig, error) {
	var ret = new(models.ClientConfig)
	ret.EnableCGTeamwork = cgteamwork.DefaultClient != nil
	if IssueTrackerURL != "" {
		ret.IssueTrackerURL = &IssueTrackerURL
	}
	ret.FolderInclude = make([]string, 0, len(folder.WalkInclude))
	for _, i := range folder.WalkInclude {
		ret.FolderInclude = append(ret.FolderInclude, i)
	}
	var upperName = strings.ToUpper(name)

	if v := getenv.StringCoalesce(
		[]string{
			"CSHEET_CLIENT_SENTRY_DSN_" + upperName,
			"CSHEET_CLIENT_SENTRY_DSN",
		},
		"",
	); v != "" {
		ret.SentryDsn = &v
	}
	return ret, nil
}

// ClientConfig returns generated.ClientConfigResolver implementation.
func (r *Resolver) ClientConfig() generated.ClientConfigResolver { return &clientConfigResolver{r} }

type clientConfigResolver struct{ *Resolver }
