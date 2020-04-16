package onceflight

import "sync"

// Group for skip duplicated call.
type Group struct {
	mu sync.Mutex
	m  map[string]struct{}
}

// Do skip duplicated call for same key.
func (g *Group) Do(key string, fn func()) {
	g.mu.Lock()
	if g.m == nil {
		g.m = make(map[string]struct{})
	}
	_, ok := g.m[key]
	if ok {
		g.mu.Unlock()
		return
	}
	g.m[key] = struct{}{}
	g.mu.Unlock()

	fn()

	g.mu.Lock()
	delete(g.m, key)
	g.mu.Unlock()
}
