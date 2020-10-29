package collection

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSignalSubscribe(t *testing.T) {

	ctx1, cancel1 := context.WithCancel(context.Background())
	c1 := SignalSaved.Subscribe(ctx1, 0)
	ctx2, cancel2 := context.WithCancel(context.Background())
	c2 := SignalSaved.Subscribe(ctx2, 1)
	assert.Len(t, SignalSaved.m, 2)
	go func() {
		SignalSaved.Emit(ctx1, new(Collection))
		cancel2()
		SignalSaved.Emit(ctx1, new(Collection))
		cancel1()
	}()

	var count = 0
	for i := range c1 {
		assert.Empty(t, i)
		count++
	}
	assert.Equal(t, count, 2)
	var count2 = 0
	for i := range c2 {
		assert.Empty(t, i)
		count2++
	}
	assert.Equal(t, count2, 1)
	assert.Len(t, SignalSaved.m, 0)
}
