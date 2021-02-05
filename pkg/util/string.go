package util

// TODO: remove other stringSet implementation.

// StringSet create a set from string slice.
// returns nil if v is empty.
func StringSet(v []string) (ret map[string]struct{}) {
	if len(v) == 0 {
		return
	}
	ret = make(map[string]struct{})
	for _, i := range v {
		ret[i] = struct{}{}
	}
	return
}
