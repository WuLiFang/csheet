package resolvers

import (
	"context"

	"github.com/vektah/gqlparser/v2/gqlerror"
)

func formatError(err error) *gqlerror.Error {
	if err, ok := err.(*gqlerror.Error); ok {
		return err
	}
	if err == context.DeadlineExceeded {
		return &gqlerror.Error{
			Message: err.Error(),
			Extensions: map[string]interface{}{
				"code": "TIMEOUT",
				"locales": map[string]string{
					"zh": "请求超时",
				},
			},
		}
	}
	return &gqlerror.Error{
		Message: err.Error(),
	}
}
