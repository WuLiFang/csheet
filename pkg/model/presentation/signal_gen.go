// Code generated from signal.go.gotmpl, DO NOT EDIT.

package presentation

import (
	"sync"
	"context"
)

// Signal that emit *Presentation to receivers.
type Signal struct {
	mu sync.RWMutex
	m map[chan<- Presentation]bool
	sideEffects []func(context.Context, *Presentation) error
}

// Emit send object to every receivers. error when hook function errors.
func (s *Signal) Emit(ctx context.Context, o *Presentation) error {
	s.mu.RLock()
    defer s.mu.RUnlock()

	for _, fn := range s.sideEffects {
		err := fn(ctx, o)
		if err != nil {
			return err
		}
	}

	for c, block := range s.m {
		if block {
			select {
			case c <- *o:
			case <- ctx.Done():
				return ctx.Err()
			}
		} else {
			select {
			case c <- *o:
			case <- ctx.Done():
				return ctx.Err()
			default:
			}
		}
	}

	return nil
}

func (s *Signal) addReceiver(c chan<- Presentation, block bool) {
	s.mu.Lock()
    defer s.mu.Unlock()

	if s.m == nil {
		s.m = make(map[chan<- Presentation]bool)
	}
	s.m[c] = block
}

// Notify add channel to receivers. Emit will wait when channel is blocked.
// It is the caller's responsibility to Stop notify before channel close.
func (s *Signal) Notify(c chan<- Presentation) {
	s.addReceiver(c, true)
}

// TryNotify add channel to receivers. Emit will skip when channel is blocked.
// It is the caller's responsibility to Stop notify before channel close.
func (s *Signal) TryNotify(c chan<- Presentation) {
	s.addReceiver(c, false)
}

// Stop remove channel from receivers.
func (s *Signal) Stop(c chan<- Presentation) {
	s.mu.Lock()
    defer s.mu.Unlock()

	delete(s.m, c)
}

// Connect a side effect function to signal.
// it will be called before send each object to channels.
func (s *Signal) Connect(fn func(context.Context, *Presentation) error) {
	s.mu.Lock()
    defer s.mu.Unlock()

	s.sideEffects = append(s.sideEffects, fn)
}

// Subscribe signal with a function. 
// channel only available before function return.
// Emit will skip when channel is blocked.
func (s *Signal) Subscribe(fn func (<-chan Presentation), cap int) {
	var c = make(chan Presentation, cap)
	s.addReceiver(c, false)
	fn(c)
	s.Stop(c)
	close(c)
}

// Model signals
var (
	// SignalWillSave emit when *Presentation about to save.
	SignalWillSave = new(Signal)

	// SignalSaved emit when *Presentation saved.
	SignalSaved = new(Signal)

	// SignalWillLoad emit when *Presentation about to load.
	SignalWillLoad = new(Signal)

	// SignalLoaded emit when *Presentation loaded.
	SignalLoaded = new(Signal)

	// SignalWillUpdate emit when existing *Presentation about to updated.
	SignalWillDelete = new(Signal)

	// SignalDeleted emit when existing *Presentation deleted.
	SignalDeleted = new(Signal)
)
