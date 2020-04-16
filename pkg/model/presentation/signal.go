package presentation

import "sync"

type signal struct {
	sync.Mutex
	m map[chan<- Presentation]struct{}
}

func (s *signal) Emit(e Presentation) {
	for c := range s.m {
		select {
		case c <- e:
		default:
		}
	}
}

func (s *signal) Notify(c chan Presentation) {
	s.Lock()
	if s.m == nil {
		s.m = make(map[chan<- Presentation]struct{})
	}
	s.m[c] = struct{}{}
	s.Unlock()
}

func (s *signal) Stop(c chan Presentation) {
	s.Lock()
	delete(s.m, c)
	s.Unlock()
}

// SignalUpdated emit when Presentation updated.
var SignalUpdated = &signal{}
