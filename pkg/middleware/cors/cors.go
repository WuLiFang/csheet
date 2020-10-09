package cors

import (
	"net/url"
	"strings"

	"github.com/gin-gonic/gin"
	cors "github.com/rs/cors/wrapper/gin"
)

// Middleware for gin
func Middleware(allowedHosts []string) gin.HandlerFunc {
	return cors.New(
		cors.Options{
			AllowOriginFunc: func(origin string) bool {
				u, err := url.Parse(origin)
				if err != nil {
					return false
				}
				for _, i := range allowedHosts {
					if strings.EqualFold(i, u.Host) {
						return true
					}
				}
				return false
			},
			MaxAge:             43200,
			OptionsPassthrough: true,
		},
	)
}
