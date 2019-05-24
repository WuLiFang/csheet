.PHONY: all

all: dist

public/templates: ../server/csheet/templates
	cp -r ../server/csheet/templates public

dist: node_modules public/templates src/* src/*/* src/*/*/*
	npm run build

node_modules: package.json package-lock.json
	npm install

