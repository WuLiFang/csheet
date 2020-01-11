.PHONY: all docs deploy-docs test

all:
	$(MAKE) -C web
	$(MAKE) -C server

docs: docs/* docs/_build/html/.git
	$(MAKE) -C docs html

deploy-docs:
	cd docs/_build/html ; git add --all && git commit -m 'docs: build' -m '[skip ci]' && git push

docs/_build/html/.git:
	git worktree add -f --checkout docs/_build/html gh-pages

test: all
	$(MAKE) -C server test
