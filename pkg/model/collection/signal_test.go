package collection

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSignalSubscribe(t *testing.T) {
	ctx := context.Background()
	var signal1 = new(Signal)
	c1, unsubscribe1 := signal1.Subscribe(0)
	c2, unsubscribe2 := signal1.Subscribe(1)
	assert.Len(t, signal1.m, 2)
	var err error
	go func() {
		err = signal1.Emit(ctx, new(Collection))
		require.NoError(t, err)
		unsubscribe2()
		err = signal1.Emit(ctx, new(Collection))
		require.NoError(t, err)
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
	assert.Len(t, signal1.m, 0)
}
