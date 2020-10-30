package collection

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSignalSubscribe(t *testing.T) {

	ctx := context.Background()
	c1, unsubscribe1 := SignalSaved.Subscribe(0)
	c2, unsubscribe2 := SignalSaved.Subscribe(1)
	assert.Len(t, SignalSaved.m, 2)
	go func() {
		SignalSaved.Emit(ctx, new(Collection))
		unsubscribe2()
		SignalSaved.Emit(ctx, new(Collection))
		unsubscribe1()
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
