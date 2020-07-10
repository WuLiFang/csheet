// Code generated from signal.go.gotmpl, DO NOT EDIT.

package collected

import (
	"sync"
	"context"
)

// Signal that emit *Event to receivers.
type Signal struct {
	mu sync.RWMutex
	m map[chan<- Event]struct{}
	sideEffects []func(context.Context, *Event) error
}

// Emit send object to every receivers. error when hook function errors.
func (s *Signal) Emit(ctx context.Context, o *Event) error {
	s.mu.RLock()
    defer s.mu.RUnlock()

	for _, fn := range s.sideEffects {
		err := fn(ctx, o)
		if err != nil {
			return err
		}
	}

	for c := range s.m {
		select {
			case c <- *o:
			case <- ctx.Done():
				return ctx.Err()
			default:
		}
	}

	return nil
}

func (s *Signal) addReceiver(c chan<- Event) {
	s.mu.Lock()
    defer s.mu.Unlock()

	if s.m == nil {
		s.m = make(map[chan<- Event]struct{})
	}
	s.m[c] = struct{}{}
}

// Notify add channel to receivers. Emit will wait when channel is blocked.
// It is the caller's responsibility to Stop notify before channel close.
func (s *Signal) Notify(c chan<- Event) {
	s.addReceiver(c)
}

// Stop remove channel from receivers.
func (s *Signal) Stop(c chan<- Event) {
	s.mu.Lock()
    defer s.mu.Unlock()

	delete(s.m, c)
}

// Connect a side effect function to signal.
// it will be called before send each object to channels.
func (s *Signal) Connect(fn func(context.Context, *Event) error) {
	s.mu.Lock()
    defer s.mu.Unlock()

	s.sideEffects = append(s.sideEffects, fn)
}

// Subscribe signal with a function. 
// channel only available before function return.
// Emit will wait when channel is blocked.
func (s *Signal) Subscribe(fn func (<-chan Event), cap int) {
	var c = make(chan Event, cap)
	s.addReceiver(c)
	fn(c)
	s.Stop(c)
	close(c)
}

// Model signals
var (
	// SignalWillSave emit when *Event about to save.
	SignalWillSave = new(Signal)

	// SignalSaved emit when *Event saved.
	SignalSaved = new(Signal)

	// SignalWillLoad emit when *Event about to load.
	SignalWillLoad = new(Signal)

	// SignalLoaded emit when *Event loaded.
	SignalLoaded = new(Signal)

	// SignalWillUpdate emit when existing *Event about to updated.
	SignalWillDelete = new(Signal)

	// SignalDeleted emit when existing *Event deleted.
	SignalDeleted = new(Signal)
)
