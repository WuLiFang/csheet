package ginsentry

import (
	"context"
	"errors"

	"github.com/WuLiFang/csheet/v6/pkg/middleware/gincontext"
	"github.com/getsentry/sentry-go"
	sentrygin "github.com/getsentry/sentry-go/gin"
	"github.com/gin-gonic/gin"
)

// Middleware send error during request handing to sentry.
func Middleware() gin.HandlerFunc {
	return sentrygin.New(sentrygin.Options{})
}

// Hub from context.Context
func Hub(ctx context.Context) (*sentry.Hub, error) {
	ginContext, err := gincontext.FromContext(ctx)
	if err != nil {
		return nil, err
	}
	hub := sentrygin.GetHubFromContext(ginContext)
	if hub == nil {
		return nil, errors.New("no sentry hub for this context")
	}
	return hub, nil
}
