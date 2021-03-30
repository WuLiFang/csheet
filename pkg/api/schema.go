package api

//go:generate go run github.com/99designs/gqlgen

import (
	"context"
	"reflect"
	"time"

	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/executor"
	"github.com/WuLiFang/csheet/v6/pkg/api/generated"
	"github.com/WuLiFang/csheet/v6/pkg/api/resolvers"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

// NewExecutableSchema create new graphql schema
func NewExecutableSchema() graphql.ExecutableSchema {
	return generated.NewExecutableSchema(
		generated.Config{
			Resolvers: &resolvers.Resolver{},
		},
	)
}

func normalizeVariableValue(v interface{}) interface{} {
	var rv = reflect.ValueOf(v)
	switch rv.Type().Kind() {
	case reflect.Array:
		fallthrough
	case reflect.Slice:
		var ret = make([]interface{}, rv.Len())
		for i := range ret {
			ret[i] = rv.Index(i).Interface()
		}
		return ret
	}
	return v

}

// Do graphql operation.
func Do(ctx context.Context, params *graphql.RawParams) (resp *graphql.Response, err error) {
	schema := NewExecutableSchema()
	exec := executor.New(schema)
	ctx = graphql.StartOperationTrace(ctx)

	params.ReadTime.Start = time.Now()
	for k, v := range params.Variables {
		params.Variables[k] = normalizeVariableValue(v)
	}
	oc, gqlErr := exec.CreateOperationContext(ctx, params)
	if gqlErr != nil {
		err = gqlErr
	}
	if err != nil {
		return
	}
	ctx = graphql.WithResponseContext(ctx, func(ctx context.Context, innerErr error) *gqlerror.Error {
		err = innerErr
		return graphql.DefaultErrorPresenter(ctx, innerErr)
	}, nil)
	ctx = graphql.WithOperationContext(ctx, oc)
	resp = schema.Exec(ctx)(ctx)
	return
}
