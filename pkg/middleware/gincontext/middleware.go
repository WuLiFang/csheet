package gincontext

import (
	"context"

	"github.com/gin-gonic/gin"
)

type contextKey struct{}

var key = new(contextKey)

// Middleware for gin
func Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := context.WithValue(c.Request.Context(), key, c)
		c.Request = c.Request.WithContext(ctx)
		c.Next()
	}
}

// FromContext get gin.Context
func FromContext(ctx context.Context) *gin.Context {
	ginContext := ctx.Value(key)
	if ginContext == nil {
		return nil
	}

	gc, ok := ginContext.(*gin.Context)
	if !ok {
		return nil
	}
	return gc
}
