package file

import "sync"

type signal struct {
	sync.Mutex
	m map[chan<- File]struct{}
}

func (s *signal) emit(f File) {
	for c := range s.m {
		select {
		case c <- f:
		default:
		}
	}
}

func (s *signal) Notify(c chan<- File) {
	s.Lock()
	if s.m == nil {
		s.m = make(map[chan<- File]struct{})
	}
	s.m[c] = struct{}{}
	s.Unlock()
}

func (s *signal) Stop(c chan<- File) {
	s.Lock()
	delete(s.m, c)
	s.Unlock()
}

// SignalChanged emit when file changed.
var SignalChanged = &signal{}

// SignalDeleted emit when file deleted.
var SignalDeleted = &signal{}
