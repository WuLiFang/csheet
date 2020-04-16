package cgteamwork

import "errors"

// ErrLoginRequired require login before send such request.
var ErrLoginRequired = errors.New("login required")
