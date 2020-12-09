.PHONY: build

OUTPUTS := $(patsubst %.gql, %.ts, $(wildcard *.gql))

build: $(OUTPUTS) index.ts
	# https://github.com/NateScarlet/gotmpl
	npx prettier --write *.ts

%.ts: %.gql base.ts.gotmpl
	gotmpl -o $@ base.ts.gotmpl

index.ts: $(OUTPUTS)
	echo $(OUTPUTS) | jq -R 'split(" ") | { Files: . }' | gotmpl -o index.mutations.ts index.mutations.ts.gotmpl
