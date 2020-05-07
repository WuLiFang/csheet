package ginsentry

import (
	"context"

	"github.com/WuLiFang/csheet/v6/pkg/middleware/gincontext"
	"github.com/getsentry/sentry-go"
	sentrygin "github.com/getsentry/sentry-go/gin"
	"github.com/gin-gonic/gin"
)

// Middleware send error during request handing to sentry.
func Middleware() gin.HandlerFunc {
	return sentrygin.New(sentrygin.Options{})
}

// GinContextHub from gin.Context
var GinContextHub = sentrygin.GetHubFromContext

// ContextHub from context.Context
func ContextHub(ctx context.Context) *sentry.Hub {
	ginContext := gincontext.FromContext(ctx)
	if ginContext == nil {
		return nil
	}
	return GinContextHub(ginContext)
}
