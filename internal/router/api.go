package router

import (
	"context"

	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/WuLiFang/csheet/v6/pkg/api"
	"github.com/WuLiFang/csheet/v6/pkg/middleware/ginsentry"
	"github.com/getsentry/sentry-go"
	"github.com/gin-gonic/gin"
)

func apiHandler() gin.HandlerFunc {
	server := handler.NewDefaultServer(api.NewExecutableSchema())
	server.AroundResponses(func(ctx context.Context, next graphql.ResponseHandler) (ret *graphql.Response) {
		ret = next(ctx)
		if ret != nil && len(ret.Errors) > 0 {
			if hub, err := ginsentry.Hub(ctx); err == nil {
				hub.WithScope(func(scope *sentry.Scope) {
					scope.SetTag("mechanism", "graphql")
					oc := graphql.GetOperationContext(ctx)
					scope.SetExtra("query", oc.RawQuery)
					scope.SetExtra("variables", oc.Variables)
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
