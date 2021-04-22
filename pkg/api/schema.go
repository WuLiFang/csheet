package api

//go:generate go run github.com/99designs/gqlgen

import (
	"context"
	"fmt"
	"reflect"
	"time"

	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/executor"
	"github.com/WuLiFang/csheet/v6/pkg/api/generated"
	"github.com/WuLiFang/csheet/v6/pkg/api/resolvers"
	"github.com/WuLiFang/csheet/v6/pkg/apperror"
	"github.com/WuLiFang/csheet/v6/pkg/cgteamwork"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

func defaultValue(ctx context.Context) (ret interface{}, err error) {
	var fc = graphql.GetFieldContext(ctx)
	if fc == nil {
		return
	}
	var fd = fc.Field.Definition
	if fd == nil {
		err = fmt.Errorf("api: defaultValue: field definition is nil")
		return
	}
	var tp = fd.Type
	if tp == nil {
		err = fmt.Errorf("api: defaultValue: field type is nil")
		return
	}
	if !tp.NonNull {
		return
	}
	var name = tp.String()
	switch name {
	case "[CGTeamworkStatus!]!":
		ret = []cgteamwork.Status{}
		return
	}

	err = fmt.Errorf("api: defaultValue: no default value for %s", name)
	return
}

// NewExecutableSchema create new graphql schema
func NewExecutableSchema() graphql.ExecutableSchema {
	return generated.NewExecutableSchema(
		generated.Config{
			Resolvers: &resolvers.Resolver{},
			Directives: generated.DirectiveRoot{
				IgnoreError: func(ctx context.Context, obj interface{}, next graphql.Resolver, code []string) (res interface{}, err error) {
					res, err = next(ctx)
					if err == nil {
						return
					}
					var errCode = apperror.ErrCode(err)
					for _, i := range code {
						if i == errCode {
							return defaultValue(ctx)
						}
					}
					return
				},
			},
		},
	)
}

func normalizeVariableValue(v interface{}) interface{} {
	if v == nil {
		return nil
	}
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

// Issue1369Fix https://github.com/99designs/gqlgen/issues/1369
type Issue1369Fix struct{}

func (Issue1369Fix) ExtensionName() string {
	return "Issue1369Fix"
}
func (Issue1369Fix) Validate(schema graphql.ExecutableSchema) error {
	return nil
}

func (Issue1369Fix) MutateOperationContext(ctx context.Context, rc *graphql.OperationContext) *gqlerror.Error {
	for k, v := range rc.Variables {
		rc.Variables[k] = normalizeVariableValue(v)
	}
	return nil
}

var _ interface {
	graphql.OperationContextMutator
	graphql.HandlerExtension
} = Issue1369Fix{}

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
