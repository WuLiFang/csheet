.PHONY: default deploy-docs test run src/graphql

export CGO_ENABLED?=0

default: src/graphql docs/_build/html dist build

docs/_build/html: docs/_build/html/.git docs/* docs/*/*.rst docs/*/*/*.rst
	$(MAKE) -C docs

deploy-docs:
	cd docs/_build/html ; git add --all && git commit -m 'docs: build' -m '[skip ci]' && git push

docs/_build/html/.git:
	git worktree add --checkout docs/_build/html -B gh-pages

build: */*/*.go */*/*/*.go pkg/api
	mkdir -p build
	go build -o build ./cmd/...
	touch build

pkg/api: pkg/api/*/*.gql gqlgen.yml
	go generate ./pkg/api
	touch pkg/api

src/graphql:
	$(MAKE) -C src/graphql

dist: node_modules src/* src/*/*
	npm run build

node_modules: package.json package-lock.json
	npm install
	touch node_modules

run:
	go run ./cmd/csheet --address localhost:8000

test: all
	go test ./pkg/...
