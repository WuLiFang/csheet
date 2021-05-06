.PHONY: default deploy-docs test build build/windows install src/graphql

export CGO_ENABLED?=0

default: build src/graphql docs/_build/html dist build/windows

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

dist: export CSHEET_RELEASE?=$(shell git describe)
dist: node_modules/.sentinel src/* src/*/*
	pnpm run build

node_modules/.sentinel: package.json pnpm-lock.yaml
	pnpm install
	touch $@

test:
	go test ./pkg/...

install: 
	go get ./cmd/...


build/windows: export GOOS=windows
build/windows: export GOARCH=amd64
build/windows: export VERSION?=$(shell git describe)
build/windows: dist
	rm -rf build/windows
	mkdir -p build/windows
	cp $(shell where.exe ffmpeg.exe) build/windows
	cp $(shell where.exe ffprobe.exe) build/windows
	cp -r dist-extra/windows/* build/windows
	cp -r dist/ build/windows/
	echo $(VERSION) > build/windows/VERSION
	go build -o build/windows/ ./cmd/...
	cd build/windows; zip ../csheet-$(VERSION)-win.zip *
