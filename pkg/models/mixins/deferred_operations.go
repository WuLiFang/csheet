package mixins

import "context"

// DeferredOperations mixin provide support for delay execution.
type DeferredOperations struct {
	operations []func(ctx context.Context) error
}

// Append a operation
func (d *DeferredOperations) Append(fn func(ctx context.Context) error) {
	d.operations = append(d.operations, fn)
}

// Apply operations in a FIFO manner.
func (d *DeferredOperations) Apply(ctx context.Context) (err error) {
	for len(d.operations) > 0 {
		var fn func(ctx context.Context) error
		fn, d.operations = d.operations[0], d.operations[1:]
		err = fn(ctx)
		if err != nil {
			return
		}
	}
	return
}

// Clear removes all pending writes
func (d *DeferredOperations) Clear() {
	d.operations = nil
}
