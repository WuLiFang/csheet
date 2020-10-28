package cgteamwork

import (
	"errors"
	"fmt"
)

// APIError returned when api call failed.
type APIError struct {
	Message string
}

func (e APIError) localMessage() string {
	msg := e.Message
	switch msg {
	case "please login!!!":
		msg = "unauthenticated"
	case "work_flow::python_update_flow, no permission to qc":
		msg = "unauthorized"
	case "token::login, get account data error":
		msg = "login failed"
	}
	return msg
}

func (e APIError) Error() string {
	return fmt.Sprintf("cgteamwork: %s", e.localMessage())
}

// IsUnauthenticated error
func (e APIError) IsUnauthenticated() bool {
	return e.localMessage() == "unauthenticated"
}

// IsUnauthorized error
func (e APIError) IsUnauthorized() bool {
	return e.localMessage() == "unauthorized"
}

// IsLoginFailed error
func (e APIError) IsLoginFailed() bool {
	return e.localMessage() == "login failed"
}

// ErrEmptySelection when execute operation with a empty selection
var ErrEmptySelection = errors.New("cgteamwork: empty selection")
