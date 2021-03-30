package archive

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/99designs/gqlgen/graphql"
	"github.com/WuLiFang/csheet/v6/pkg/api"
	"github.com/tidwall/sjson"
)

var CollectionLimit int = 1000

type PageOptions struct {
	pageVariables map[string]interface{}
	title         string
}

type PageOption = func(opts *PageOptions)

func PageOptionOriginPrefix(v string) PageOption {
	return func(opts *PageOptions) {
		opts.pageVariables["originPrefix"] = v
	}
}

func PageOptionTagAnd(v []string) PageOption {
	return func(opts *PageOptions) {
		opts.pageVariables["tagAnd"] = v
	}
}

func PageOptionTagOr(v []string) PageOption {
	return func(opts *PageOptions) {
		opts.pageVariables["tagOr"] = v
	}
}

func PageOptionPresentationCountGt(v int) PageOption {
	return func(opts *PageOptions) {
		opts.pageVariables["presentationCountGt"] = v
	}
}

func PageOptionFilePathFormat(v string) PageOption {
	return func(opts *PageOptions) {
		opts.pageVariables["filePathFormat"] = v
	}
}

func PageOptionTitle(v string) PageOption {
	return func(opts *PageOptions) {
		opts.title = v
	}
}

func PageData(ctx context.Context, opts ...PageOption) (ret json.RawMessage, err error) {
	var args = new(PageOptions)
	args.pageVariables = map[string]interface{}{
		"first": CollectionLimit,
	}
	for _, i := range opts {
		i(args)
	}
	if args.title == "" {
		args.title = fmt.Sprintf("csheet - %s", time.Now().Format("2006-01-02 15:04:05"))
	}

	resp, err := api.Do(
		ctx,
		&graphql.RawParams{
			OperationName: "staticPageData",
			Variables:     args.pageVariables,
			Query: `
fragment Presentation on Presentation {
	id
	type
	raw {
		path(format: $filePathFormat)
		modTime
		size
	}
	thumb {
		url
	}
	isThumbTranscodeFailed
	regular {
		url
	}
	isRegularOutdated
	isRegularTranscodeFailed
	metadata {
		k
		v
	}
}

fragment Collection on Collection {
	id
	title
	origin
	metadata {
		k
		v
	}
	presentations {
		...Presentation
	}
	collectTime
	tags
}
			
query staticPageData(
	$first: Int
	$originPrefix: String
	$filePathFormat: String
	$presentationCountGt: Int
	$tagOr: [String!]
	$tagAnd: [String!]
) {
	clientConfig(name: "web") {
		__typename
		issueTrackerURL 
	}
	collections(
		first: $first
		originPrefix: $originPrefix
		presentationCountGt: $presentationCountGt
		tagOr: $tagOr
		tagAnd: $tagAnd
	) {
		__typename
		nodes {
			...Collection
		}
		pageInfo {
			__typename
			hasNextPage
		}
	}
}
`,
		},
	)
	if err != nil {
		return
	}
	if resp.Errors != nil {
		err = resp.Errors
		return
	}
	ret = resp.Data
	ret, err = sjson.SetBytes(
		ret,
		"__typename",
		"StaticPageData",
	)
	if err != nil {
		return
	}
	ret, err = sjson.SetBytes(
		ret,
		"title",
		args.title,
	)
	if err != nil {
		return
	}
	return
}
