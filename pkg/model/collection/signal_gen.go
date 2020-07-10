// Code generated from signal.go.gotmpl, DO NOT EDIT.

package collection

import (
	"sync"
	"context"
)

// Signal that emit *Collection to receivers.
type Signal struct {
	mu sync.RWMutex
	m map[chan<- Collection]bool
	sideEffects []func(context.Context, *Collection) error
}

// Emit send object to every receivers. error when hook function errors.
func (s *Signal) Emit(ctx context.Context, o *Collection) error {
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

func (s *Signal) addReceiver(c chan<- Collection, block bool) {
	s.mu.Lock()
    defer s.mu.Unlock()

	if s.m == nil {
		s.m = make(map[chan<- Collection]bool)
	}
	s.m[c] = block
}

// Notify add channel to receivers. Emit will wait when channel is blocked.
// It is the caller's responsibility to Stop notify before channel close.
func (s *Signal) Notify(c chan<- Collection) {
	s.addReceiver(c, true)
}

// TryNotify add channel to receivers. Emit will skip when channel is blocked.
// It is the caller's responsibility to Stop notify before channel close.
func (s *Signal) TryNotify(c chan<- Collection) {
	s.addReceiver(c, false)
}

// Stop remove channel from receivers.
func (s *Signal) Stop(c chan<- Collection) {
	s.mu.Lock()
    defer s.mu.Unlock()

	delete(s.m, c)
}

// Connect a side effect function to signal.
// it will be called before send each object to channels.
func (s *Signal) Connect(fn func(context.Context, *Collection) error) {
	s.mu.Lock()
    defer s.mu.Unlock()

	s.sideEffects = append(s.sideEffects, fn)
}

// Subscribe signal with a function. 
// channel only available before function return.
// Emit will skip when channel is blocked.
func (s *Signal) Subscribe(fn func (<-chan Collection), cap int) {
	var c = make(chan Collection, cap)
	s.addReceiver(c, true)
	fn(c)
	s.Stop(c)
	close(c)
}

// Model signals
var (
	// SignalWillSave emit when *Collection about to save.
	SignalWillSave = new(Signal)

	// SignalSaved emit when *Collection saved.
	SignalSaved = new(Signal)

	// SignalWillLoad emit when *Collection about to load.
	SignalWillLoad = new(Signal)

	// SignalLoaded emit when *Collection loaded.
	SignalLoaded = new(Signal)

	// SignalWillUpdate emit when existing *Collection about to updated.
	SignalWillDelete = new(Signal)

	// SignalDeleted emit when existing *Collection deleted.
	SignalDeleted = new(Signal)
)
