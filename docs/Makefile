.PHONY: default html html-all

default: html html-each

SPHINXBUILD   ?= poetry run sphinx-build

html:
	$(SPHINXBUILD) -M html . _build

html-each: export SPHINXOPTS="-c$(CURDIR)"
html-each:
	make -C server html
	make -C web html

