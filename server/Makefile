export POETRY_VIRTUALENVS_IN_PROJECT=true

.PHONY: build dev test serve

build: dist .venv

dist: ../web/dist
ifeq ($(OS), Windows_NT)
	-robocopy -mir ../web/dist dist
else
	cp -r ../web/dist .
endif

.venv: poetry.lock vendor/*
	poetry install
	-touch .venv

dev: build
	./scripts/run.sh

test: build
	poetry run python -m tests.generate_test_page
	poetry run python -m pytest --cov csheet

serve: CSHEET_HOST?=0.0.0.0
serve: CSHEET_PORT?=80
serve: build
	poetry run python -m csheet runserver --host $(CSHEET_HOST) --port $(CSHEET_PORT)
