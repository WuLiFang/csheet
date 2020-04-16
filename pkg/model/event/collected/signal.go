package collected

import "sync"

type signal struct {
	sync.Mutex
	m map[chan<- Event]struct{}
}

func (s *signal) Emit(e Event) {
	for c := range s.m {
		select {
		case c <- e:
		default:
		}
	}
}

func (s *signal) Notify(c chan Event) {
	s.Lock()
	if s.m == nil {
		s.m = make(map[chan<- Event]struct{})
	}
	s.m[c] = struct{}{}
	s.Unlock()
}

func (s *signal) Stop(c chan Event) {
	s.Lock()
	delete(s.m, c)
	s.Unlock()
}

// SignalUpdated emit when Event updated.
var SignalUpdated = &signal{}
