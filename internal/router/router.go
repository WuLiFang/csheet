package router

import (
	"net/http"
	"net/http/pprof"
	"path"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/WuLiFang/csheet/v6/internal/config"
	"github.com/WuLiFang/csheet/v6/pkg/api"
	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/WuLiFang/csheet/v6/pkg/filestore"
	"github.com/WuLiFang/csheet/v6/pkg/model/file"
	"github.com/WuLiFang/csheet/v6/pkg/model/presentation"
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
				err := filestore.SetAccessTime(path.Join(filestore.Dir, filepath), time.Now())
				if err != nil {
					logger.Errorw("update file atime failed", "error", err)
				}
			case http.StatusNotFound:
				logger.Infow("not found requested file", "filepath", filepath, "clientIP", c.ClientIP())
				f, err := file.FindByPath(filepath)
				if err == nil {
					f.Delete()
				}
				if err == db.ErrKeyNotFound {
					err = nil
				}
				if err != nil {
					logger.Errorw("find file failed", "error", err)
				}

				ps, err := presentation.FindByPath(filepath)
				if err == nil {
					logger.Debugw("try generate missing file", "presentations", ps)
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
				} else {
					logger.Errorw("find presentation failed", "error", err)
				}
			}
		}(status, c.Param("filepath"))
		if status == http.StatusNotFound {
			c.Header("Cache-Control", "no-store")
		}
	}).Static("", filestore.Dir)
	if config.Env == "development" {
		r.Any("debug/pprof/profile", gin.WrapH(pprof.Handler("profile")))
		r.Any("debug/pprof/heap", gin.WrapH(pprof.Handler("heap")))
	}
	return r
}
