package resolvers

import "sync"

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
