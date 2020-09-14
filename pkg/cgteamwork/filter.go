package cgteamwork

import "encoding/json"

// Filter is a cgteamwork filter
type Filter struct {
	Left, Op   string
	Right      interface{}
	ChainLogic string
	Chain      *Filter
}

// IsZero check whether every field is empty.
func (f Filter) IsZero() bool {
	return f == Filter{}
}

// Array convert filter to cgteamwork sign filter array format.
func (f Filter) Array() []interface{} {
	v := []interface{}{[3]interface{}{f.Left, f.Op, f.Right}}
	if f.Chain != nil {
		v = append(v, f.ChainLogic)
		v = append(v, f.Chain.Array()...)
	}
	return v
}

// MarshalJSON impelements json.Marshaler interface
func (f Filter) MarshalJSON() ([]byte, error) {
	return json.Marshal(f.Array())
}

// F create filter without chain.
func F(left, op string, right interface{}) Filter {
	return Filter{
		Left:  left,
		Op:    op,
		Right: right,
	}
}

// And create filter with `and` chain.
func (f Filter) And(other Filter) Filter {
	if f.IsZero() {
		return other
	}
	if f.Chain != nil {
		c := f.Chain.And(other)
		f.Chain = &c
		return f
	}
	f.ChainLogic = "and"
	f.Chain = &other
	return f
}

// Or create filter with `or` chain.
func (f Filter) Or(other Filter) Filter {
	if f.IsZero() {
		return f
	}
	if f.Chain != nil {
		c := f.Chain.Or(other)
		f.Chain = &c
		return f
	}
	f.ChainLogic = "or"
	f.Chain = &other
	return f
}

// F is a alias for cgteamwork.F
func (Client) F(left, op string, right interface{}) Filter {
	return F(left, op, right)
}
