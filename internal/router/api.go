package router

import (
	"context"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/apollotracing"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/internal/config"
	"github.com/WuLiFang/csheet/v6/pkg/api"
	"github.com/WuLiFang/csheet/v6/pkg/apperror"
	"github.com/WuLiFang/csheet/v6/pkg/middleware/gincontext"
	"github.com/getsentry/sentry-go"
	"github.com/gin-gonic/gin"
	"github.com/vektah/gqlparser/v2/gqlerror"
	"go.uber.org/zap"
)

func apiHandler() gin.HandlerFunc {

	server := handler.New(api.NewExecutableSchema())
	if config.APITracingEnabled {
		server.Use(apollotracing.Tracer{})
	}
	ws := transport.Websocket{}
	ws.KeepAlivePingInterval = 10 * time.Second
	ws.Upgrader.CheckOrigin = func(r *http.Request) bool {
		origin := r.Header["Origin"]
		if len(origin) == 0 {
			return true
		}
		u, err := url.Parse(origin[0])
		if err != nil {
			return false
		}
		if strings.EqualFold(u.Host, r.Host) {
			return true
		}
		for _, i := range config.CORSHosts {
			if strings.EqualFold(i, u.Host) {
				return true
			}
		}
		return false
	}
	server.AddTransport(ws)
	server.AddTransport(transport.Options{})
	server.AddTransport(transport.GET{})
	server.AddTransport(transport.POST{})
	server.AddTransport(transport.MultipartForm{})

	server.SetQueryCache(lru.New(1000))

	server.Use(api.Issue1369Fix{})
	server.Use(extension.Introspection{})
	server.Use(
		extension.AutomaticPersistedQuery{
			Cache: api.QueryCache{TTL: 24 * time.Hour},
		},
	)
	server.SetErrorPresenter(func(ctx context.Context, err error) *gqlerror.Error {
		var e *apperror.AppError
		if apperror.As(err, &e) {
			return e.GQLError()
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
	server.AroundResponses(func(ctx context.Context, next graphql.ResponseHandler) (ret *graphql.Response) {
		ret = next(ctx)
		if ret == nil {
			return
		}

		oc := graphql.GetOperationContext(ctx)
		if oc != nil && oc.Operation != nil && oc.Operation.Operation == "mutation" {
			clientIP := ""
			if gc := gincontext.FromContext(ctx); gc != nil {
				clientIP = gc.ClientIP()
			}
			fields := []zap.Field{
				zap.String("operationName", oc.Operation.Name),
				zap.String("clientIP", clientIP),
				zap.Duration("elapsed", time.Since(oc.Stats.OperationStart)),
			}
			if ret != nil && len(ret.Errors) > 0 {
				fields = append(fields, zap.Error(ret.Errors))
			}
			logging.For(ctx).Logger("router.api").Info(
				"mutate",
				fields...,
			)
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
