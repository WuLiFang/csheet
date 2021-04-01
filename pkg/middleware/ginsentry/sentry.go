package ginsentry

import (
	"net"
	"os"
	"strings"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/getsentry/sentry-go"
	"github.com/gin-gonic/gin"
)

// Middleware for gin
func Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx = c.Request.Context()
		ctx, hub := logging.With(ctx)
		var scope = hub.PushScope()
		defer hub.PopScope()
		c.Request = c.Request.WithContext(ctx)
		scope.SetRequest(c.Request)
		scope.SetUser(sentry.User{
			IPAddress: c.ClientIP(),
		})
		c.Next()

		defer func() {
			err := recover()
			if err != nil && !isBrokenPipeError(err) {
				hub.RecoverWithContext(ctx, err)
				panic(err)
			}
		}()
	}
}

// Check for a broken connection, as this is what Gin does already
func isBrokenPipeError(err interface{}) bool {
	if netErr, ok := err.(*net.OpError); ok {
		if sysErr, ok := netErr.Err.(*os.SyscallError); ok {
			if strings.Contains(strings.ToLower(sysErr.Error()), "broken pipe") ||
				strings.Contains(strings.ToLower(sysErr.Error()), "connection reset by peer") {
				return true
			}
		}
	}
	return false
}
