package util

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

// StringSliceFromSet create slice from string set.
// returns nil if v is empty.
func StringSliceFromSet(v map[string]struct{}) (ret []string) {
	if len(v) == 0 {
		return
	}
	ret = make([]string, 0, len(v))
	for i := range v {
		ret = append(ret, i)
	}
	return
}

// StringUniq create new string slice with duplicated value removed.
// original order is keeped.
// returns nil if v is empty.
func StringUniq(v []string) []string {
	if len(v) == 0 {
		return nil
	}
	m := make(map[string]struct{})
	ret := make([]string, 0, len(m))
	for _, i := range v {
		if _, ok := m[i]; !ok {
			ret = append(ret, i)
		}
		m[i] = struct{}{}
	}
	return ret
}
