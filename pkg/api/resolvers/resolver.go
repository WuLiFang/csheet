package resolvers

import (
	"sync"

	"github.com/WuLiFang/csheet/v6/pkg/unipath"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

// Resolver type
type Resolver struct{}

var nextSubscriptionIndex = 0
var nextSubscriptionIndexMu = new(sync.Mutex)

func subscriptionIndex() int {
	nextSubscriptionIndexMu.Lock()
	defer nextSubscriptionIndexMu.Unlock()

	ret := nextSubscriptionIndex
	nextSubscriptionIndex++
	return ret
}

func dereferenceBool(v *bool) bool {
	if v != nil {
		return *v
	}
	return false
}

func formatPath(v string, format *string) string {
	var f string
	if format != nil {
		f = *format
	}
	switch f {
	case "windows":
		return unipath.Windows(v)
	case "unix":
		return unipath.Unix(v)
	default:
		return unipath.Auto(v)
	}
}
