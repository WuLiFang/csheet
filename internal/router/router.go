package router

import (
	"net/http/pprof"
	"os"
	"path"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/WuLiFang/csheet/pkg/api"
	"github.com/WuLiFang/csheet/pkg/filestore"
	"github.com/gin-gonic/gin"
)

func apiHandler() gin.HandlerFunc {
	apiH := handler.NewDefaultServer(api.NewExecutableSchema())
	guiH := playground.Handler("GraphQL", "/api")

	return func(c *gin.Context) {
		if c.Request.Method == "GET" {
			f := c.NegotiateFormat("application/json", "text/html")
			if f == "text/html" {
				guiH.ServeHTTP(c.Writer, c.Request)
				return
			}
		}
		apiH.ServeHTTP(c.Writer, c.Request)

	}
}

// New router
func New() *gin.Engine {
	if os.Getenv("CSHEET_ENV") == "development" {
		gin.SetMode(gin.DebugMode)

	} else {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.New()
	r.Any("api", apiHandler())
	r.Static("static", "dist/static")
	r.Group("").Use(func(c *gin.Context) {
		c.Next()
		c.Header("Cache-Control", "no-cache")
	}).StaticFile("", "dist/index.html")
	r.StaticFile("favicon.ico", "dist/favicon.ico")
	r.Group("files").Use(func(c *gin.Context) {
		c.Next()
		p := path.Join(filestore.Dir, c.Param("filepath"))
		go filestore.SetAccessTime(p, time.Now())
	}).Static("", filestore.Dir)
	if os.Getenv("CSHEET_ENV") == "development" {
		r.Any("debug/pprof/profile", gin.WrapH(pprof.Handler("profile")))
		r.Any("debug/pprof/heap", gin.WrapH(pprof.Handler("heap")))
	}
	return r
}
