package apperror

import (
	"context"
	"errors"

	"github.com/WuLiFang/csheet/v6/pkg/cgteamwork"
)

// As try convert any error to target, return true if converted.
func As(err error, target **AppError) bool {
	if errors.Is(err, context.DeadlineExceeded) {
		*target = ErrTimeout
		return true
	}

	var apiError = new(cgteamwork.APIError)
	if errors.As(err, apiError) {
		if apiError.IsLoginFailed() {
			*target = ErrCGTeamworkLoginFailed
			return true
		}
		if apiError.IsUnauthenticated() {
			*target = ErrCGTeamworkUnauthenticated
			return true
		}
		if apiError.IsUnauthorized() {
			*target = ErrCGTeamworkUnauthorized
			return true
		}
	}
	if errors.Is(err, cgteamwork.ErrNotConfigured) {
		*target = ErrCGTeamworkNotConfigured
		return true
	}

	return false
}
