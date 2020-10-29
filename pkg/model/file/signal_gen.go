// Code generated from signal.go.gotmpl, DO NOT EDIT.

package file

import (
	"sync"
	"context"
)

// Signal that emit *File to receivers.
type Signal struct {
	mu sync.Mutex
	m map[chan<- File]<-chan struct{}
	sideEffects []func(context.Context, *File) error
}

// Emit send object to every receivers. error when hook function errors.
func (s *Signal) Emit(ctx context.Context, o *File) error {
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

func (s *Signal) addReceiver(c chan<- File, done <-chan struct{}) {
	s.mu.Lock()
    defer s.mu.Unlock()

	if s.m == nil {
		s.m = make(map[chan<- File]<-chan struct{})
	}
	s.m[c] = done
}

func (s *Signal) removeReceiver(c chan<- File) {
	s.mu.Lock()
    defer s.mu.Unlock()

	delete(s.m, c)
}

// Connect a side effect function to signal.
// it will be called before send each object to channels.
func (s *Signal) Connect(fn func(context.Context, *File) error) {
	s.mu.Lock()
    defer s.mu.Unlock()

	s.sideEffects = append(s.sideEffects, fn)
}

// Subscribe signal with a function. 
// channel only available before function return.
// Emit will wait when channel is blocked.
func (s *Signal) Subscribe(ctx context.Context, cap int) <-chan File {
	var c = make(chan File, cap)
	go func() {
		<- ctx.Done()
		s.removeReceiver(c)
		close(c)
	}()
	s.addReceiver(c, ctx.Done())
	return c
}

// Model signals
var (
	// SignalWillSave emit when *File about to save.
	SignalWillSave = new(Signal)

	// SignalSaved emit when *File saved.
	SignalSaved = new(Signal)

	// SignalWillLoad emit when *File about to load.
	SignalWillLoad = new(Signal)

	// SignalLoaded emit when *File loaded.
	SignalLoaded = new(Signal)

	// SignalWillUpdate emit when existing *File about to updated.
	SignalWillDelete = new(Signal)

	// SignalDeleted emit when existing *File deleted.
	SignalDeleted = new(Signal)
)
