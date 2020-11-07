package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"os"

	"github.com/WuLiFang/csheet/v6/internal/config"
	"github.com/WuLiFang/csheet/v6/pkg/api/generated/model"
	"github.com/WuLiFang/csheet/v6/pkg/cgteamwork"
)

func (r *queryResolver) ClientConfig(ctx context.Context, name string) (*model.ClientConfig, error) {
	var ret = new(model.ClientConfig)
	ret.EnableCGTeamwork = cgteamwork.DefaultClient != nil
	if config.IssueTrackerURL != "" {
		ret.IssueTrackerURL = &config.IssueTrackerURL
	}
	switch name {
	case "web":
		if sentryDSN, ok := os.LookupEnv("CSHEET_WEB_SENTRY_DSN"); ok {
			ret.SentryDsn = &sentryDSN
		}
	}
	return ret, nil
}
