package transcode

import "sync"

type signalType = struct{}

type signal struct {
	sync.Mutex
	m map[chan<- signalType]struct{}
}

func (s *signal) Emit(f signalType) {
	for c := range s.m {
		select {
		case c <- f:
		default:
		}
	}
}

func (s *signal) Notify(c chan signalType) {
	s.Lock()
	if s.m == nil {
		s.m = make(map[chan<- signalType]struct{})
	}
	s.m[c] = struct{}{}
	s.Unlock()
}

func (s *signal) Stop(c chan signalType) {
	s.Lock()
	delete(s.m, c)
	s.Unlock()
}
