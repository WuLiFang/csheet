package api

//go:generate go run github.com/99designs/gqlgen

import (
	"github.com/99designs/gqlgen/graphql"
	"github.com/WuLiFang/csheet/v6/pkg/api/generated"
	"github.com/WuLiFang/csheet/v6/pkg/api/resolvers"
)

// NewExecutableSchema create new graphql schema
func NewExecutableSchema() graphql.ExecutableSchema {
	return generated.NewExecutableSchema(
		generated.Config{
			Resolvers: &resolvers.Resolver{},
		},
	)
}
