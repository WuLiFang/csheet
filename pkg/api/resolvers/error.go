package resolvers

import (
	"context"

	"github.com/vektah/gqlparser/v2/gqlerror"
)

// TODO: use https://gqlgen.com/reference/errors/#hooks instead
func formatError(err error) error {
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
	return err
}
