package cgteamwork

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

func stringArrayFromSet(v map[string]struct{}) (ret []string) {
	if len(v) == 0 {
		return
	}
	ret = make([]string, 0, len(v))
	for i := range v {
		ret = append(ret, i)
	}
	return
}
