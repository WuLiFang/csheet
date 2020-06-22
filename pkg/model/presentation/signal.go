package presentation

import (
	"sync"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/model/file"
	"go.uber.org/zap"
)

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

func init() {
	var logger = logging.Logger("model.presentation")
	go func() {
		var c = make(chan file.File)
		file.SignalChanged.Notify(c)
		defer file.SignalChanged.Stop(c)
		for f := range c {
			ps, err := FindByPath(f.Path)
			if err != nil {
				logger.Error("db find failed", zap.Error(err))
				continue
			}
			for _, p := range ps {
				SignalUpdated.Emit(p)
			}
		}
	}()
}
