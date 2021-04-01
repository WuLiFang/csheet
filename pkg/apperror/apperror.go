// Package apperror contains app specific error
package apperror

import (
	"errors"
	"fmt"

	"github.com/vektah/gqlparser/v2/gqlerror"
)

// AppError that defined in application scope.
type AppError struct {
	Code       string
	Message    string
	Locales    map[string]string
	Extensions map[string]interface{}
}

func (e *AppError) Error() string {
	return e.Message
}

// GQLError from app error
func (e AppError) GQLError() *gqlerror.Error {
	var extensions = make(map[string]interface{})
	for k, v := range e.Extensions {
		extensions[k] = v
	}
	extensions["locales"] = e.Locales
	extensions["code"] = e.Code
	return &gqlerror.Error{
		Message:    e.Message,
		Extensions: extensions,
	}
}

// ErrTimeout when request timeout.
var ErrTimeout = &AppError{
	Message: "request timeout",
	Code:    "TIMEOUT",
	Locales: map[string]string{
		"zh": "请求超时",
	},
}

// NewErrCGTeamworkCollectOverTaskLimit create a error
func NewErrCGTeamworkCollectOverTaskLimit(current, max int) error {
	return &AppError{
		Message: fmt.Sprintf("select match %d tasks, max allowed value is %d", current, max),
		Code:    "CGTEAMWORK_COLLECT_OVER_TASK_LIMIT",
		Locales: map[string]string{
			"zh": fmt.Sprintf("所选条件匹配 %d 任务, 允许的最大值为 %d", current, max),
		},
	}
}

// NewErrCGTeamworkPipelineNotFound create a error
func NewErrCGTeamworkPipelineNotFound(name string) error {
	return &AppError{
		Message: fmt.Sprintf("pipeline not found: %s", name),
		Code:    "CGTEAMWORK_PIPELINE_NOT_FOUND",
		Locales: map[string]string{
			"zh": fmt.Sprintf("找不到流程: %s", name),
		},
	}
}

// ErrCGTeamworkLoginFailed when cgteamwork login failed
var ErrCGTeamworkLoginFailed = &AppError{
	Message: "cgteamwork login failed",
	Code:    "CGTEAMWORK_LOGIN_FAILED",
	Locales: map[string]string{
		"zh": fmt.Sprintf("CGTeamwork 登录失败"),
	},
}

// ErrCGTeamworkUnauthenticated when cgteamwork login required
var ErrCGTeamworkUnauthenticated = &AppError{
	Message: "cgteamwork unauthenticated",
	Code:    "CGTEAMWORK_UNAUTHENTICATED",
	Locales: map[string]string{
		"zh": fmt.Sprintf("CGTeamwork 未登录"),
	},
}

// ErrCGTeamworkUnauthorized when cgteamwork permission required
var ErrCGTeamworkUnauthorized = &AppError{
	Message: "cgteamwork unauthorized",
	Code:    "CGTEAMWORK_UNAUTHORIZED",
	Locales: map[string]string{
		"zh": fmt.Sprintf("CGTeamwork 未授权"),
	},
}

// ErrCGTeamworkNotConfigured when cgteamwork not configured
var ErrCGTeamworkNotConfigured = &AppError{
	Message: "cgteamwork not configured",
	Code:    "CGTEAMWORK_NOT_CONFIGURED",
	Locales: map[string]string{
		"zh": fmt.Sprintf("CGTeamwork 未配置"),
	},
}

// ErrCode returns code for error, empty string when not found.
func ErrCode(err error) string {
	var appErr *AppError
	if As(err, &appErr) {
		return appErr.Code
	}
	var gqlErr *gqlerror.Error
	if errors.As(err, &gqlErr) {
		if code, ok := gqlErr.Extensions["code"]; ok {
			if v, ok := code.(string); ok {
				return v
			}
		}
	}
	return ""
}
