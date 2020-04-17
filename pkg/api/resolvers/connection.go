package resolvers

import "errors"

type connectionContext struct {
	limit   int
	reverse bool
	before  string
	after   string
}

func setupConnectionContext(
	first, last *int,
	before, after *string,
) (ret connectionContext, err error) {
	if last != nil && first != nil {
		err = errors.New("use first and last at same time is not supported")
		return
	}
	if last == nil && first == nil {
		err = errors.New("must specify one of (first, last)")
		return
	}
	if before != nil {
		ret.before = *before
	}
	if after != nil {
		ret.after = *after
	}
	if last != nil {
		ret.limit = *last
		ret.reverse = true
		ret.after, ret.before = ret.before, ret.after
	}
	if first != nil {
		ret.limit = *first
	}

	return
}
