.PHONY: all dev test serve

all: dist .venv/lib/site-packages

ifeq ($(OS), Windows_NT)
touch=./../scripts/touch.cmd
else
touch=touch
endif

dist: ../web/dist
ifeq ($(OS), Windows_NT)
	-robocopy -mir ../web/dist dist
else
	cp -r ../web/dist .
endif

.venv/lib/site-packages: pyproject.toml vendor/*
	poetry install
	$(touch) .venv/lib/site-packages

dev:
	./scripts/run.sh

test:
	. ./.env && poetry run python ./tests/generate_test_page.py
	./scripts/test.sh

serve: export PYTHONPATH=server
serve: export FLASK_APP=csheet:APP
serve: CSHEET_HOST?=0.0.0.0
serve: CSHEET_PORT?=80
serve: all
	poetry run python -m csheet runserver --host $(CSHEET_HOST) --port $(CSHEET_PORT)
