.PHONY: all run test

all: dist .venv/Lib/site-packages

ifeq ($(OS), Windows_NT)
activate=.venv/Scripts/activate
else
activate=.venv/bin/activate
endif

dist: ../web/dist
	cp -r ../web/dist .

.venv/Lib/site-packages: requirements.txt dev-requirements.txt .venv
	. $(activate) && pip install -r requirements.txt -r dev-requirements.txt

.venv:
	virtualenv .venv

run:
	./scripts/run.sh

test:
	./scripts/test.sh
