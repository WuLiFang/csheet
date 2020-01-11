.PHONY: build dev test serve

build: dist .venv

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

.venv: export POETRY_VIRTUALENVS_IN_PROJECT=true
.venv: pyproject.toml vendor/*
	poetry install
	$(touch) .venv

dev: build
	./scripts/run.sh

test: build
	. ./.env && poetry run python ./tests/generate_test_page.py
	./scripts/test.sh

serve: export PYTHONPATH=server
serve: export FLASK_APP=csheet:APP
serve: CSHEET_HOST?=0.0.0.0
serve: CSHEET_PORT?=80
serve: build
	poetry run python -m csheet runserver --host $(CSHEET_HOST) --port $(CSHEET_PORT)
