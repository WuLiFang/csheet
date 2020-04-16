package collection

import "sync"

type signal struct {
	sync.Mutex
	m map[chan<- Collection]struct{}
}

func (s *signal) Emit(f Collection) {
	for c := range s.m {
		select {
		case c <- f:
		default:
		}
	}
}

func (s *signal) Notify(c chan Collection) {
	s.Lock()
	if s.m == nil {
		s.m = make(map[chan<- Collection]struct{})
	}
	s.m[c] = struct{}{}
	s.Unlock()
}

func (s *signal) Stop(c chan Collection) {
	s.Lock()
	delete(s.m, c)
	s.Unlock()
}

// SignalUpdated emit when Collection updated.
var SignalUpdated = &signal{}
