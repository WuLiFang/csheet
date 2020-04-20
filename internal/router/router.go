package router

import (
	"io"
	"net/http"
	"net/http/pprof"
	"os"
	"path"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/WuLiFang/csheet/internal/config"
	"github.com/WuLiFang/csheet/pkg/api"
	"github.com/WuLiFang/csheet/pkg/filestore"
	"github.com/WuLiFang/csheet/pkg/model/file"
	"github.com/WuLiFang/csheet/pkg/model/presentation"
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
	if config.Env == "development" {
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
		status := c.Writer.Status()
		go func(status int, filepath string) {
			if filepath[0] == '/' {
				filepath = filepath[1:]
			}
			switch status {
			case http.StatusOK:
				fallthrough
			case http.StatusNotModified:
				filestore.SetAccessTime(path.Join(filestore.Dir, filepath), time.Now())
			case http.StatusNotFound:
				f, err := file.FindByPath(filepath)
				if err == nil {
					f.Delete()
				}
				ps, err := presentation.FindByPath(filepath)
				if err == nil {
					for _, p := range ps {
						if p.Thumb == filepath {
							p.Thumb = ""
							p.ThumbSuccessTag = ""
						}
						if p.Regular == filepath {
							p.Regular = ""
							p.RegularSuccessTag = ""
						}
						p.Save()
					}
				}
			}
		}(status, c.Param("filepath"))
		if status == http.StatusNotFound {

			c.Header("Content-Type", "image/svg+xml")
			c.Header("Cache-Control", "no-store")
			d, err := os.Open("dist/static/default.svg")
			if err != nil {
				return
			}
			defer d.Close()
			io.Copy(c.Writer, d)
		}
	}).Static("", filestore.Dir)
	if config.Env == "development" {
		r.Any("debug/pprof/profile", gin.WrapH(pprof.Handler("profile")))
		r.Any("debug/pprof/heap", gin.WrapH(pprof.Handler("heap")))
	}
	return r
}
