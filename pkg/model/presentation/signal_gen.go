// Code generated from signal.go.gotmpl, DO NOT EDIT.

package presentation

import (
	"sync"
	"context"
)

// Signal that emit *Presentation to receivers.
type Signal struct {
	mu sync.Mutex
	m map[chan<- Presentation]<-chan struct{}
	sideEffects []func(context.Context, *Presentation) error
}

// Emit send object to every receivers. error when hook function errors.
func (s *Signal) Emit(ctx context.Context, o *Presentation) error {
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

func (s *Signal) addReceiver(c chan<- Presentation, done <-chan struct{}) {
	s.mu.Lock()
    defer s.mu.Unlock()

	if s.m == nil {
		s.m = make(map[chan<- Presentation]<-chan struct{})
	}
	s.m[c] = done
}

func (s *Signal) removeReceiver(c chan<- Presentation) {
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

// Subscribe signal with a channel. 
// return channel will close when context cancelled.
// Emit will wait when channel is blocked.
func (s *Signal) Subscribe(ctx context.Context, cap int) <-chan Presentation {
	var c = make(chan Presentation, cap)
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
