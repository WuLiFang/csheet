package router

import (
	"context"
	"net/http"

	// register pprof routes

	"net/http/httputil"
	_ "net/http/pprof"
	"path"
	"time"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/internal/config"
	"github.com/WuLiFang/csheet/v6/pkg/cgteamwork"
	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/WuLiFang/csheet/v6/pkg/filestore"
	"github.com/WuLiFang/csheet/v6/pkg/middleware/cors"
	"github.com/WuLiFang/csheet/v6/pkg/middleware/gincontext"
	"github.com/WuLiFang/csheet/v6/pkg/middleware/ginsentry"
	"github.com/WuLiFang/csheet/v6/pkg/model/file"
	"github.com/WuLiFang/csheet/v6/pkg/model/presentation"
	"github.com/getsentry/sentry-go"
	"github.com/gin-gonic/gin"
)

// New router
func New() *gin.Engine {

	if config.Env == "development" {
		gin.SetMode(gin.DebugMode)

	} else {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.New()
	r.ForwardedByClientIP = config.UseXForwardedFor
	r.Use(
		ginsentry.Middleware(),
		func(ctx *gin.Context) {
			var hub = logging.For(ctx)
			hub.Scope().SetUser(sentry.User{
				IPAddress: ctx.ClientIP(),
			})
			ctx.Next()
		},
		cors.Middleware(config.CORSHosts),
	)
	r.Any("api", gincontext.Middleware(), apiHandler())
	r.Group("").Use(func(c *gin.Context) {
		c.Header("Cache-Control", "public, immutable, max-age=604800")
		c.Next()
	}).Static("static", "dist/static")
	r.Group("").Use(func(c *gin.Context) {
		c.Header("Cache-Control", "no-cache")
		c.Next()
	}).StaticFile("", "dist/index.html")
	r.StaticFile("favicon.ico", "dist/favicon.ico")
	r.Group("files").Use(func(c *gin.Context) {
		var logger = logging.For(c.Request.Context()).Logger("router").Sugar()

		c.Header("Cache-Control", "public, immutable, max-age=604800")
		c.Next()
		c.Header("Cache-Control", "no-store") // when body is empty

		status := c.Writer.Status()
		filepath := c.Param("filepath")[1:]
		switch status {
		case http.StatusNotFound:
			logger.Infow("not found requested file", "filepath", filepath, "clientIP", c.ClientIP())
			go func() {
				f, err := file.FindByPath(filepath)
				if err == nil {
					err = f.Delete(context.Background())
					if err != nil {
						logger.Errorw("delete file from db failed", "file", f)
					}
				} else if err == db.ErrKeyNotFound {
					err = nil
				} else {
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
						err = p.Save(context.Background())
						if err != nil {
							logger.Errorw("save presentation failed", "error", err)
						}
					}
				} else {
					logger.Errorw("find presentation failed", "error", err)
				}
			}()
		case http.StatusNotModified:
			fallthrough
		case http.StatusPartialContent:
			fallthrough
		case http.StatusOK:
			go func() {
				err := filestore.SetAccessTime(path.Join(filestore.Dir, filepath), time.Now())
				if err != nil {
					logger.Errorw("update file atime failed", "error", err)
				}
			}()
		}
	}).Static("", filestore.Dir)
	r.Group("cgteamwork/upload/*_").
		Use(
			gin.WrapH(&httputil.ReverseProxy{
				Director: func(req *http.Request) {
					cgteamwork.DefaultClient.RefreshToken(req.Context())
					req.Host = cgteamwork.DefaultClient.URL.Host
					req.URL.Scheme = cgteamwork.DefaultClient.URL.Scheme
					req.URL.Host = cgteamwork.DefaultClient.URL.Host
					req.URL.Path = req.URL.Path[11:] // remove `/cgteamwork`
					req.Header.Set("Referer", "")
					req.Header.Del("Cookie")
					req.AddCookie(&http.Cookie{
						Name:  "token",
						Value: cgteamwork.DefaultClient.Token,
					})
					if _, ok := req.Header["User-Agent"]; !ok {
						// explicitly disable User-Agent so it's not set to default value
						req.Header.Set("User-Agent", "")
					}
				},
				ModifyResponse: func(resp *http.Response) error {
					return nil
				},
			}),
		).
		GET("").
		HEAD("").
		OPTIONS("")
	if config.Env == "development" {
		r.GET("debug/pprof/*_", gin.WrapF(http.DefaultServeMux.ServeHTTP))
	}
	return r
}
