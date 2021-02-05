package resolvers

import (
	"context"
	"sync"

	"github.com/99designs/gqlgen/graphql"
	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/middleware/gincontext"
	"github.com/WuLiFang/csheet/v6/pkg/unipath"
	"go.uber.org/zap"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

// Resolver type
type Resolver struct{}

var nextSubscriptionIndex = 0
var nextSubscriptionIndexMu = new(sync.Mutex)

func subscriptionIndex() int {
	nextSubscriptionIndexMu.Lock()
	defer nextSubscriptionIndexMu.Unlock()

	ret := nextSubscriptionIndex
	nextSubscriptionIndex++
	return ret
}

func dereferenceBool(v *bool) bool {
	if v != nil {
		return *v
	}
	return false
}

func formatPath(v string, format *string) string {
	var f string
	if format != nil {
		f = *format
	}
	switch f {
	case "windows":
		return unipath.Windows(v)
	case "unix":
		return unipath.Unix(v)
	default:
		return unipath.Auto(v)
	}
}

func getLogger(ctx context.Context) *zap.Logger {
	gc := gincontext.FromContext(ctx)
	var clientIP = ""
	if gc != nil {
		clientIP = gc.ClientIP()
	}
	var path = ""
	fc := graphql.GetFieldContext(ctx)
	if fc != nil {
		path = fc.Object + "." + fc.Path().String()
	}

	return logging.Logger("api").With(
		zap.String("path", path),
		zap.String("clientIP", clientIP),
	)
}
