.PHONY: all docker

all:
	$(MAKE) -C web
	$(MAKE) -C server

docker: 
	./scripts/build.py
