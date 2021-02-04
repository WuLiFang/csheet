package resolvers

func stringSet(v []string) (ret map[string]struct{}) {
	if len(v) == 0 {
		return
	}
	ret = make(map[string]struct{})
	for _, i := range v {
		ret[i] = struct{}{}
	}
	return
}
