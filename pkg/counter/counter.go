package counter

import "sync"

// Counter record a count for given key
type Counter struct {
	m  map[string]int
	mu sync.RWMutex
}

func (c *Counter) ensureMap() {
	if c.m == nil {
		c.m = make(map[string]int)
	}
}

// Get count for key.
func (c *Counter) Get(k string) int {
	c.mu.RLock()
	c.ensureMap()
	defer c.mu.RUnlock()
	return c.m[k]
}

// Add count for key.
func (c *Counter) Add(k string, v int) int {
	c.mu.Lock()
	c.ensureMap()
	c.m[k] += v
	if c.m[k] == 0 {
		delete(c.m, k)
	}
	defer c.mu.Unlock()
	return c.m[k]
}

// Snapshot create a copy for all current count.
func (c *Counter) Snapshot() map[string]int {
	var ret = make(map[string]int)
	c.mu.RLock()
	for k, v := range c.m {
		ret[k] = v
	}
	c.mu.RUnlock()
	return ret
}
