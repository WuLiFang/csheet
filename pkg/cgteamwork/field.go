package cgteamwork

// `concat`,`is`,`!concat` is not included because they seems are alias to `=`, `!=`.

// Field sign name
type Field string

// F is shortcut to Field
type F = Field

// Equal filter
func (f Field) Equal(v interface{}) Filter {
	return Filter{
		Left:  string(f),
		Op:    "=",
		Right: v,
	}
}

// NotEqual filter
func (f Field) NotEqual(v interface{}) Filter {
	return Filter{
		Left:  string(f),
		Op:    "!=",
		Right: v,
	}
}

// EqualIgnoreCase is ignore case version of `Equal`.
func (f Field) EqualIgnoreCase(v interface{}) Filter {
	return Filter{
		Left:  string(f),
		Op:    "~",
		Right: v,
	}
}

// LessThan filter
func (f Field) LessThan(v interface{}) Filter {
	return Filter{
		Left:  string(f),
		Op:    "<",
		Right: v,
	}
}

// LessEqualThan filter
func (f Field) LessEqualThan(v interface{}) Filter {
	return Filter{
		Left:  string(f),
		Op:    "<=",
		Right: v,
	}
}

// GreaterThan filter
func (f Field) GreaterThan(v interface{}) Filter {
	return Filter{
		Left:  string(f),
		Op:    ">",
		Right: v,
	}
}

// GreaterEqualThan filter
func (f Field) GreaterEqualThan(v interface{}) Filter {
	return Filter{
		Left:  string(f),
		Op:    ">=",
		Right: v,
	}
}

// Like filter
// `%` match zero or many character.
// `-` match one character.
func (f Field) Like(v string) Filter {
	return Filter{
		Left:  string(f),
		Op:    "concat",
		Right: v,
	}
}

// NotLike filter, opposite of `Like`.
func (f Field) NotLike(v string) Filter {
	return Filter{
		Left:  string(f),
		Op:    "!concat",
		Right: v,
	}
}

// Has filter, partial match version of `Like`.
func (f Field) Has(v string) Filter {
	return Filter{
		Left:  string(f),
		Op:    "has",
		Right: v,
	}
}

// NotHas filter, opposite of `Has`.
func (f Field) NotHas(v string) Filter {
	return Filter{
		Left:  string(f),
		Op:    "!has",
		Right: v,
	}
}

// HasIgnoreCase is ignore case version of `Has`.
func (f Field) HasIgnoreCase(v interface{}) Filter {
	return Filter{
		Left:  string(f),
		Op:    "~has",
		Right: v,
	}
}

// In filter match any element in given array.
func (f Field) In(v interface{}) Filter {
	return Filter{
		Left:  string(f),
		Op:    "in",
		Right: v,
	}
}

// StartsWith filter
func (f Field) StartsWith(v string) Filter {
	return Filter{
		Left:  string(f),
		Op:    "start",
		Right: v,
	}
}

// EndsWith filter
func (f Field) EndsWith(v string) Filter {
	return Filter{
		Left:  string(f),
		Op:    "start",
		Right: v,
	}
}

// Is filter, usage unknown.
func (f Field) Is(v interface{}) Filter {
	return Filter{
		Left:  string(f),
		Op:    "is",
		Right: v,
	}
}
