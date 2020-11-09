// Package apperror contains app specific error
package apperror

import (
	"fmt"

	"github.com/vektah/gqlparser/v2/gqlerror"
)

// AppError is a alias to gqlerror.Error
type AppError = gqlerror.Error

// ErrTimeout when request timeout.
var ErrTimeout = &AppError{
	Message: "request timeout",
	Extensions: map[string]interface{}{
		"code": "TIMEOUT",
		"locales": map[string]string{
			"zh": "请求超时",
		},
	},
}

// NewErrCGTeamworkCollectOverTaskLimit create a error
func NewErrCGTeamworkCollectOverTaskLimit(current, max int) error {
	return &AppError{
		Message: fmt.Sprintf("select match %d tasks, max allowed value is %d", current, max),
		Extensions: map[string]interface{}{
			"code": "CGTEAMWORK_COLLECT_OVER_TASK_LIMIT",
			"locales": map[string]string{
				"zh": fmt.Sprintf("所选条件匹配 %d 任务, 允许的最大值为 %d", current, max),
			},
		},
	}
}

// ErrCGTeamworkLoginFailed when cgteamwork login failed
var ErrCGTeamworkLoginFailed = &AppError{
	Message: "cgteamwork login failed",
	Extensions: map[string]interface{}{
		"code": "CGTEAMWORK_LOGIN_FAILED",
		"locales": map[string]string{
			"zh": fmt.Sprintf("CGTeamwork 登录失败"),
		},
	},
}

// ErrCGTeamworkUnauthenticated when cgteamwork login required
var ErrCGTeamworkUnauthenticated = &AppError{
	Message: "cgteamwork unauthenticated",
	Extensions: map[string]interface{}{
		"code": "CGTEAMWORK_UNAUTHENTICATED",
		"locales": map[string]string{
			"zh": fmt.Sprintf("CGTeamwork 未登录"),
		},
	},
}

// ErrCGTeamworkUnauthorized when cgteamwork permission required
var ErrCGTeamworkUnauthorized = &AppError{
	Message: "cgteamwork unauthorized",
	Extensions: map[string]interface{}{
		"code": "CGTEAMWORK_UNAUTHORIZED",
		"locales": map[string]string{
			"zh": fmt.Sprintf("CGTeamwork 未授权"),
		},
	},
}

// ErrCGTeamworkNotConfigured when cgteamwork not configured
var ErrCGTeamworkNotConfigured = &AppError{
	Message: "cgteamwork not configured",
	Extensions: map[string]interface{}{
		"code": "CGTEAMWORK_NOT_CONFIGURED",
		"locales": map[string]string{
			"zh": fmt.Sprintf("CGTeamwork 未配置"),
		},
	},
}
