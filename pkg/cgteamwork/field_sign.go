package cgteamwork

// `concat`,`is`,`!concat` is not included because they seems are alias to `=`, `!=`.

// FieldSign name
type FieldSign string

// F is shortcut to FieldSign
type F = FieldSign

// Equal filter
func (f FieldSign) Equal(v interface{}) Filter {
	return Filter{
		Left:  string(f),
		Op:    "=",
		Right: v,
	}
}

// NotEqual filter
func (f FieldSign) NotEqual(v interface{}) Filter {
	return Filter{
		Left:  string(f),
		Op:    "!=",
		Right: v,
	}
}

// EqualIgnoreCase is ignore case version of `Equal`.
func (f FieldSign) EqualIgnoreCase(v interface{}) Filter {
	return Filter{
		Left:  string(f),
		Op:    "~",
		Right: v,
	}
}

// LessThan filter
func (f FieldSign) LessThan(v interface{}) Filter {
	return Filter{
		Left:  string(f),
		Op:    "<",
		Right: v,
	}
}

// LessEqualThan filter
func (f FieldSign) LessEqualThan(v interface{}) Filter {
	return Filter{
		Left:  string(f),
		Op:    "<=",
		Right: v,
	}
}

// GreaterThan filter
func (f FieldSign) GreaterThan(v interface{}) Filter {
	return Filter{
		Left:  string(f),
		Op:    ">",
		Right: v,
	}
}

// GreaterEqualThan filter
func (f FieldSign) GreaterEqualThan(v interface{}) Filter {
	return Filter{
		Left:  string(f),
		Op:    ">=",
		Right: v,
	}
}

// Like filter
// `%` match zero or many character.
// `-` match one character.
func (f FieldSign) Like(v string) Filter {
	return Filter{
		Left:  string(f),
		Op:    "concat",
		Right: v,
	}
}

// NotLike filter, opposite of `Like`.
func (f FieldSign) NotLike(v string) Filter {
	return Filter{
		Left:  string(f),
		Op:    "!concat",
		Right: v,
	}
}

// Has filter, partial match version of `Like`.
func (f FieldSign) Has(v string) Filter {
	return Filter{
		Left:  string(f),
		Op:    "has",
		Right: v,
	}
}

// NotHas filter, opposite of `Has`.
func (f FieldSign) NotHas(v string) Filter {
	return Filter{
		Left:  string(f),
		Op:    "!has",
		Right: v,
	}
}

// HasIgnoreCase is ignore case version of `Has`.
func (f FieldSign) HasIgnoreCase(v interface{}) Filter {
	return Filter{
		Left:  string(f),
		Op:    "~has",
		Right: v,
	}
}

// In filter match any element in given array.
func (f FieldSign) In(v interface{}) Filter {
	return Filter{
		Left:  string(f),
		Op:    "in",
		Right: v,
	}
}

// StartsWith filter
func (f FieldSign) StartsWith(v string) Filter {
	return Filter{
		Left:  string(f),
		Op:    "start",
		Right: v,
	}
}

// EndsWith filter
func (f FieldSign) EndsWith(v string) Filter {
	return Filter{
		Left:  string(f),
		Op:    "start",
		Right: v,
	}
}

// Is filter, usage unknown.
func (f FieldSign) Is(v interface{}) Filter {
	return Filter{
		Left:  string(f),
		Op:    "is",
		Right: v,
	}
}
