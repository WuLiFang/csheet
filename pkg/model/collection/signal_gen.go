// Code generated from signal.go.gotmpl, DO NOT EDIT.

package collection

import (
	"sync"
	"context"
)

// Signal that emit *Collection to receivers.
type Signal struct {
	mu sync.Mutex
	m map[chan<- Collection]<-chan struct{}
	sideEffects []func(context.Context, *Collection) error
}

// Emit send object to every receivers. error when hook function errors.
func (s *Signal) Emit(ctx context.Context, o *Collection) error {
	s.mu.Lock()
    defer s.mu.Unlock()

	for _, fn := range s.sideEffects {
		err := fn(ctx, o)
		if err != nil {
			return err
		}
	}

	for c, done := range s.m {
		select {
			case c <- *o:
			case <- ctx.Done():
				return ctx.Err()
			case <- done:
		}
	}

	return nil
}

func (s *Signal) addReceiver(c chan<- Collection, done <-chan struct{}) {
	s.mu.Lock()
    defer s.mu.Unlock()

	if s.m == nil {
		s.m = make(map[chan<- Collection]<-chan struct{})
	}
	s.m[c] = done
}

func (s *Signal) removeReceiver(c chan<- Collection) {
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

// Subscribe signal with a channel. 
// return channel will close when context cancelled.
// Emit will wait when channel is blocked.
func (s *Signal) Subscribe(ctx context.Context, cap int) <-chan Collection {
	var c = make(chan Collection, cap)
	s.addReceiver(c, ctx.Done())
	go func() {
		<- ctx.Done()
		s.removeReceiver(c)
		close(c)
	}()
	return c
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
