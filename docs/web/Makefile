# Minimal makefile for Sphinx documentation
#

# You can set these variables from the command line.
SPHINXOPTS    ?=
SPHINXBUILD   ?= poetry run sphinx-build
SOURCEDIR     ?= .
BUILDDIR      ?= _build

# Put it first so that "make" without argument is like "make help".
help:
	@$(SPHINXBUILD) -M help "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)

.PHONY: help Makefile docx

docx: 
	@$(SPHINXBUILD) -M epub "$(SOURCEDIR)" "$(BUILDDIR)" -t docx $(SPHINXOPTS) $(O)
	-mkdir -p _build/docx
	pandoc --data-dir .pandoc -o _build/docx/文档_吾立方色板网页客户端软件.docx _build/epub/sphinx.epub


# Catch-all target: route all unknown targets to Sphinx using the new
# "make mode" option.  $(O) is meant as a shortcut for $(SPHINXOPTS).
%: Makefile
	@$(SPHINXBUILD) -M $@ "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)
