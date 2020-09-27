package router

import (
	"context"
	"errors"
	"time"

	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/api"
	"github.com/getsentry/sentry-go"
	"github.com/gin-gonic/gin"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

func apiHandler() gin.HandlerFunc {
	server := handler.NewDefaultServer(api.NewExecutableSchema())
	server.Use(
		extension.AutomaticPersistedQuery{
			Cache: api.QueryCache{TTL: 24 * time.Hour},
		},
	)
	server.SetErrorPresenter(func(ctx context.Context, err error) *gqlerror.Error {
		if errors.Is(err, context.DeadlineExceeded) {
			return &gqlerror.Error{
				Message: err.Error(),
				Extensions: map[string]interface{}{
					"code": "TIMEOUT",
					"locales": map[string]string{
						"zh": "请求超时",
					},
				},
			}
		}
		return graphql.DefaultErrorPresenter(ctx, err)
	})
	server.AroundResponses(func(ctx context.Context, next graphql.ResponseHandler) (ret *graphql.Response) {
		ret = next(ctx)
		if ret != nil && len(ret.Errors) > 0 {
			oc := graphql.GetOperationContext(ctx)

			var hub = logging.For(ctx)
			var scope = hub.PushScope()
			defer hub.PopScope()
			scope.SetTag("mechanism", "graphql")
			scope.SetExtra("query", oc.RawQuery)
			scope.SetExtra("variables", oc.Variables)
			scope.SetExtra("operationName", oc.OperationName)

			for _, err := range ret.Errors {
				hub.CaptureEvent(&sentry.Event{
					Level:   sentry.LevelError,
					Message: err.Message,
					Extra: map[string]interface{}{
						"path":       err.Path,
						"extensions": err.Extensions,
						"locations":  err.Locations,
					},
				})
			}

		}
		return
	})
	gui := playground.Handler("GraphQL", "/api")

	return func(c *gin.Context) {
		if c.Request.Method == "GET" {
			f := c.NegotiateFormat("application/json", "text/html")
			if f == "text/html" {
				gui.ServeHTTP(c.Writer, c.Request)
				return
			}
		}
		server.ServeHTTP(c.Writer, c.Request)

	}
}
