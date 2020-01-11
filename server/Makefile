.PHONY: all dev test serve

all: dist .venv/lib/site-packages

ifeq ($(OS), Windows_NT)
activate=.venv/Scripts/activate
touch=./../scripts/touch.cmd
else
activate=.venv/bin/activate
touch=touch
endif

dist: ../web/dist
ifeq ($(OS), Windows_NT)
	-robocopy -mir ../web/dist dist
else
	cp -r ../web/dist .
endif

.venv/lib/site-packages: requirements.txt dev-requirements.txt .venv vendor/*
	. $(activate) && pip install -r requirements.txt -r dev-requirements.txt
	$(touch) .venv/lib/site-packages

.venv:
	virtualenv .venv

dev:
	./scripts/run.sh

test:
	. $(activate) && . ./.env && export PYTHONPATH && python ./tests/generate_test_page.py
	./scripts/test.sh

serve: export PYTHONPATH=server
serve: export FLASK_APP=csheet:APP
serve: CSHEET_HOST?=0.0.0.0
serve: CSHEET_PORT?=80
serve: all
	. $(activate) && python -m csheet runserver --host $(CSHEET_HOST) --port $(CSHEET_PORT)
