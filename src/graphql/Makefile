.PHONY: default

export CGO_ENABLED?=0

default: types
	$(MAKE) -C queries
	$(MAKE) -C mutations

schema.json: export API_SERVER_URL?=http://localhost:8000/api
schema.json: ../../pkg/api/*/*.gql
	go run ../../scripts/generate-schema

types: */*.gql schema.json
	npm run codegen:graphql
