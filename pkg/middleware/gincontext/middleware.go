package gincontext

import (
	"context"
	"fmt"

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
func FromContext(ctx context.Context) (*gin.Context, error) {
	ginContext := ctx.Value(key)
	if ginContext == nil {
		err := fmt.Errorf("could not retrieve gin.Context")
		return nil, err
	}

	gc, ok := ginContext.(*gin.Context)
	if !ok {
		err := fmt.Errorf("gin.Context has wrong type")
		return nil, err
	}
	return gc, nil
}
